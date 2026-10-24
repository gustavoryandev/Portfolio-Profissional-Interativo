import React, { useContext } from 'react';
import { ExternalLink, GitFork, Star, Github } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function RepositoriesCard({ context }) {
  const { darkMode } = useContext(ThemeContext);
  
  // Tenta pegar os repositórios ao vivo da API do Github enviados pelo backend
  const liveRepos = context?.github?.repositories || [];
  const displayRepos = liveRepos.slice(0, 4);

  return (
    <div className={`my-2 w-full max-w-lg rounded-2xl border p-5 transition-colors duration-300 ${darkMode ? 'bg-[#0f0f0f] border-amber-500/20' : 'bg-white border-gray-200 shadow-sm'}`}>
      
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-zinc-950 text-amber-500 shadow-sm border border-zinc-800">
            <Github className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-[17px] font-bold leading-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Repositórios Recentes</h3>
            <p className={`text-[12px] font-medium ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              Sincronizado ao vivo do GitHub
            </p>
          </div>
        </div>
        <a href="https://github.com/gustavoryan-del?tab=repositories" target="_blank" rel="noreferrer" className={`hidden sm:flex rounded-lg p-2 transition-colors ${darkMode ? 'bg-[#1a1a1a] text-gray-400 hover:text-amber-400 border border-[#2a2a2a]' : 'bg-gray-50 text-gray-500 hover:text-amber-500 border border-gray-200'}`}>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="space-y-3">
        {displayRepos.length > 0 ? (
          displayRepos.map((repo, index) => (
            <a
              key={repo.name || index}
              href={repo.url || `https://github.com/gustavoryan-del/${repo.name}`}
              target="_blank"
              rel="noreferrer"
              className={`group block rounded-xl border p-3.5 transition-all hover:shadow-md ${darkMode ? 'bg-[#141414] border-[#2a2a2a] hover:border-amber-500/40' : 'bg-white border-gray-100 hover:border-amber-400/50'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`truncate text-[15px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {repo.name}
                    </h4>
                    {repo.stars > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                        <Star size={10} className="fill-amber-500" /> {repo.stars}
                      </span>
                    )}
                    {repo.forks > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full border border-blue-500/20">
                        <GitFork size={10} className="fill-blue-500" /> {repo.forks}
                      </span>
                    )}
                  </div>
                  
                  {repo.description && (
                    <p className={`mt-1 line-clamp-2 text-[12px] ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                      {repo.description}
                    </p>
                  )}
                </div>
                <ExternalLink size={16} className={`shrink-0 transition-colors ${darkMode ? 'text-zinc-600 group-hover:text-amber-400' : 'text-gray-400 group-hover:text-amber-500'}`} />
              </div>
              
              {repo.language && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${darkMode ? 'border-zinc-800 bg-[#1f1f1f] text-zinc-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                    {repo.language}
                  </span>
                </div>
              )}
            </a>
          ))
        ) : (
          <div className={`py-6 text-center text-sm rounded-xl border border-dashed flex flex-col items-center gap-2 ${darkMode ? 'text-zinc-500 border-zinc-800 bg-[#141414]' : 'text-zinc-400 border-gray-200 bg-gray-50'}`}>
            <p>Nenhum repositório listado no momento.</p>
            <a href="https://github.com/gustavoryan-del?tab=repositories" target="_blank" rel="noreferrer" className="text-amber-500 font-bold hover:underline">
              Ver no GitHub
            </a>
          </div>
        )}
      </div>
    </div>
  );
}