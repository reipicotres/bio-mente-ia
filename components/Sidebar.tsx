import React, { useState, useRef } from 'react';
import { Article, Project, Profile } from '../types';
import { BookOpenIcon, UploadIcon, BookmarkIcon, DownloadIcon, ScaleIcon, BrainCircuitIcon, FolderIcon, PlusIcon, ChevronDownIcon, UserIcon } from './icons';

interface ProfileSwitcherProps {
  profiles: Profile[];
  activeProfile: Profile;
  onSwitchProfile: (profileId: string) => void;
  onLogout: () => void;
}

const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ profiles, activeProfile, onSwitchProfile, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleSelect = (profileId: string) => {
        if(profileId !== activeProfile.id) {
            onSwitchProfile(profileId);
        }
        setIsOpen(false);
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative mb-4" ref={dropdownRef}>
            <button onClick={handleToggle} className="w-full flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors">
                <div className="flex items-center truncate">
                    <UserIcon className="h-5 w-5 mr-3 text-cyan-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-100 truncate" title={activeProfile.name}>{activeProfile.name}</span>
                </div>
                <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute z-30 mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg animate-fade-in-fast">
                    <ul className="py-1 max-h-48 overflow-y-auto">
                        {profiles.map(profile => (
                            <li key={profile.id}>
                                <button onClick={() => handleSelect(profile.id)} className={`w-full text-left px-3 py-2 text-sm truncate ${profile.id === activeProfile.id ? 'bg-cyan-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'}`}>
                                    {profile.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-slate-700 p-1">
                        <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:bg-slate-700 rounded-md">
                            Cambiar de Perfil...
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


interface ProjectManagerProps {
  projects: Project[];
  activeProject: Project | undefined;
  onSwitchProject: (projectId: string) => void;
  onNewProject: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, activeProject, onSwitchProject, onNewProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleSelect = (projectId: string) => {
    onSwitchProject(projectId);
    setIsOpen(false);
  };
  
  const handleNewProject = () => {
    onNewProject();
    setIsOpen(false);
  }

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);


  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-3 bg-slate-800/60 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors"
      >
        <div className="flex items-center truncate">
          <FolderIcon className="h-5 w-5 mr-3 text-cyan-400 flex-shrink-0" />
          <span className="font-semibold text-slate-100 truncate" title={activeProject?.name}>{activeProject?.name || 'Seleccionar Proyecto'}</span>
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-lg animate-fade-in-fast">
          <ul className="py-1 max-h-48 overflow-y-auto">
            {projects.map(project => (
              <li key={project.id}>
                <button 
                  onClick={() => handleSelect(project.id)}
                  className={`w-full text-left px-3 py-2 text-sm truncate ${project.id === activeProject?.id ? 'bg-cyan-600 text-white font-bold' : 'text-slate-300 hover:bg-slate-700'}`}
                >
                  {project.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-700 p-1">
            <button onClick={handleNewProject} className="w-full flex items-center px-3 py-2 text-sm text-cyan-400 hover:bg-slate-700 rounded-md">
              <PlusIcon className="h-4 w-4 mr-2" />
              Crear Nuevo Proyecto
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface SidebarProps {
  profiles: Profile[];
  activeProfile: Profile;
  onSwitchProfile: (profileId: string) => void;
  onLogout: () => void;
  projects: Project[];
  activeProject: Project | undefined;
  onSwitchProject: (projectId: string) => void;
  onNewProject: () => void;
  knowledgeBaseArticles: Article[];
  savedArticles: Article[];
  onSelectKnowledgeArticle: (article: Article) => void;
  onSelectArticle: (article: Article) => void;
  onExportBibliography: () => void;
  isBiblioLoading: boolean;
  articlesToCompare: string[];
  onToggleCompare: (articleDoi: string) => void;
  onStartComparison: () => void;
  onFileUpload: (file: File) => void;
  isUploadingDoc: boolean;
  isComparisonLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  profiles,
  activeProfile,
  onSwitchProfile,
  onLogout,
  projects,
  activeProject,
  onSwitchProject,
  onNewProject,
  knowledgeBaseArticles,
  savedArticles,
  onSelectKnowledgeArticle, 
  onSelectArticle, 
  onExportBibliography, 
  isBiblioLoading,
  articlesToCompare,
  onToggleCompare,
  onStartComparison,
  onFileUpload,
  isUploadingDoc,
  isComparisonLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <aside className="w-80 bg-slate-900/70 p-4 border-r border-slate-800 flex flex-col space-y-6">
       <ProfileSwitcher 
        profiles={profiles}
        activeProfile={activeProfile}
        onSwitchProfile={onSwitchProfile}
        onLogout={onLogout}
      />
      <ProjectManager 
        projects={projects}
        activeProject={activeProject}
        onSwitchProject={onSwitchProject}
        onNewProject={onNewProject}
      />
      
      {/* Knowledge Base Section */}
      <div className="flex-shrink-0 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-slate-300 flex items-center">
            <BrainCircuitIcon className="h-5 w-5 mr-2 text-cyan-400" />
            Base de Conocimiento
          </h2>
          <button
            onClick={handleUploadClick}
            disabled={isUploadingDoc || !activeProject}
            className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
            title="Cargar documentos (.txt, .pdf, .docx) a tu base"
          >
            <UploadIcon className="h-4 w-4 mr-1" />
            {isUploadingDoc ? 'Procesando...' : 'Cargar'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,.pdf,.docx"
            style={{ display: 'none' }}
          />
        </div>
        <div className="flex-1 overflow-y-auto pr-1 bg-slate-800/30 p-2 rounded-lg min-h-[100px]">
          {knowledgeBaseArticles.length > 0 ? (
            <ul className="space-y-1">
              {knowledgeBaseArticles.map(article => (
                <li key={article.doi || article.title}>
                  <button 
                    onClick={() => onSelectKnowledgeArticle(article)}
                    className="w-full text-left text-sm text-slate-400 p-2 rounded-md bg-slate-900/50 hover:bg-slate-800/80 hover:text-cyan-300 transition-colors truncate"
                    title={article.title}
                  >
                    {article.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 text-center px-2 py-4">Sube documentos para crear tu base de conocimiento contextual.</p>
          )}
        </div>
      </div>

      {/* My Library Section */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-slate-300 flex items-center">
            <BookmarkIcon className="h-5 w-5 mr-2 text-cyan-400" />
            Mi Biblioteca
          </h2>
          {savedArticles.length > 0 && (
            <button
              onClick={onExportBibliography}
              disabled={isBiblioLoading}
              className="flex items-center text-xs text-cyan-400 hover:text-cyan-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
              title="Exportar bibliografía como APA 7ma Ed."
            >
              <DownloadIcon className="h-4 w-4 mr-1" />
              {isBiblioLoading ? 'Generando...' : 'Exportar'}
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {savedArticles.length > 0 ? (
            <ul className="space-y-1">
              {savedArticles.map(article => (
                <li key={article.doi} className="flex items-center bg-slate-800/50 rounded-md hover:bg-slate-800 transition-colors group">
                   <label className="flex items-center p-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 bg-slate-700 border-slate-600 text-cyan-600 rounded focus:ring-cyan-500 cursor-pointer"
                      checked={articlesToCompare.includes(article.doi)}
                      onChange={() => onToggleCompare(article.doi)}
                      title={`Seleccionar "${article.title}" para comparar`}
                    />
                  </label>
                  <button
                    onClick={() => onSelectArticle(article)}
                    className="flex-1 text-left text-sm text-slate-400 group-hover:text-cyan-300 py-2 pr-2 rounded-md transition-colors truncate"
                    title={article.title}
                  >
                    {article.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 px-2">Sus artículos guardados de las búsquedas aparecerán aquí.</p>
          )}
        </div>
        
        {savedArticles.length > 1 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
                onClick={onStartComparison}
                disabled={articlesToCompare.length < 2 || isComparisonLoading}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-colors disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
                <ScaleIcon className="h-5 w-5 mr-2" />
                Comparar Selección ({articlesToCompare.length})
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
