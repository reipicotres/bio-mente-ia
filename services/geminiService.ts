

import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { Article, ChatMessage, DocumentAnalysis } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatKnowledgeBaseForPrompt = (knowledgeBase: Article[]): string => {
  if (knowledgeBase.length === 0) return "";
  const context = knowledgeBase.map(article => `- ${article.title}: ${article.summary}`).join('\n');
  return `**Contexto del Usuario:**\n${context}\n\n`;
}

async function translateToEnglish(text: string): Promise<string> {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Translate to English: "${text}"`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error translating text:", error);
        throw new Error("No se pudo traducir la consulta.");
    }
}

export async function searchScientificLiterature(query: string, knowledgeBase: Article[], existingArticleTitles: string[] = []): Promise<{ articles: Article[], translatedQuery: string }> {
  try {
    const translatedQuery = await translateToEnglish(query);
    const isLoadMore = existingArticleTitles.length > 0;
    const knowledgeContext = formatKnowledgeBaseForPrompt(knowledgeBase);
    
    const prompt = `Eres un asistente experto en buscar artículos científicos reales y verificables.
**Consulta del Usuario:** "${query}" (Traducido: "${translatedQuery}")
${knowledgeContext}
${isLoadMore ? `**Artículos a evitar (ya encontrados):**\n${existingArticleTitles.join('\n')}\n` : ''}
**Instrucciones:**
1.  **Tarea:** Encuentra 3 artículos ${isLoadMore ? '**NUEVOS**' : ''} altamente relevantes para la consulta y el contexto del usuario.
2.  **Fuentes:** Prioriza Google Scholar, PubMed, y editoriales de prestigio.
3.  **Verificación:** Confirma que el título, autores, revista y año son correctos visitando el enlace.
4.  **DOI Crítico:** El DOI debe ser un enlace HTTPS funcional real. Si no lo encuentras, descarta el artículo.
5.  **Resumen y Relevancia:** Genera un resumen (100-150 palabras) y explica por qué es relevante para la consulta original.
6.  **Formato:** Devuelve un array JSON de 3 objetos de artículo. El campo 'authors' debe ser un array de strings. Nada más.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    let jsonText = response.text.trim();
    const startIndex = jsonText.indexOf('[');
    const endIndex = jsonText.lastIndexOf(']');

    if (startIndex === -1 || endIndex === -1) {
      if (isLoadMore) return { articles: [], translatedQuery };
      console.error("Malformed response from AI:", jsonText);
      throw new Error("La IA devolvió una respuesta con formato incorrecto.");
    }
    
    jsonText = jsonText.substring(startIndex, endIndex + 1);
    const parsedArticles = JSON.parse(jsonText);

    const articles: Article[] = parsedArticles.map((article: any): Article => ({
        title: String(article.title || ''),
        authors: Array.isArray(article.authors) ? article.authors.filter(a => typeof a === 'string') : [],
        journal: String(article.journal || ''),
        year: Number(article.year) || new Date().getFullYear(),
        summary: String(article.summary || ''),
        relevance: String(article.relevance || ''),
        doi: String(article.doi || ''),
    }));

    return { articles, translatedQuery };

  } catch (error) {
    console.error("Error searching scientific literature:", error);
    if (error instanceof Error && error.message.includes("JSON.parse")) {
        throw new Error("La IA devolvió una respuesta inesperada. Intenta de nuevo.");
    }
    throw new Error("No se pudieron encontrar artículos. Inténtalo más tarde.");
  }
}

