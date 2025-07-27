
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Article, Project, Profile } from './types';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Header from './components/Header';
import Modal from './components/Modal';
import { searchScientificLiterature, generateBibliography, generateComparison, processUploadedDocument } from './services/geminiService';
import { parseDocument } from './services/documentParser';
import ProfileSelector from './components/ProfileSelector';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [query, setQuery] = useState('');
  
  const [translatedQuery, setTranslatedQuery] = useState<string | null>(null);

  const [isBiblioLoading, setIsBiblioLoading] = useState<boolean>(false);
  const [isBiblioModalOpen, setIsBiblioModalOpen] = useState<boolean>(false);
  const [bibliographyContent, setBibliographyContent] = useState<string>('');
  const [copyButtonText, setCopyButtonText] = useState<string>('Copiar al portapapeles');

  const [articlesToCompare, setArticlesToCompare] = useState<string[]>([]);
  const [isComparisonLoading, setIsComparisonLoading] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<{ articles: Article[]; analysis: string } | null>(null);
  
  const [isUploadingDoc, setIsUploadingDoc] = useState<boolean>(false);
  
  const [useKnowledgeBase, setUseKnowledgeBase] = useState<boolean>(true);
  const [selectedKnowledgeArticle, setSelectedKnowledgeArticle] = useState<Article | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Find active profile and project
  const activeProfile = useMemo(() => {
    return profiles.find(p => p.id === activeProfileId);
  }, [profiles, activeProfileId]);

  const activeProject = useMemo(() => {
    return activeProfile?.projects.find(p => p.id === activeProfile.activeProjectId);
  }, [activeProfile]);

  const knowledgeBaseArticles = activeProject?.knowledgeBaseArticles || [];
  const savedArticles = activeProject?.savedArticles || [];

  // Load profiles from localStorage on initial render
  useEffect(() => {
    try {
        const savedProfiles = localStorage.getItem('bioMenteProfiles');
        const savedActiveId = localStorage.getItem('bioMenteActiveProfileId');
        
        if (savedProfiles) {
            const loadedProfiles: Profile[] = JSON.parse(savedProfiles);
            if (loadedProfiles.length > 0) {
              setProfiles(loadedProfiles);
              if (savedActiveId && loadedProfiles.some(p => p.id === savedActiveId)) {
                setActiveProfileId(savedActiveId);
              }
            }
        }
    } catch (e) {
        console.error("Failed to load profiles from localStorage", e);
    }
    setIsInitialLoad(false);
  }, []);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    try {
        if(profiles.length > 0) {
            localStorage.setItem('bioMenteProfiles', JSON.stringify(profiles));
        }
        if(activeProfileId) {
            localStorage.setItem('bioMenteActiveProfileId', activeProfileId);
        } else {
            localStorage.removeItem('bioMenteActiveProfileId');
        }
    } catch (e) {
        console.error("Failed to save profiles to localStorage", e);
    }
  }, [profiles, activeProfileId]);

  const clearMainContent = () => {
    setSelectedArticle(null);
    setSelectedKnowledgeArticle(null);
    setComparisonResult(null);
    setHasSearched(false);
    setSearchResults([]);
    setError(null);
    setQuery('');
  }

  const handleCreateProfile = (name: string) => {
    const newProfile: Profile = {
        id: `profile-${Date.now()}`,
        name,
        projects: [],
        activeProjectId: null,
    };
    const defaultProject: Project = {
        id: `proj-${Date.now()}`,
        name: 'Mi Primer Proyecto',
        knowledgeBaseArticles: [],
        savedArticles: []
    };
    newProfile.projects.push(defaultProject);
    newProfile.activeProjectId = defaultProject.id;
    
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
  };

  const handleSelectProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    clearMainContent();
  };

  const handleLogout = () => {
    setActiveProfileId(null);
    clearMainContent();
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim() || !activeProfileId) return;
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      knowledgeBaseArticles: [],
      savedArticles: [],
    };
    setProfiles(prev => prev.map(p => {
      if (p.id === activeProfileId) {
        return {
          ...p,
          projects: [...p.projects, newProject],
          activeProjectId: newProject.id,
        };
      }
      return p;
    }));
    setIsProjectModalOpen(false);
    setNewProjectName('');
    clearMainContent();
  };

  const handleSwitchProject = (projectId: string) => {
    if (!activeProfileId || projectId === activeProject?.id) return;
    setProfiles(prev => prev.map(p =>
      p.id === activeProfileId ? { ...p, activeProjectId: projectId } : p
    ));
    clearMainContent();
  };

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !activeProject) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedArticle(null);
    setSelectedKnowledgeArticle(null);
    setComparisonResult(null);
    setTranslatedQuery(null);
    setSearchResults([]); 

    try {
      const contextArticles = useKnowledgeBase ? activeProject.knowledgeBaseArticles : [];
      const results = await searchScientificLiterature(searchQuery, contextArticles);
      setSearchResults(results.articles);
      setTranslatedQuery(results.translatedQuery);
      if (results.articles.length === 0) {
        setError("No se encontraron artículos. Intente con otra consulta.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado durante la búsqueda.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeProject, useKnowledgeBase]);

  const handleSearchFromFragment = useCallback(async (fragment: string) => {
    setQuery(fragment);
    setUseKnowledgeBase(false);
    await handleSearch(fragment);
  }, [handleSearch]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !activeProject) return;

    setIsLoadingMore(true);
    setError(null);

    try {
        const existingTitles = searchResults.map(a => a.title);
        const contextArticles = useKnowledgeBase ? activeProject.knowledgeBaseArticles : [];
        const results = await searchScientificLiterature(query, contextArticles, existingTitles);
        setSearchResults(prev => [...prev, ...results.articles]);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Ocurrió un error inesperado al cargar más artículos.");
    } finally {
        setIsLoadingMore(false);
    }
  }, [query, isLoading, isLoadingMore, searchResults, useKnowledgeBase, activeProject]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!activeProfileId || !activeProject) return;
    setIsUploadingDoc(true);
    setError(null);
    try {
      const textContent = await parseDocument(file);
      if (!textContent.trim()) {
        throw new Error("El documento está vacío o no se pudo extraer el texto.");
      }
      const newArticle = await processUploadedDocument(textContent, file.name);
      
      setProfiles(prevProfiles => prevProfiles.map(profile => {
        if (profile.id === activeProfileId) {
          return {
            ...profile,
            projects: profile.projects.map(p =>
              p.id === activeProject.id
              ? { ...p, knowledgeBaseArticles: [newArticle, ...p.knowledgeBaseArticles] }
              : p
            )
          };
        }
        return profile;
      }));

    } catch (err) {
      const errorMessage = err instanceof Error ? `Error al procesar ${file.name}: ${err.message}` : "Ocurrió un error inesperado.";
      setError(errorMessage);
    } finally {
      setIsUploadingDoc(false);
    }
  }, [activeProfileId, activeProject]);

  const handleToggleSave = useCallback((articleToToggle: Article) => {
    if (!activeProfileId || !activeProject) return;
    setProfiles(prevProfiles => prevProfiles.map(profile => {
      if (profile.id === activeProfileId) {
        return {
          ...profile,
          projects: profile.projects.map(p => {
            if (p.id === activeProject.id) {
              const isSaved = p.savedArticles.some(a => a.doi === articleToToggle.doi);
              const newSavedArticles = isSaved
                ? p.savedArticles.filter(a => a.doi !== articleToToggle.doi)
                : [articleToToggle, ...p.savedArticles];
              return { ...p, savedArticles: newSavedArticles };
            }
            return p;
          })
        };
      }
      return profile;
    }));
  }, [activeProfileId, activeProject]);

  const handleToggleCompare = useCallback((doi: string) => {
    setArticlesToCompare(prev => {
        if (prev.includes(doi)) {
            return prev.filter(d => d !== doi);
        } else {
            return [...prev, doi];
        }
    });
  }, []);

  const handleStartComparison = useCallback(async () => {
    if (articlesToCompare.length < 2 || !activeProject) return;
    
    setIsComparisonLoading(true);
    setIsLoading(true);
    setError(null);
    setSelectedArticle(null);
    setHasSearched(false);

    try {
      const allArticles = [...savedArticles, ...knowledgeBaseArticles, ...searchResults];
      const articlesForComparison = allArticles.filter(a => articlesToCompare.includes(a.doi));
      const uniqueArticles = Array.from(new Map(articlesForComparison.map(a => [a.doi, a])).values());

      if (uniqueArticles.length >= 2) {
        const analysis = await generateComparison(uniqueArticles);
        setComparisonResult({ articles: uniqueArticles, analysis });
      } else {
        throw new Error("No se encontraron suficientes artículos para comparar.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al generar la comparación.");
    } finally {
      setIsComparisonLoading(false);
      setIsLoading(false);
      setArticlesToCompare([]);
    }
  }, [articlesToCompare, activeProject, savedArticles, knowledgeBaseArticles, searchResults]);

  const handleExportBibliography = async () => {
    if (!activeProject || savedArticles.length === 0) return;
    setIsBiblioLoading(true);
    try {
      const bib = await generateBibliography(savedArticles);
      setBibliographyContent(bib);
      setIsBiblioModalOpen(true);
      setCopyButtonText('Copiar al portapapeles');
    } catch (error) {
      setError("Error al generar la bibliografía.");
    } finally {
      setIsBiblioLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(bibliographyContent)
      .then(() => setCopyButtonText('¡Copiado!'))
      .catch(() => setCopyButtonText('Error al copiar'));
  };

  if (isInitialLoad) {
      return <div className="bg-slate-900 h-screen w-screen flex items-center justify-center"><Loader text="Cargando entorno..." /></div>;
  }
  
  if (!activeProfileId || !activeProfile) {
      return (
          <ProfileSelector 
              profiles={profiles}
              onSelectProfile={handleSelectProfile}
              onCreateProfile={handleCreateProfile}
          />
      );
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-300 font-sans">
        <Sidebar
            profiles={profiles}
            activeProfile={activeProfile}
            onSwitchProfile={handleSelectProfile}
            onLogout={handleLogout}
            projects={activeProfile.projects}
            activeProject={activeProject}
            onSwitchProject={handleSwitchProject}
            onNewProject={() => setIsProjectModalOpen(true)}
            knowledgeBaseArticles={knowledgeBaseArticles}
            savedArticles={savedArticles}
            onSelectKnowledgeArticle={setSelectedKnowledgeArticle}
            onSelectArticle={setSelectedArticle}
            onExportBibliography={handleExportBibliography}
            isBiblioLoading={isBiblioLoading}
            articlesToCompare={articlesToCompare}
            onToggleCompare={handleToggleCompare}
            onStartComparison={handleStartComparison}
            onFileUpload={handleFileUpload}
            isUploadingDoc={isUploadingDoc}
            isComparisonLoading={isComparisonLoading}
        />
        <main className="flex-1 flex flex-col overflow-y-auto">
            <Header 
                activeProfileName={activeProfile.name}
                activeProjectName={activeProject?.name} 
            />
             <div className="flex-1 p-6 overflow-y-auto">
                {activeProject ? (
                    <MainContent
                        isLoading={isLoading}
                        error={error}
                        searchResults={searchResults}
                        selectedArticle={selectedArticle}
                        onSearch={handleSearch}
                        onSelectArticle={setSelectedArticle}
                        onBack={() => setSelectedArticle(null)}
                        hasSearched={hasSearched}
                        query={query}
                        setQuery={setQuery}
                        savedArticles={savedArticles}
                        onToggleSave={handleToggleSave}
                        translatedQuery={translatedQuery}
                        comparisonResult={comparisonResult}
                        onEndComparison={() => setComparisonResult(null)}
                        isLoadingMore={isLoadingMore}
                        onLoadMore={handleLoadMore}
                        useKnowledgeBase={useKnowledgeBase}
                        setUseKnowledgeBase={setUseKnowledgeBase}
                        selectedKnowledgeArticle={selectedKnowledgeArticle}
                        onCloseKnowledgeArticle={() => setSelectedKnowledgeArticle(null)}
                        onSearchFromFragment={handleSearchFromFragment}
                    />
                ) : (
                    <div className="text-center pt-12">
                         <h2 className="mt-4 text-2xl font-bold text-slate-100">Bienvenido, {activeProfile.name}</h2>
                        <p className="mt-2 text-slate-400">No tienes ningún proyecto. Crea uno para empezar.</p>
                         <button onClick={() => setIsProjectModalOpen(true)} className="mt-6 px-4 py-2 bg-cyan-600 text-white rounded-md font-medium hover:bg-cyan-700 transition-colors">
                            Crear tu primer proyecto
                        </button>
                    </div>
                )}
            </div>
        </main>

      <Modal isOpen={isBiblioModalOpen} onClose={() => setIsBiblioModalOpen(false)} title="Bibliografía (Formato APA 7)">
        <textarea
          readOnly
          className="w-full h-64 bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-300"
          value={bibliographyContent}
        />
        <button
          onClick={handleCopyToClipboard}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors"
        >
          {copyButtonText}
        </button>
      </Modal>

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Crear Nuevo Proyecto">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Nombre del nuevo proyecto"
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400"
            autoFocus
          />
          <button
            onClick={handleCreateProject}
            disabled={!newProjectName.trim()}
            className="mt-4 w-full px-4 py-2 bg-cyan-600 text-white rounded-md text-sm font-medium hover:bg-cyan-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Crear Proyecto
          </button>
      </Modal>
    </div>
  );
};

export default App;
