import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

const translations = {
  pt: { canvas_title: 'Atividades PUC Minas', pending: 'cursos ativos', access: 'Acessar Canvas' },
  en: { canvas_title: 'PUC Minas Assignments', pending: 'active courses', access: 'Go to Canvas' }
};

export default function CanvasCard({ lang = 'pt', context }) {
  const t = translations[lang] || translations.pt;
  
  // Puxa as matérias que você está cursando no semestre
  const canvas = context?.canvas;
  const courses = canvas?.courses || [];

  return (
    <div className="card-surface mt-2 w-full max-w-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-amber-400" size={24} />
          <h3 className="card-heading">{t.canvas_title}</h3>
        </div>
        <ExternalLink size={16} className="cursor-pointer text-zinc-500 transition-colors hover:text-amber-400" />
      </div>

      <ul className="space-y-3">
        {courses.length > 0 ? courses.slice(0, 3).map((course) => (
          <li key={course.id} className="group flex cursor-default items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-3 transition-colors hover:border-amber-500/30">
            <div className="flex-1 overflow-hidden pr-2">
              <p className="text-sm font-semibold truncate text-white" title={course.name}>{course.name}</p>
              <p className="text-[11px] opacity-70 truncate mt-0.5">{course.code}</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap shadow-sm bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {course.state === 'available' ? 'ATIVO' : course.state.toUpperCase()}
            </span>
          </li>
        )) : (
          <li className="text-sm text-zinc-500 text-center py-4 border border-dashed border-zinc-800 rounded-lg">Nenhum curso sincronizado neste momento.</li>
        )}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3 text-xs font-medium text-zinc-500">
        <span>{`${courses.length} ${t.pending}`}</span>
        <button type="button" className="group flex items-center gap-1 text-amber-400 transition-colors hover:text-amber-300">
          {t.access} <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </div>
    </div>
  );
}