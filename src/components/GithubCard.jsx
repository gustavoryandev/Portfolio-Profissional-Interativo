import React, { useContext } from 'react';
import { Github, ExternalLink, Users, BookMarked, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

export default function GithubCard({ context }) {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);

  const github = context?.github;
  const profile = github?.profile || {};
  const stats = github?.stats || {};
  
  const reposCount = profile.public_repos || '--';
  const totalStars = stats.totalStars || '--';
  const followers = profile.followers || '--';
  const avatar = profile.avatar;

  return (
    <div className={`my-2 w-full max-w-sm rounded-2xl border p-5 transition-colors duration-300 ${darkMode ? 'bg-[#0f0f0f] border-amber-500/20' : 'bg-white border-gray-200 shadow-sm'}`}>
      
      {/* Header com Avatar */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt="GitHub Avatar" className={`h-12 w-12 rounded-xl border p-0.5 ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`} />
          ) : (
            <div className="rounded-xl p-3 bg-zinc-950 text-white shadow-sm border border-zinc-800">
              <Github className="h-6 w-6" />
            </div>
          )}
          <div>
            <h3 className={`text-[16px] font-bold leading-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>gustavoryan-del</h3>
            <p className={`text-[12px] font-medium ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{t('cards.github.titulo', 'GitHub Developer')}</p>
          </div>
        </div>
        <a href="https://github.com/gustavoryan-del" target="_blank" rel="noreferrer" className={`rounded-lg p-2 transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300 bg-[#1a1a1a]' : 'text-gray-400 hover:text-gray-600 bg-gray-50'}`}>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Grid de Estatísticas Detalhadas */}
      <div className="grid grid-cols-3 gap-2">
        <div className={`rounded-xl border p-3 flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
          <BookMarked size={16} className={darkMode ? 'text-zinc-500 mb-1' : 'text-gray-400 mb-1'} />
          <strong className={`block text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{reposCount}</strong>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Repos</p>
        </div>
        
        <div className={`rounded-xl border p-3 flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
          <Star size={16} className="text-amber-500 mb-1" />
          <strong className="block text-lg font-black text-amber-500">{totalStars}</strong>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Stars</p>
        </div>

        <div className={`rounded-xl border p-3 flex flex-col items-center justify-center transition-colors ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
          <Users size={16} className={darkMode ? 'text-zinc-500 mb-1' : 'text-gray-400 mb-1'} />
          <strong className={`block text-lg font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{followers}</strong>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Followers</p>
        </div>
      </div>
    </div>
  );
}