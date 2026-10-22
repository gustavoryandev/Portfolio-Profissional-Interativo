import React from 'react';
import { BookOpen, ExternalLink } from 'lucide-react';

// Traduções para os textos fixos do card
const translations = {
  pt: {
    canvas_title: 'Atividades PUC Minas',
    pending: 'tarefas pendentes',
    access: 'Acessar Canvas'
  },
  en: {
    canvas_title: 'PUC Minas Assignments',
    pending: 'pending tasks',
    access: 'Go to Canvas'
  }
};

// Recebe 'lang' via props (ex: <CanvasCard lang="pt" />). Padrão é 'pt'.
const CanvasCard = ({ lang = 'pt' }) => {
  const t = translations[lang] || translations.pt;

  // Lista de atividades cadastradas no Canvas
  const tasks = [
    {
      id: 1,
      title: lang === 'pt' ? 'Trabalho Prático - IA' : 'Practical Assignment - AI',
      course: lang === 'pt' ? 'Engenharia de Software' : 'Software Engineering',
      due: lang === 'pt' ? 'Hoje, 23:59' : 'Today, 11:59 PM',
      status: 'urgent'
    },
    {
      id: 2,
      title: lang === 'pt' ? 'Seminário de Redes' : 'Networking Seminar',
      course: lang === 'pt' ? 'Redes de Computadores' : 'Computer Networks',
      due: lang === 'pt' ? 'Amanhã' : 'Tomorrow',
      status: 'warning'
    },
    {
      id: 3,
      title: lang === 'pt' ? 'Fórum Temático 02' : 'Thematic Forum 02',
      course: lang === 'pt' ? 'Sistemas Distribuídos' : 'Distributed Systems',
      due: '25/10',
      status: 'normal'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-[#8A1538] to-[#600f26] text-white p-5 rounded-2xl shadow-xl w-full max-w-sm mt-2 border border-[#a21c44] hover:shadow-lg hover:shadow-[#8A1538]/20 transition-all duration-300">
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-white" size={24} />
          <h3 className="font-bold text-base">{t.canvas_title}</h3>
        </div>
        <ExternalLink
          size={16}
          className="text-white/60 hover:text-white cursor-pointer transition-colors"
        />
      </div>

      {/* Lista de Atividades */}
      <ul className="space-y-3">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="bg-black/25 hover:bg-black/40 transition-colors p-3 rounded-xl flex justify-between items-center group cursor-default border border-white/5"
          >
            <div className="flex-1 overflow-hidden pr-2">
              <p
                className="text-sm font-semibold truncate"
                title={task.title}
              >
                {task.title}
              </p>
              <p className="text-[11px] opacity-70 truncate mt-0.5">
                {task.course}
              </p>
            </div>
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-sm ${
                task.status === 'urgent'
                  ? 'bg-red-500/90 text-white'
                  : task.status === 'warning'
                  ? 'bg-amber-500/90 text-white'
                  : 'bg-blue-500/90 text-white'
              }`}
            >
              {task.due}
            </span>
          </li>
        ))}
      </ul>

      {/* Rodapé com Contador e Botão de Acesso */}
      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-white/70">
        <span>{`${tasks.length} ${t.pending}`}</span>
        <button
          type="button"
          className="hover:text-white font-medium transition-colors flex items-center gap-1 group"
        >
          {t.access}
          <span className="transform group-hover:translate-x-1 transition-transform">
            →
          </span>
        </button>
      </div>
    </div>
  );
};

export default CanvasCard;