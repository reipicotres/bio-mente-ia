import React from 'react';
import { SparklesIcon } from './icons';

interface HeaderProps {
    activeProfileName?: string;
    activeProjectName?: string;
}

const Header: React.FC<HeaderProps> = ({ activeProfileName, activeProjectName }) => {
  return (
    <header className="flex items-center p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm z-10 sticky top-0">
      <SparklesIcon className="h-6 w-6 text-cyan-400" />
      <h1 className="ml-3 text-xl font-bold text-slate-100 hidden sm:inline">Bio-Mente IA</h1>
      
      {activeProfileName && (
        <>
            <span className="mx-2 text-slate-500">/</span>
            <span className="text-lg font-medium text-slate-300 truncate">{activeProfileName}</span>
        </>
      )}

      {activeProjectName && (
        <>
            <span className="mx-2 text-slate-500">/</span>
            <span className="text-lg font-medium text-cyan-300 truncate">{activeProjectName}</span>
        </>
      )}
    </header>
  );
};

export default Header;
