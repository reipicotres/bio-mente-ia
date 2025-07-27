import React from 'react';
import { Article } from '../types';
import { ArrowLeftIcon, ScaleIcon } from './icons';

interface ComparisonViewProps {
  result: {
    articles: Article[];
    analysis: string;
  };
  onBack: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ result, onBack }) => {
  const { articles, analysis } = result;

  // Enhance analysis text for rendering
  const formattedAnalysis = analysis
    .split('\n')
    .map(line => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return { type: 'heading', content: line.replace(/\*\*/g, '') };
      }
      return { type: 'paragraph', content: line };
    });

  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 animate-fade-in">
      <div className="flex items-center mb-6 border-b border-slate-700 pb-4">
        <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 text-slate-300" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center">
            <ScaleIcon className="h-6 w-6 mr-3 text-cyan-400" />
            Análisis Comparativo
          </h2>
          <p className="text-sm text-slate-400">Comparando {articles.length} artículos de tu biblioteca.</p>
        </div>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        {formattedAnalysis.map((line, index) => {
          if (line.type === 'heading') {
            return <h3 key={index} className="text-cyan-400 font-semibold mt-6 mb-2">{line.content}</h3>;
          }
          return <p key={index} className="text-slate-300 leading-relaxed">{line.content}</p>;
        })}
      </div>

      <div className="mt-8">
        <h4 className="font-semibold text-slate-200 mb-3">Artículos Analizados:</h4>
        <ul className="space-y-2">
            {articles.map(article => (
                <li key={article.doi} className="p-3 bg-slate-900/50 rounded-md border-l-4 border-slate-600">
                    <p className="font-semibold text-slate-200">{article.title}</p>
                    <p className="text-xs text-slate-400">{article.authors.join(', ')} ({article.year})</p>
                </li>
            ))}
        </ul>
      </div>

    </div>
  );
};

export default ComparisonView;