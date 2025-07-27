import React, { useState, useRef, useEffect } from 'react';
import { Article, DocumentAnalysis } from '../types';
import { ArrowLeftIcon, TextSearchIcon, ListIcon, SparklesIcon } from './icons';
import Loader from './Loader';

interface KnowledgeArticleViewProps {
  article: Article;
  onClose: () => void;
  onSearchFromFragment: (fragment: string) => void;
}

interface PopupState {
    visible: boolean;
    x: number;
    y: number;
    text: string;
}

const KnowledgeArticleView: React.FC<KnowledgeArticleViewProps> = ({ article, onClose, onSearchFromFragment }) => {
    const [popup, setPopup] = useState<PopupState>({ visible: false, x: 0, y: 0, text: '' });
    const [activeSection, setActiveSection] = useState<string>('');
    
    const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const contentPanelRef = useRef<HTMLDivElement>(null);
    const analysis = article.analysis;

    useEffect(() => {
        if (!analysis?.sections || analysis.sections.length === 0) return;
        
        setActiveSection(analysis.sections[0].title);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { root: contentPanelRef.current, rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );

        const currentRefs = sectionRefs.current;
        Object.values(currentRefs).forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => {
             Object.values(currentRefs).forEach((ref) => {
                if (ref) observer.unobserve(ref);
            });
        };
    }, [analysis]);

    const handleNavClick = (title: string) => {
        sectionRefs.current[title]?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    };

    const handleSelection = () => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim() || '';

        if (selectedText && selectedText.length > 5) {
            const range = selection?.getRangeAt(0);
            if (!range) return;
            const rect = range.getBoundingClientRect();
            
            setPopup({
                visible: true,
                x: rect.left + rect.width / 2,
                y: rect.top - 10,
                text: selectedText,
            });
        } else {
            setPopup(p => ({ ...p, visible: false }));
        }
    };
    
    useEffect(() => {
        const handleClickOutside = () => {
            if (popup.visible) {
                 setPopup(p => ({ ...p, visible: false }));
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [popup.visible]);

    const handleSearchClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSearchFromFragment(popup.text);
        setPopup({ visible: false, x: 0, y: 0, text: '' });
    }

    const renderContent = () => {
        if (!analysis) {
            return (
                <div className="p-6 text-center mt-8">
                    <h4 className="font-bold text-slate-200">El análisis detallado no está disponible</h4>
                    <p className="text-slate-400 mt-2">
                        Esto puede ocurrir si el documento es muy corto o hubo un error durante el procesamiento inicial.
                    </p>
                    <p className="text-slate-500 mt-6 text-sm">Mostrando el resumen básico extraído durante la carga:</p>
                    <p className="mt-2 text-left bg-slate-900/50 p-4 rounded-md whitespace-pre-wrap">{article.summary}</p>
                </div>
            );
        }
        
        return (
             <div className="flex flex-1 overflow-hidden gap-8 pt-4">
                {/* Left Navigation */}
                <nav className="w-64 flex-shrink-0 overflow-y-auto pr-4 border-r border-slate-700">
                    <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center">
                        <ListIcon className="h-4 w-4 mr-2" />
                        CONTENIDO
                    </h4>
                    <ul className="space-y-1">
                        {analysis.sections.map(({ title }) => (
                            <li key={title}>
                                <button
                                    onClick={() => handleNavClick(title)}
                                    className={`w-full text-left text-sm px-3 py-1.5 rounded-md transition-all duration-200 ${
                                        activeSection === title 
                                        ? 'bg-cyan-600 text-white font-semibold' 
                                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                                    }`}
                                >
                                    {title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Right Content */}
                <main ref={contentPanelRef} className="flex-1 overflow-y-auto" onMouseUp={handleSelection}>
                    <div className="mb-8 p-4 bg-slate-900/50 border-l-4 border-cyan-500 rounded-r-lg">
                         <h3 className="font-bold text-slate-100 flex items-center mb-2"><SparklesIcon className="h-5 w-5 mr-2 text-cyan-400"/>Resumen por IA</h3>
                         <ul className="list-disc list-inside space-y-1 text-slate-300">
                            {analysis.summary.map((point, i) => <li key={i}>{point}</li>)}
                         </ul>
                    </div>
                    <div className="mb-10">
                         <h3 className="font-bold text-slate-100 mb-3">Conceptos Clave</h3>
                         <div className="flex flex-wrap gap-2">
                            {analysis.keyConcepts.map(concept => (
                                <button 
                                    key={concept}
                                    onClick={() => onSearchFromFragment(concept)}
                                    className="px-2.5 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded-full hover:bg-cyan-800 hover:text-white transition-colors"
                                    title={`Buscar sobre "${concept}"`}
                                >
                                    {concept}
                                </button>
                            ))}
                         </div>
                    </div>

                    {analysis.sections.map(({ title, content }) => (
                        <div 
                            key={title} 
                            id={title}
                            ref={el => { sectionRefs.current[title] = el; }}
                            className="mb-8 scroll-mt-24"
                        >
                            <h3 className="text-lg font-semibold text-cyan-400 border-b border-slate-700 pb-2 mb-3">{title}</h3>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{content}</p>
                        </div>
                    ))}
                </main>
             </div>
        );
    }

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col h-[85vh] animate-fade-in">
            {popup.visible && (
                <div 
                    className="fixed z-50 transform -translate-x-1/2 -translate-y-full"
                    style={{ left: popup.x, top: popup.y }}
                    onMouseDown={e => e.stopPropagation()}
                >
                     <button
                        onClick={handleSearchClick}
                        className="flex items-center gap-2 px-3 py-1.5 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-500 transition-all text-sm animate-fade-in"
                        title="Buscar artículos relacionados con este texto"
                     >
                        <TextSearchIcon className="h-4 w-4" />
                        <span>Buscar</span>
                    </button>
                </div>
            )}
            <div className="flex items-start mb-2 border-b border-slate-700 pb-4">
                <button onClick={onClose} className="mr-4 mt-1 p-2 rounded-full hover:bg-slate-700 transition-colors">
                    <ArrowLeftIcon className="h-5 w-5 text-slate-300" />
                </button>
                <div>
                    <h3 className="text-lg font-bold text-slate-100">{article.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">
                        {article.authors.join(', ')} ({article.year})
                    </p>
                </div>
            </div>

            {renderContent()}

        </div>
    );
};

export default KnowledgeArticleView;