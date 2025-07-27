import React from 'react';
import { Article } from '../types';
import { SparklesIcon, BookmarkIcon, LinkIcon } from './icons';

interface ArticleCardProps {
  article: Article;
  onSelect: () => void;
  onToggleSave: () => void;
  isSaved: boolean;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onSelect, onToggleSave, isSaved }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 hover:border-cyan-600 transition-all duration-300 group">
      <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors">{article.title}</h3>
      <p className="text-sm text-slate-400 mt-1">
        {article.authors.join(', ')} ({article.year}) - <em>{article.journal}</em>
      </p>
      <p className="text-slate-300 mt-4 text-sm leading-relaxed">{article.summary}</p>
      
      <div className="mt-4 p-4 bg-slate-700/50 rounded-md border-l-4 border-cyan-500">
        <div className="flex items-center">
            <SparklesIcon className="h-5 w-5 text-cyan-400 mr-2 flex-shrink-0" />
            <h4 className="font-semibold text-slate-200 text-sm">Relevancia para su Búsqueda</h4>
        </div>
        <p className="text-slate-400 mt-2 text-sm">{article.relevance}</p>
      </div>
      
      <div className="flex justify-between items-center mt-5">
        <button
          onClick={onToggleSave}
          title={isSaved ? "Quitar de Mi Biblioteca" : "Guardar en Mi Biblioteca"}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            isSaved 
            ? 'text-amber-400 bg-amber-900/50 hover:bg-amber-800/70' 
            : 'text-slate-300 bg-slate-700/50 hover:bg-slate-700'
          }`}
          aria-label={isSaved ? "Quitar de la biblioteca" : "Guardar en la biblioteca"}
        >
          <BookmarkIcon className={`h-4 w-4 mr-2 transition-all ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Guardado' : 'Guardar'}
        </button>
        
        <div className="flex items-center gap-3">
            <a
              href={article.doi}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver artículo original (abre en nueva pestaña)"
              onClick={e => e.stopPropagation()}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-slate-300 bg-slate-700/50 hover:bg-slate-700"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              DOI
            </a>
            <button
              onClick={onSelect}
              className="px-4 py-2 text-sm font-medium text-cyan-300 bg-cyan-900/50 rounded-md hover:bg-cyan-800/70 transition-colors"
            >
              Discutir con IA →
            </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;