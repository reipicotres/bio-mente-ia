import React from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  disabled: boolean;
  query: string;
  setQuery: (q: string) => void;
  useKnowledgeBase: boolean;
  onToggleKnowledgeBase: (enabled: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, disabled, query, setQuery, useKnowledgeBase, onToggleKnowledgeBase }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar en la literatura científica (ej. 'terapias génicas para fibrosis quística')..."
        disabled={disabled}
        className="w-full pl-10 pr-56 py-3 text-slate-200 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder:text-slate-500"
      />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-slate-400" />
      </div>

      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <label htmlFor="knowledge-toggle" className="flex items-center cursor-pointer mr-3" title="Usar tus documentos como contexto para la búsqueda">
          <span className="mr-2 text-xs text-slate-400">Usar Base de Conocimiento</span>
          <div className="relative">
            <input 
              id="knowledge-toggle" 
              type="checkbox" 
              className="sr-only" 
              checked={useKnowledgeBase}
              onChange={(e) => onToggleKnowledgeBase(e.target.checked)}
              disabled={disabled}
            />
            <div className={`block w-10 h-6 rounded-full transition-colors ${useKnowledgeBase ? 'bg-cyan-600' : 'bg-slate-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${useKnowledgeBase ? 'translate-x-full' : ''}`}></div>
          </div>
        </label>
        
        <button 
          type="submit" 
          disabled={disabled || !query.trim()}
          className="px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        >
          Buscar
        </button>
      </div>
    </form>
  );
};

export default SearchBar;