// No hay importaciones estáticas de librerías pesadas en la parte superior del fichero.
// Todas las librerías de análisis se importan dinámicamente dentro de la función que las necesita.
// Esto evita que estas librerías bloqueen la carga inicial de la aplicación, garantizando
// que la aplicación se inicie de forma rápida y robusta.

async function getTextFromFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string);
    };
    reader.onerror = (error) => {
      reject(new Error("Error al leer el archivo de texto."));
    };
    reader.readAsText(file);
  });
}

async function getTextFromPdf(file: File): Promise<string> {
    // Importa dinámicamente pdf.js solo cuando se está procesando un PDF.
    const pdfjsLib = await import('pdfjs-dist');
    
    // Es CRUCIAL establecer el 'workerSrc'. Apunta al script que maneja el procesamiento de PDF en un hilo separado.
    // Esta ruta debe ser correcta y coincidir con la versión del importmap.
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.5.136/build/pdf.worker.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
        fullText += pageText + '\n\n';
    }
    return fullText;
}

async function getTextFromDocx(file: File): Promise<string> {
    // Importa dinámicamente mammoth.js solo cuando se procesa un archivo .docx.
    const mammothModule = await import('mammoth');
    // La compilación del navegador .mjs de mammoth exporta la librería como un objeto por defecto.
    const mammoth = mammothModule.default;
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
}

export async function parseDocument(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'txt':
            return getTextFromFile(file);
        case 'pdf':
            return getTextFromPdf(file);
        case 'docx':
            return getTextFromDocx(file);
        default:
            throw new Error(`Formato de archivo no soportado: .${extension}`);
    }
}
