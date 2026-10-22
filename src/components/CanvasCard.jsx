import React, { useContext } from 'react';
import { Code, Monitor, Users, Clipboard, ExternalLink } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const translations = {
  pt: { canvas_title: 'Atividades PUC Minas', pending: 'tarefas pendentes', access: 'Acessar Canvas' },
  en: { canvas_title: 'PUC Minas Assignments', pending: 'pending tasks', access: 'Go to Canvas' }
};

export default function CanvasCard({ lang = 'pt', context }) {
  const { darkMode } = useContext(ThemeContext);
  const t = translations[lang] || translations.pt;

  return (
    <div className={`my-2 w-full max-w-2xl rounded-2xl border p-5 transition-colors duration-300 ${darkMode ? 'bg-[#0f0f0f] border-amber-500/20' : 'bg-white border-gray-200 shadow-sm'}`}>
      
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-zinc-950 text-white shadow-sm border border-zinc-800">
            <Code className="h-5 w-5" />
          </div>
          <h3 className={`text-[17px] font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{t.canvas_title}</h3>
        </div>
        <button className={`rounded-lg p-2 transition-colors ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
          <ExternalLink className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Item 1 */}
        <div className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-500 p-3 text-black shadow-sm">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-[15px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Trabalho Prático - IA</p>
              <p className={`text-[13px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Engenharia de Software</p>
            </div>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-4 py-1.5 text-[13px] font-bold text-amber-500 shadow-sm">
            Hoje, 23:59
          </span>
        </div>

        {/* Item 2 */}
        <div className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`rounded-xl p-3 shadow-sm ${darkMode ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-700 text-white'}`}>
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-[15px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Seminário de Redes</p>
              <p className={`text-[13px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Redes de Computadores</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-800/50 bg-emerald-900/30 px-4 py-1.5 text-[13px] font-bold text-emerald-400 shadow-sm">
            Amanhã
          </span>
        </div>

        {/* Item 3 */}
        <div className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors ${darkMode ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center gap-4">
            <div className={`rounded-xl p-3 shadow-sm ${darkMode ? 'bg-[#2a2a2a] text-gray-300' : 'bg-gray-600 text-white'}`}>
              <Clipboard className="h-6 w-6" />
            </div>
            <div>
              <p className={`text-[15px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Fórum Temático 02</p>
              <p className={`text-[13px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sistemas Distribuídos</p>
            </div>
          </div>
          <span className={`rounded-full border px-4 py-1.5 text-[13px] font-bold shadow-sm ${darkMode ? 'bg-[#2a2a2a] border-[#333] text-gray-300' : 'bg-gray-200 border-gray-300 text-gray-700'}`}>
            25/10
          </span>
        </div>
      </div>

      <div className={`mt-5 flex items-center justify-between border-t pt-4 ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <span className={`text-[13px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>3 {t.pending}</span>
        <a href="https://pucminas.instructure.com/" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[13px] font-bold text-amber-500 transition-colors hover:text-amber-400">
          {t.access} &rarr;
        </a>
      </div>
    </div>
  );
}