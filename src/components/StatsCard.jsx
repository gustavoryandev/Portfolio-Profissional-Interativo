import React, { useContext } from 'react';
import { Terminal, Clock, Calendar, Code2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

export default function StatsCard({ context }) {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);

  const wakatime = context?.wakatime;
  const summary = wakatime?.summary || {};
  const languages = wakatime?.languages || [];
  const isConfigured = wakatime?.status === 'ok';

  // Componente interno para as Top métricas
  const HeaderBlock = ({ icon, label, value, sub }) => (
    <div className={`flex flex-col rounded-xl p-3 transition-colors ${darkMode ? 'bg-[#141414] border border-[#222]' : 'bg-white border border-gray-200 shadow-sm'}`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase mb-1 ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
        {React.cloneElement(icon, { size: 12, className: 'text-amber-500' })}
        {label}
      </div>
      <strong className={`text-[17px] font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value || '--'}
      </strong>
      <p className={`mt-0.5 text-[11px] ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{sub}</p>
    </div>
  );

  // Círculo SVG de Progresso
  const CircularProgress = ({ percent, color = '#f59e0b' }) => {
    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    
    return (
      <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 50 50">
        <circle cx="25" cy="25" r={radius} strokeWidth="4" fill="none" className={darkMode ? 'stroke-[#222]' : 'stroke-gray-200'} />
        <circle 
          cx="25" cy="25" r={radius} strokeWidth="4" fill="none" stroke={color}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
    );
  };

  // Cores dinâmicas para as linguagens
  const getLanguageColor = (name) => {
    const colors = { Java: '#e37400', JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', HTML: '#e34c26', CSS: '#563d7c', Bash: '#89e051', Markdown: '#083fa1', XML: '#0060ac' };
    return colors[name] || '#f59e0b';
  };

  return (
    <article className={`my-3 w-full max-w-[800px] rounded-2xl border p-6 transition-colors duration-300 ${
      darkMode ? 'bg-[#0a0a0a] border-amber-500/20 shadow-lg shadow-black/50' : 'bg-gray-50 border-gray-200 shadow-md'
    }`}>
      
      {/* CABEÇALHO */}
      <div className="mb-6 text-center sm:text-left">
        <h3 className={`text-2xl font-black tracking-tight text-amber-500`}>
          Tempo programando
        </h3>
        <p className={`text-[12px] font-mono mt-1 ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
          Últimos {summary.totalDays || 7} dias • wakatime.com/@gustavoryan
        </p>
      </div>

      {isConfigured ? (
        <>
          {/* HEADER METRICS (4 Blocos) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <HeaderBlock icon={<Clock />} label="Total" value={summary.totalFormatted} sub={`em ${languages.length} linguagens`} />
            <HeaderBlock icon={<Terminal />} label="Média Diária" value={summary.dailyAverageFormatted} sub="nos dias com código" />
            <HeaderBlock icon={<Calendar />} label="Dias Ativos" value={summary.activeDays} sub={`de ${summary.totalDays} dias`} />
            <HeaderBlock icon={<Code2 />} label="Editor" value={summary.topEditorName} sub={`${summary.topEditorPercent}% do tempo`} />
          </div>

          {/* GRID DE LINGUAGENS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {languages.map((lang, index) => (
              <div key={index} className={`flex flex-col items-center justify-center rounded-xl p-4 transition-colors ${
                darkMode ? 'bg-[#141414] hover:bg-[#1a1a1a] border border-[#222]' : 'bg-white hover:bg-gray-50 border border-gray-200 shadow-sm'
              }`}>
                <div className="relative mb-3 flex items-center justify-center">
                  <CircularProgress percent={lang.percent} color={getLanguageColor(lang.name)} />
                  <span className={`absolute text-[18px] font-black ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {lang.name.charAt(0)}
                  </span>
                </div>
                <strong className={`text-[13px] font-bold text-center w-full truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {lang.name}
                </strong>
                <p className={`text-[11px] mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                  {lang.formatted}
                </p>
                <p className={`text-[10px] mt-1 font-bold`} style={{ color: getLanguageColor(lang.name) }}>
                  {lang.percent}%
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`py-12 text-center text-sm font-medium rounded-xl border border-dashed ${darkMode ? 'text-zinc-500 border-zinc-800' : 'text-zinc-400 border-gray-300'}`}>
          Métricas do WakaTime indisponíveis no momento.
        </div>
      )}
      
      
    </article>
  );
}