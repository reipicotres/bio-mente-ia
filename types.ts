export interface Profile {
  id: string;
  name: string;
  projects: Project[];
  activeProjectId: string | null;
}

export interface Project {
  id: string;
  name:string;
  knowledgeBaseArticles: Article[];
  savedArticles: Article[];
}

export interface Article {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  summary: string;
  relevance: string;
  doi: string;
  fullText?: string;
  analysis?: DocumentAnalysis;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface DocumentAnalysis {
  summary: string[];
  keyConcepts: string[];
  sections: {
    title: string;
    content: string;
  }[];
}