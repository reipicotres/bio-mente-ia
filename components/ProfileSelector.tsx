import React, { useState } from 'react';
import { Profile } from '../types';
import { SparklesIcon, UserIcon, PlusIcon } from './icons';

interface ProfileSelectorProps {
  profiles: Profile[];
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (name: string) => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ profiles, onSelectProfile, onCreateProfile }) => {
  const [newProfileName, setNewProfileName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProfileName.trim()) {
      onCreateProfile(newProfileName.trim());
      setNewProfileName('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <SparklesIcon className="mx-auto h-12 w-12 text-cyan-400" />
        <h1 className="mt-4 text-3xl font-bold text-slate-100">Bienvenido a Bio-Mente IA</h1>
        <p className="mt-2 text-lg text-slate-400">Tu asistente inteligente para la investigación científica.</p>
      </div>

      <div className="w-full max-w-md mt-10 bg-slate-800/50 border border-slate-700 rounded-lg p-8">
        <h2 className="text-xl font-semibold text-center text-slate-200">Selecciona tu Perfil</h2>
        
        {profiles.length > 0 && (
          <div className="mt-6 space-y-3">
            {profiles.map(profile => (
              <button
                key={profile.id}
                onClick={() => onSelectProfile(profile.id)}
                className="w-full flex items-center p-4 bg-slate-700 rounded-lg hover:bg-cyan-600 hover:text-white transition-colors duration-200 text-left"
              >
                <UserIcon className="h-5 w-5 mr-3 text-slate-400"/>
                <span className="font-medium text-slate-200">{profile.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-8">
            <p className="text-center text-sm text-slate-500">{profiles.length > 0 ? 'O crea uno nuevo:' : 'Crea un perfil para empezar:'}</p>
            <form onSubmit={handleCreate} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Nombre del nuevo perfil"
                    className="flex-grow p-3 bg-slate-900 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    required
                />
                <button
                    type="submit"
                    disabled={!newProfileName.trim()}
                    className="p-3 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    aria-label="Crear nuevo perfil"
                >
                    <PlusIcon className="h-6 w-6"/>
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;
