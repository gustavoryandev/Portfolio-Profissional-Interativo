import React, { useContext } from 'react';
import { BookOpen, ExternalLink, GraduationCap, LayoutDashboard, Clock } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const translations = {
  pt: { 
    canvas_title: 'PUC Minas (Canvas)', 
    overview: 'Visão Geral',
    active_courses: 'Disciplinas ativas',
    status: 'Status Regular',
    access: 'Acessar Ambiente Virtual',
    course_active: 'EM CURSO',
    empty: 'Nenhuma disciplina ativa no momento.'
  },
  en: { 
    canvas_title: 'PUC Minas (Canvas)', 
    overview: 'Overview',
    active_courses: 'Active courses',
    status: 'Regular Status',
    access: 'Access Virtual Environment',
    course_active: 'IN PROGRESS',
    empty: 'No active courses at the moment.'
  }
};

export default function CanvasCard({ lang = 'pt', context }) {
  const { darkMode } = useContext(ThemeContext);
  const t = translations[lang] || translations.pt;
  
  // Mapeando dados em tempo real da API do Canvas
  const courses = context?.canvas?.courses || [];
  const activeCount = courses.length;

  return (
    <div className={`my-2 w-full max-w-2xl rounded-2xl border p-5 transition-colors duration-300 ${darkMode ? 'bg-[#0f0f0f] border-amber-500/20' : 'bg-white border-gray-200 shadow-sm'}`}>
      
      {/* Header do Card */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-zinc-950 text-amber-500 shadow-sm border border-zinc-800">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className={`text-[17px] font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t.canvas_title}</h3>
            <p className={`text-[12px] font-medium ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>Aluno: Gustavo Ryan (Eng. Software)</p>
          </div>
        </div>
        <a href="https://pucminas.instructure.com/" target="_blank" rel="noreferrer" className={`hidden sm:flex rounded-lg p-2 transition-colors ${darkMode ? 'bg-[#1a1a1a] text-gray-400 hover:text-amber-400 border border-[#2a2a2a]' : 'bg-gray-50 text-gray-500 hover:text-amber-500 border border-gray-200'}`}>
          <LayoutDashboard className="h-4 w-4" />
        </a>
      </div>

      {/* KPI Cards (Métricas Rápidas) */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className={`rounded-xl border p-3.5 flex flex-col justify-center transition-colors ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{t.overview}</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{activeCount}</span>
            <span className={`text-[12px] font-medium ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{t.active_courses}</span>
          </div>
        </div>
        
        <div className={`rounded-xl border p-3.5 flex flex-col justify-center transition-colors ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
          <span className={`text-[11px] font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>Situação</span>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className={`text-[13px] font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{t.status}</span>
          </div>
        </div>
      </div>

      {/* Lista de Disciplinas */}
      <div className="flex flex-col gap-2.5">
        {courses.length > 0 ? courses.slice(0, 4).map((course, i) => (
          <div key={course.id || i} className={`group flex items-center justify-between rounded-xl border p-3 transition-all hover:border-amber-500/30 ${darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-white border-gray-100 hover:shadow-md'}`}>
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className={`shrink-0 rounded-lg p-2.5 transition-colors ${darkMode ? 'bg-[#222] text-amber-500/70 group-hover:text-amber-500' : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'}`}>
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`truncate text-[14px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{course.name}</p>
                <p className={`truncate text-[12px] ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{course.code}</p>
              </div>
            </div>
            <span className="hidden sm:inline-block ml-3 shrink-0 rounded-full border border-emerald-800/30 bg-emerald-900/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              {t.course_active}
            </span>
          </div>
        )) : (
          <div className={`py-6 text-center text-sm rounded-xl border border-dashed ${darkMode ? 'text-zinc-500 border-zinc-800 bg-[#141414]' : 'text-zinc-400 border-gray-200 bg-gray-50'}`}>
            {t.empty}
          </div>
        )}
      </div>

      {/* Footer do Card */}
      <div className={`mt-5 flex items-center justify-between border-t pt-4 ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <div className="flex items-center gap-1.5">
            <Clock size={14} className={darkMode ? 'text-zinc-500' : 'text-gray-400'} />
            <span className={`text-[12px] font-medium ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Sincronizado ao vivo</span>
        </div>
        <a href="https://pucminas.instructure.com/" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[13px] font-bold text-amber-500 transition-colors hover:text-amber-400">
          {t.access} <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}