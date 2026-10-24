import React, { useContext } from 'react';
import { ExternalLink, FolderGit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';
import perfil from '../data/perfil.json';

export default function ProjectsCard() {
  const { darkMode } = useContext(ThemeContext);
  const { t } = useTranslation();
  
  // Pega apenas os projetos fixos do perfil.json
  const displayProjects = perfil.projetos.slice(0, 4);

  return (
    <div className={`my-2 w-full max-w-lg rounded-2xl border p-5 transition-colors duration-300 ${darkMode ? 'bg-[#0f0f0f] border-amber-500/20' : 'bg-white border-gray-200 shadow-sm'}`}>
      
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-zinc-950 text-amber-500 shadow-sm border border-zinc-800">
            <FolderGit2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-[17px] font-bold leading-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Projetos em Destaque</h3>
            <p className={`text-[12px] font-medium ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
              Projetos selecionados do portfólio
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {displayProjects.map((project, index) => {
          const projectTitle = project.chavesI18n ? t(project.chavesI18n.titulo) : project.id;
          const projectDesc = project.chavesI18n ? t(project.chavesI18n.descricao) : '';

          return (
            <a
              key={project.id || index}
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className={`group block rounded-xl border p-3.5 transition-all hover:shadow-md ${darkMode ? 'bg-[#141414] border-[#2a2a2a] hover:border-amber-500/40' : 'bg-white border-gray-100 hover:border-amber-400/50'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className={`truncate text-[15px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {projectTitle}
                  </h4>
                  {projectDesc && (
                    <p className={`mt-1 line-clamp-2 text-[12px] ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                      {projectDesc}
                    </p>
                  )}
                </div>
                <ExternalLink size={16} className={`shrink-0 transition-colors ${darkMode ? 'text-zinc-600 group-hover:text-amber-400' : 'text-gray-400 group-hover:text-amber-500'}`} />
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                {(project.techs || []).map((tech) => (
                  <span 
                    key={tech} 
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${darkMode ? 'border-zinc-800 bg-[#1f1f1f] text-zinc-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}