import React, { useContext, useState } from 'react';
import { Flame, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function GithubActivityCard({ context, lang = 'pt' }) {
  const { darkMode } = useContext(ThemeContext);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, count: 0, date: '' });
  
  // Dicionário de Traduções
  const t = {
    pt: {
      activity: 'atividade',
      totalContributions: 'Total de contribuições',
      lastYear: 'No último ano',
      currentStreak: 'Sequência atual',
      daysInRow: 'Dias seguidos',
      longestStreak: 'Maior sequência',
      record: 'Recorde',
      days: 'dias',
      contrib12months: 'contribuições nos últimos 12 meses',
      less: 'Menos',
      more: 'Mais',
      bestDay: 'Melhor dia:',
      contributionsIn: 'contribuições em',
      contribByYear: 'Contribuições por ano',
      byDayOfWeek: 'Por dia da semana',
      commitTimes: 'horários dos commits',
      peakAt: 'Pico às',
      commitsAreFrom: 'dos commits são de',
      commits: 'commits',
      estimation: 'Estimativa com amostra de eventos do GitHub • Horário de Brasília',
      madrugada: 'Madrugada',
      manha: 'Manhã',
      tarde: 'Tarde',
      noite: 'Noite',
      weekDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
    },
    en: {
      activity: 'activity',
      totalContributions: 'Total contributions',
      lastYear: 'Last year',
      currentStreak: 'Current streak',
      daysInRow: 'Days in a row',
      longestStreak: 'Longest streak',
      record: 'Record',
      days: 'days',
      contrib12months: 'contributions in the last 12 months',
      less: 'Less',
      more: 'More',
      bestDay: 'Best day:',
      contributionsIn: 'contributions on',
      contribByYear: 'Contributions by year',
      byDayOfWeek: 'By day of week',
      commitTimes: 'commit times',
      peakAt: 'Peak at',
      commitsAreFrom: 'of commits are from',
      commits: 'commits',
      estimation: 'Estimate from recent GitHub events • Brasília Time',
      madrugada: 'Late Night',
      manha: 'Morning',
      tarde: 'Afternoon',
      noite: 'Evening',
      weekDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }
  }[lang] || {};

  const github = context?.github;
  const stats = github?.stats || {};
  const activity = github?.activity || {};
  
  // Extraindo os dados reais
  const totalContributions = stats.contributions || 0;
  const currentStreak = stats.currentStreak || 0;
  const longestStreak = stats.longestStreak || 0;
  
  // Tratando a data do melhor dia
  let bestDayDateStr = '';
  if (stats.bestDay && stats.bestDay.date) {
    const [y, m, d] = stats.bestDay.date.split('-');
    const dateObj = new Date(y, m - 1, d);
    bestDayDateStr = dateObj.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Dados dos gráficos
  const weeks = activity.weeks || [];
  const contributionsByDayOfWeek = activity.contributionsByDayOfWeek || [0, 0, 0, 0, 0, 0, 0];
  const commitsPerHour = activity.commitsPerHour || new Array(24).fill(0);
  const totalSampleCommits = activity.totalSampleCommits || 1;
  const currentYear = activity.year || new Date().getFullYear();

  // Cálculos de Pico e Períodos
  const peakHour = commitsPerHour.indexOf(Math.max(...commitsPerHour, 0));
  const peakCount = commitsPerHour[peakHour] || 0;
  const peakPct = ((peakCount / totalSampleCommits) * 100).toFixed(1);

  const getPeriodStats = (start, end) => {
    let count = 0;
    for (let i = start; i < end; i++) count += commitsPerHour[i];
    return { count, pct: ((count / totalSampleCommits) * 100).toFixed(1) };
  };

  const periods = {
    madrugada: { ...getPeriodStats(0, 6), label: t.madrugada, icon: Moon, desc: '0h-6h', color: 'text-indigo-400', bg: 'bg-indigo-500' },
    manha: { ...getPeriodStats(6, 12), label: t.manha, icon: Sunrise, desc: '6h-12h', color: 'text-amber-500', bg: 'bg-amber-500' },
    tarde: { ...getPeriodStats(12, 18), label: t.tarde, icon: Sun, desc: '12h-18h', color: 'text-orange-500', bg: 'bg-orange-500' },
    noite: { ...getPeriodStats(18, 24), label: t.noite, icon: Sunset, desc: '18h-0h', color: 'text-emerald-500', bg: 'bg-emerald-500' }
  };

  const mostActivePeriod = Object.values(periods).reduce((prev, curr) => (parseFloat(curr.pct) > parseFloat(prev.pct) ? curr : prev));

  // Lógica de cores baseada no tema escuro oficial do GitHub
  const getCellBgColor = (count) => {
    if (count === 0) return darkMode ? 'bg-[#161b22]' : 'bg-gray-100';
    if (count <= 3) return darkMode ? 'bg-[#0e4429]' : 'bg-emerald-200';
    if (count <= 6) return darkMode ? 'bg-[#006d32]' : 'bg-emerald-300';
    if (count <= 9) return darkMode ? 'bg-[#26a641]' : 'bg-emerald-400';
    return darkMode ? 'bg-[#39d353]' : 'bg-emerald-500';
  };

  const chartBarColor = darkMode ? 'bg-[#006d32]' : 'bg-emerald-500';
  const chartPeakColor = darkMode ? 'bg-[#39d353]' : 'bg-emerald-400';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Reordenando os dias para Segunda -> Domingo
  const reorderedContributions = [
      contributionsByDayOfWeek[1], // Seg
      contributionsByDayOfWeek[2],
      contributionsByDayOfWeek[3],
      contributionsByDayOfWeek[4],
      contributionsByDayOfWeek[5],
      contributionsByDayOfWeek[6], // Sáb
      contributionsByDayOfWeek[0], // Dom
  ];
  const maxDayCont = Math.max(...reorderedContributions, 1);

  return (
    <div className={`w-full max-w-[850px] mx-auto my-6 border rounded-xl p-6 shadow-lg transition-colors duration-300 ${darkMode ? 'bg-[#0f0f0f] border-[#2a2a2a] text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
      
      {/* SEÇÃO 1: Atividade */}
      <div className="mb-8">
        <h3 className={`text-[0.85rem] font-semibold mb-6 uppercase tracking-[0.05em] flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="text-emerald-500 font-bold">#</span> {t.activity}
        </h3>
        
        {/* Top Cards (Total, Atual, Maior) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className={`border rounded-xl py-5 px-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-0.5 ${darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
            <span className="text-3xl md:text-[2rem] font-bold leading-[1.1] flex items-baseline gap-1">{totalContributions}</span>
            <span className={`text-xs font-semibold mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.totalContributions}</span>
            <span className={`text-[0.7rem] mt-1 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{t.lastYear}</span>
          </div>
          
          <div className={`border rounded-xl py-5 px-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-0.5 ${darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
            <Flame className="text-orange-500 text-[1.6rem] mb-1" />
            <span className="text-3xl md:text-[2rem] font-bold leading-[1.1] flex items-baseline gap-1">{currentStreak}</span>
            <span className={`text-xs font-semibold mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.currentStreak}</span>
            <span className={`text-[0.7rem] mt-1 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{t.daysInRow}</span>
          </div>

          <div className={`border rounded-xl py-5 px-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-0.5 ${darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
            <div className="text-3xl md:text-[2rem] font-bold leading-[1.1] flex items-baseline gap-1">{longestStreak} <span className="text-[1.2rem]">{t.days}</span></div>
            <span className={`text-xs font-semibold mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{t.longestStreak}</span>
            <span className={`text-[0.7rem] mt-1 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{t.record}</span>
          </div>
        </div>

        {/* Gráfico 52x7 de Contribuições */}
        <div className="mb-10">
          <div className={`flex flex-wrap justify-between items-center text-sm mb-3 gap-4 ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
            <span>{totalContributions} {t.contrib12months}</span>
            <div className="flex items-center gap-1 text-[0.7rem]">
                {t.less}
                {[0, 2, 4, 7, 10].map(dummyCount => (
                  <div 
                    key={dummyCount} 
                    className={`w-[11px] h-[11px] rounded-[2px] ${getCellBgColor(dummyCount)}`}
                  />
                ))}
                {t.more}
            </div>
          </div>
          
          <div className={`border rounded-lg p-4 ${darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex gap-[3px] overflow-x-auto pb-2 custom-scrollbar" onMouseLeave={() => setTooltip(prev => ({ ...prev, visible: false }))}>
                {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px] shrink-0">
                    {week.contributionDays.map((day, dIdx) => (
                    <div 
                        key={dIdx} 
                        onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltip({
                                visible: true,
                                x: rect.left + rect.width / 2,
                                y: rect.top - 8,
                                count: day.contributionCount,
                                date: day.date
                            });
                        }}
                        className={`w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-all duration-200 hover:scale-150 hover:ring-1 hover:ring-white hover:shadow-lg relative z-0 hover:z-10 ${getCellBgColor(day.contributionCount)}`}
                    />
                    ))}
                </div>
                ))}
            </div>
          </div>
          {stats.bestDay && stats.bestDay.count > 0 && (
            <div className={`text-center text-xs mt-3 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
              {t.bestDay} <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stats.bestDay.count} {t.contributionsIn}</span> {bestDayDateStr}
            </div>
          )}
        </div>

        {/* Informações Anuais e Semanais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8">
            {/* Contribuições por ano */}
            <div>
                <span className={`block text-xs font-semibold uppercase mb-4 tracking-wider ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{t.contribByYear}</span>
                <div className={`flex items-end justify-center h-[130px] border-b relative ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
                    <div className="flex flex-col items-center flex-1 max-w-[60px]">
                        <span className={`text-[0.7rem] font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{totalContributions}</span>
                        <div className={`w-full rounded-t min-h-[2px] ${chartBarColor}`} style={{ height: '70%' }}></div>
                        <span className={`absolute -bottom-6 text-xs font-bold ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{currentYear}</span>
                    </div>
                </div>
            </div>

            {/* Por dia da semana */}
            <div>
                <span className={`block text-xs font-semibold uppercase mb-4 tracking-wider ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>{t.byDayOfWeek}</span>
                <div className="flex flex-col gap-2.5">
                    {t.weekDays.map((day, idx) => {
                        const count = reorderedContributions[idx];
                        const pct = (count / maxDayCont) * 100;
                        return (
                            <div key={day} className="flex items-center gap-3 text-[0.8rem]">
                                <span className={`w-8 font-medium ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{day}</span>
                                <div className={`flex-1 h-[8px] rounded overflow-hidden ${darkMode ? 'bg-[#161b22]' : 'bg-gray-200'}`}>
                                    <div className={`h-full rounded ${chartBarColor}`} style={{ width: `${pct}%` }}></div>
                                </div>
                                <span className={`w-8 text-right font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{count}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
      </div>

      {/* SEÇÃO 2: Horários dos Commits */}
      <div className={`mb-4 mt-12 pt-8 border-t border-dashed ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
        <h3 className={`text-[0.85rem] font-semibold mb-6 uppercase tracking-[0.05em] flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="text-emerald-500 font-bold">#</span> {t.commitTimes}
        </h3>

        {/* Gráfico de Barras - Horas */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <p className="font-bold text-[1.1rem]">
                {t.peakAt} {peakHour}h <span className={`font-normal ${darkMode ? 'text-zinc-600' : 'text-gray-300'}`}>•</span> {mostActivePeriod.pct}% {t.commitsAreFrom} {mostActivePeriod.label.toLowerCase()}
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
                {peakHour}h-{peakHour+1}h • {peakPct}% = {peakCount} {t.commits}
            </p>
          </div>
          
          <div className={`flex items-end h-[150px] border-b gap-[2px] pt-5 mb-2 ${darkMode ? 'border-[#2a2a2a]' : 'border-gray-200'}`}>
            {commitsPerHour.map((count, index) => {
              const maxCount = Math.max(...commitsPerHour, 1);
              const height = count > 0 ? `${(count / maxCount) * 100}%` : '2%';
              const isPeak = index === peakHour;
              return (
                <div 
                  key={index} 
                  className={`flex-1 rounded-t-[2px] relative min-h-[2px] transition-opacity duration-200 cursor-default hover:opacity-100 ${isPeak ? `${chartPeakColor} opacity-100` : `${chartBarColor} opacity-50 hover:opacity-80`}`} 
                  style={{ height }}
                >
                  {isPeak && <span className={`absolute -top-6 left-1/2 -translate-x-1/2 text-[0.7rem] font-bold px-1.5 py-0.5 rounded border ${darkMode ? 'bg-[#0f0f0f] border-[#2a2a2a] text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>{peakPct}%</span>}
                </div>
              );
            })}
          </div>
          <div className={`flex justify-between text-[0.7rem] font-medium mb-8 ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
             {[0, 3, 6, 9, 12, 15, 18, 21].map(h => <span key={h}>{h}h</span>)}
             <span>24h</span>
          </div>
        </div>

        {/* Cards de Períodos do Dia */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.values(periods).map((period, index) => {
            const Icon = period.icon;
            return (
              <div key={index} className={`border rounded-lg p-4 flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${darkMode ? 'bg-[#141414] border-[#2a2a2a]' : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`text-[1.3rem] ${period.color}`} />
                  <div>
                    <div className="text-[0.8rem] font-semibold">{period.label}</div>
                    <div className={`text-[0.7rem] mt-[0.1rem] ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>{period.desc}</div>
                  </div>
                </div>
                <div className="text-[1.3rem] font-bold mb-2">{period.pct}%</div>
                <div className={`h-[6px] rounded-full overflow-hidden ${darkMode ? 'bg-zinc-800' : 'bg-gray-200'}`}>
                  <div className={`h-full rounded-full ${period.bg}`} style={{ width: `${period.pct}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <p className={`text-center text-[0.7rem] mt-8 font-medium ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>
          {t.estimation}
        </p>
      </div>

      {tooltip.visible && (
        <div 
          className="fixed z-[100] bg-zinc-900 text-gray-100 text-[11px] py-1.5 px-3 rounded shadow-2xl border border-zinc-700 pointer-events-none transform -translate-x-1/2 -translate-y-full whitespace-nowrap"
          style={{ top: tooltip.y, left: tooltip.x }}
        >
          <strong className="text-white">{tooltip.count} {t.contributionsIn}</strong> {formatDate(tooltip.date)}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-zinc-700"></div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-zinc-900"></div>
        </div>
      )}

      {/* Estilos mínimos para a barra de rolagem */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: ${darkMode ? '#141414' : '#f9fafb'}; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${darkMode ? 'rgba(113, 113, 122, 0.4)' : 'rgba(156, 163, 175, 0.4)'}; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${darkMode ? '#71717a' : '#9ca3af'}; }
      `}</style>
    </div>
  );
}