import React from 'react';
import { Article } from '../types';
import SearchBar from './SearchBar';
import ArticleCard from './ArticleCard';
import ChatView from './ChatView';
import Loader from './Loader';
import { SparklesIcon } from './icons';
import ComparisonView from './ComparisonView';
import KnowledgeArticleView from './KnowledgeArticleView';

interface MainContentProps {
  isLoading: boolean;
  error: string | null;
  searchResults: Article[];
  selectedArticle: Article | null;
  onSearch: (query: string) => void;
  onSelectArticle: (article: Article) => void;
  onBack: () => void;
  hasSearched: boolean;
  query: string;
  setQuery: (q: string) => void;
  savedArticles: Article[];
  onToggleSave: (article: Article) => void;
  translatedQuery: string | null;
  comparisonResult: { articles: Article[]; analysis: string } | null;
  onEndComparison: () => void;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  useKnowledgeBase: boolean;
  setUseKnowledgeBase: (enabled: boolean) => void;
  selectedKnowledgeArticle: Article | null;
  onCloseKnowledgeArticle: () => void;
  onSearchFromFragment: (fragment: string) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  isLoading,
  error,
  searchResults,
  selectedArticle,
  onSearch,
  onSelectArticle,
  onBack,
  hasSearched,
  query,
  setQuery,
  savedArticles,
  onToggleSave,
  translatedQuery,
  comparisonResult,
  onEndComparison,
  isLoadingMore,
  onLoadMore,
  useKnowledgeBase,
  setUseKnowledgeBase,
  selectedKnowledgeArticle,
  onCloseKnowledgeArticle,
  onSearchFromFragment
}) => {
  const exampleQueries = [
    "últimos avances en terapia CRISPR para distrofia muscular",
    "rol de la microglía en el Alzheimer, artículos recientes",
    "uso de organoides cerebrales para modelar enfermedades",
    "inmunoterapia contra el cáncer antes de 2015"
  ];

  const handleExampleClick = (exampleQuery: string) => {
    setQuery(exampleQuery);
    onSearch(exampleQuery);
  };
  
  const renderContent = () => {
    if (selectedKnowledgeArticle) {
      return (
        <KnowledgeArticleView 
          article={selectedKnowledgeArticle}
          onClose={onCloseKnowledgeArticle}
          onSearchFromFragment={onSearchFromFragment}
        />
      );
    }

    if (isLoading) {
      const loaderText = comparisonResult ? "Generando análisis comparativo..." : "Analizando la literatura científica...";
      return <Loader text={loaderText} />;
    }
    
    if (error) {
      return (
        <div className="mt-6 p-4 text-center text-red-400 bg-red-900/20 border border-red-800 rounded-md">
          {error}
        </div>
      );
    }
    
    if (comparisonResult) {
      return <ComparisonView result={comparisonResult} onBack={onEndComparison} />;
    }

    if (selectedArticle) {
      return <ChatView article={selectedArticle} onBack={onBack} />;
    }
    
    if (hasSearched) {
      return (
        <>
          {translatedQuery && searchResults.length > 0 && (
            <div className="mb-4 p-3 bg-slate-800 rounded-md text-sm text-slate-400 border border-slate-700">
              <p>Mostrando resultados para la consulta traducida: "<em>{translatedQuery}</em>"</p>
            </div>
          )}
          <div className="space-y-4">
            {searchResults.map((article, index) => {
              const isSaved = savedArticles.some(saved => saved.title === article.title);
              return (
                <ArticleCard 
                  key={index} 
                  article={article} 
                  onSelect={() => onSelectArticle(article)}
                  onToggleSave={() => onToggleSave(article)}
                  isSaved={isSaved}
                />
              );
            })}
          </div>
          {hasSearched && !isLoading && searchResults.length > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="flex items-center justify-center px-6 py-2 font-semibold text-cyan-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 hover:border-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Buscando...</span>
                  </>
                ) : (
                  'Buscar más artículos'
                )}
              </button>
            </div>
          )}
        </>
      );
    }

    // Welcome Screen
    return (
      <div className="text-center pt-12">
        <SparklesIcon className="mx-auto h-12 w-12 text-cyan-400" />
        <h2 className="mt-4 text-2xl font-bold text-slate-100">Biblioteca Inteligente</h2>
        <p className="mt-2 text-slate-400">Encuentre artículos, resuma textos y acelere su investigación.</p>
        <div className="mt-8 max-w-2xl mx-auto">
          <p className="text-sm text-slate-300 mb-3">O pruebe con un ejemplo:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {exampleQueries.map((q) => (
              <button
                key={q}
                onClick={() => handleExampleClick(q)}
                className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 hover:border-cyan-600 transition-all text-center"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <SearchBar 
        onSearch={onSearch} 
        query={query} 
        setQuery={setQuery} 
        disabled={isLoading || isLoadingMore}
        useKnowledgeBase={useKnowledgeBase}
        onToggleKnowledgeBase={setUseKnowledgeBase}
      />
      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;