export async function processUploadedDocument(textContent: string, fileName: string): Promise<Article> {
    const prompt = `Analiza el texto de un documento científico y extrae la información en JSON. Usa el nombre del archivo como pista para el título si es necesario. Si falta un dato (ej. DOI), déjalo como string vacío.
**Nombre del archivo:** ${fileName}
**Texto:**
---
${textContent.substring(0, 300000)}
---
**Formato JSON de salida requerido:**`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    authors: { type: Type.ARRAY, items: { type: Type.STRING } },
                    journal: { type: Type.STRING },
                    year: { type: Type.INTEGER },
                    summary: { type: Type.STRING },
                    relevance: { type: Type.STRING, description: "Puntos clave y contribución principal." },
                    doi: { type: Type.STRING }
                },
                required: ['title', 'authors', 'journal', 'year', 'summary', 'relevance', 'doi'],
            }
        },
    });

    const parsedArticle = JSON.parse(response.text);
    const fallbackTitle = fileName.replace(/\.[^/.]+$/, "");

    const newArticle: Article = {
        title: String(parsedArticle.title || fallbackTitle),
        authors: Array.isArray(parsedArticle.authors) ? parsedArticle.authors.map(String) : [],
        journal: String(parsedArticle.journal || 'Fuente Desconocida'),
        year: Number(parsedArticle.year) || new Date().getFullYear(),
        summary: String(parsedArticle.summary || 'No se pudo generar un resumen.'),
        relevance: String(parsedArticle.relevance || 'No se pudo generar análisis de relevancia.'),
        doi: String(parsedArticle.doi || `local-${Date.now()}`),
        fullText: textContent,
    };

    try {
        if (textContent.trim().length > 100) {
            newArticle.analysis = await analyzeDocumentForReading(textContent);
        }
    } catch (e) {
        console.error(`Error durante el análisis detallado de ${fileName}:`, e);
    }
    
    return newArticle;
}

export async function generateBibliography(articles: Article[]): Promise<string> {
    const prompt = `Genera una bibliografía en formato APA 7 para la siguiente lista. Devuelve solo las referencias.
Artículos:
${JSON.stringify(articles, null, 2)}`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return response.text.trim();
}

export async function generateComparison(articles: Article[]): Promise<string> {
    const prompt = `Análisis comparativo en Markdown de los siguientes artículos. Usa estos apartados: **Síntesis General**, **Puntos en Común**, **Diferencias y Contradicciones**, y **Sinergias y Futuras Direcciones**.
Artículos:
${JSON.stringify(articles.map(a => ({ title: a.title, summary: a.summary })), null, 2)}`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.5 }
    });

    return response.text.trim();
}

let chatInstance: Chat | null = null;
let currentArticleDoi: string | null = null;

export async function getChatResponse(article: Article, history: ChatMessage[], newUserMessage: string): Promise<string> {
    if (!chatInstance || currentArticleDoi !== article.doi) {
        const systemInstruction = `Eres un experto en el artículo científico proporcionado. Basa TODAS tus respuestas estrictamente en su contenido. Si no puedes responder con la información dada, dilo claramente.
**Contexto del Artículo:**
- Título: ${article.title}
- Resumen: ${article.summary}`;
        
        chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            })),
        });
        currentArticleDoi = article.doi;
    }
    
    const response = await chatInstance.sendMessage({ message: newUserMessage });
    return response.text;
}

export async function generateCitation(article: Article): Promise<string> {
     const prompt = `Genera una cita en formato APA 7 para este artículo. Devuelve solo la cita.
Artículo:
${JSON.stringify(article, null, 2)}`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return `Aquí tienes la cita en formato APA 7:\n\n${response.text.trim()}`;
}

export async function analyzeDocumentForReading(fullText: string): Promise<DocumentAnalysis> {
    const prompt = `Analiza y estructura el siguiente texto científico en un único objeto JSON con tres claves: "summary" (array de 3-5 puntos clave), "keyConcepts" (array de 5-8 términos técnicos), y "sections" (array de objetos con "title" y "content"). El contenido de las secciones debe reconstruir el texto original sin omitir nada.
**Texto:**
---
${fullText.substring(0, 300000)}
---`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.ARRAY, items: { type: Type.STRING } },
                    keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    sections: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                content: { type: Type.STRING }
                            },
                            required: ['title', 'content']
                        },
                    }
                },
                required: ['summary', 'keyConcepts', 'sections']
            }
        }
    });

    return JSON.parse(response.text) as DocumentAnalysis;
}