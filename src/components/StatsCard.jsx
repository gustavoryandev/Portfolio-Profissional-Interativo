import LanguageIcon from './LanguageIcon';
import React, { useContext } from 'react';
import { Terminal, Clock, Calendar, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

// Tokens alinhados ao GithubActivityCard
const UI = {
  dark: {
    panel: 'border-[#163A59] bg-[#050E17] text-gray-200',
    surface: 'bg-[#0B192B] border-[#163A59]',
    surfaceHover: 'hover:bg-[#10243a]',
    divider: 'border-[#163A59]',
    text: 'text-white',
    strong: 'text-white',
    label: 'text-zinc-400',
    muted: 'text-[var(--muted)]',
    accentText: 'text-[#38BDF8]',
    accent: '#38BDF8',
    track: '#163A59',
    emptyBox: 'border-[var(--line)] text-[var(--muted)]',
    shadow: 'shadow-sm',
  },
  light: {
    panel: 'border-gray-200 bg-white text-gray-800',
    surface: 'bg-gray-50 border-gray-100',
    surfaceHover: 'hover:bg-gray-100',
    divider: 'border-gray-200',
    text: 'text-gray-800',
    strong: 'text-gray-900',
    label: 'text-gray-500',
    muted: 'text-gray-500',
    accentText: 'text-[#0369A1]',
    accent: '#0D6EFD',
    track: '#e5e7eb',
    emptyBox: 'border-gray-300 text-zinc-400',
    shadow: 'shadow-lg',
  },
};

// Caixa de estatística (mesmo padrão das métricas do GithubActivityCard)
function HeaderBlock({ icon, label, value, sub, ui }) {
  return (
    <div className={`flex flex-col rounded-xl border p-3 transition-colors ${ui.surface}`}>
      <div className={`mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${ui.label}`}>
        {React.cloneElement(icon, { size: 12, className: ui.accentText, 'aria-hidden': true })}
        {label}
      </div>
      <strong className={`text-[17px] font-semibold tabular-nums ${ui.strong}`}>{value || '--'}</strong>
      <p className={`mt-0.5 text-[11px] ${ui.muted}`}>{sub}</p>
    </div>
  );
}

// Anel de progresso SVG (cor de acento única do tema)
function CircularProgress({ percent, ui, label }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <svg
      className="h-14 w-14 -rotate-90 transform"
      viewBox="0 0 50 50"
      role="img"
      aria-label={label}
    >
      <circle cx="25" cy="25" r={radius} strokeWidth="4" fill="none" stroke={ui.track} />
      <circle
        cx="25"
        cy="25"
        r={radius}
        strokeWidth="4"
        fill="none"
        stroke={ui.accent}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export default function StatsCard({ context }) {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const ui = darkMode ? UI.dark : UI.light;

  const wakatime = context?.wakatime;
  const summary = wakatime?.summary || {};
  const languages = wakatime?.languages || [];
  const isConfigured = wakatime?.status === 'ok';

  return (
    <article className={`portfolio-card my-3 w-full max-w-[800px] rounded-xl border p-6 transition-colors duration-300 ${ui.panel} ${ui.shadow}`}>
      {/* CABEÇALHO */}
      <div className="mb-6 text-center sm:text-left">
        <h3 className={`flex items-center justify-center gap-2 text-xl font-semibold tracking-tight sm:justify-start ${ui.strong}`}>
          <Clock size={22} className={ui.accentText} aria-hidden="true" />
          {t('cards.wakatime.tempoProgramando')}
        </h3>
        <p className={`mt-1 font-mono text-[12px] ${ui.muted}`}>
          {t('cards.wakatime.ultimosDias', { count: summary.totalDays || 7 })} • wakatime.com/@43529b87-73e1-4546-a267-d2bf1489e108
        </p>
      </div>

      {isConfigured ? (
        <>
          {/* MÉTRICAS (4 blocos) */}
          <div className="mb-6 card-grid grid grid-cols-2 gap-3 md:grid-cols-4">
            <HeaderBlock ui={ui} icon={<Clock />} label={t('cards.wakatime.total')} value={summary.totalFormatted} sub={t('cards.wakatime.emLinguagens', { count: languages.length })} />
            <HeaderBlock ui={ui} icon={<Terminal />} label={t('cards.wakatime.mediaDiaria')} value={summary.dailyAverageFormatted} sub={t('cards.wakatime.nosDiasComCodigo')} />
            <HeaderBlock ui={ui} icon={<Calendar />} label={t('cards.wakatime.diasAtivos')} value={summary.activeDays} sub={t('cards.wakatime.deDias', { count: summary.totalDays })} />
            <HeaderBlock ui={ui} icon={<Code2 />} label={t('cards.wakatime.editor')} value={summary.topEditorName} sub={t('cards.wakatime.percentualTempo', { percent: summary.topEditorPercent })} />
          </div>

          {/* LINGUAGENS */}
          <div className="card-grid grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {languages.map((lang, index) => (
              <div
                key={`${lang.name}-${index}`}
                className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-colors ${ui.surface} ${ui.surfaceHover}`}
              >
                <div className="relative mb-3 flex items-center justify-center">
                  <CircularProgress percent={lang.percent} ui={ui} label={`${lang.name}: ${lang.percent}%`} />
                  <span className={`absolute text-[18px] font-semibold ${ui.strong}`} aria-hidden="true">
                    <LanguageIcon name={lang.name} size={22} />
                  </span>
                </div>
                <strong className={`w-full truncate text-center text-[13px] font-bold ${ui.strong}`}>
                  {lang.name}
                </strong>
                <p className={`mt-0.5 text-[11px] ${ui.muted}`}>{lang.formatted}</p>
                <p className={`mt-1 text-[10px] font-bold tabular-nums ${ui.accentText}`}>{lang.percent}%</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={`rounded-xl border border-dashed py-12 text-center text-sm font-medium ${ui.emptyBox}`}>
          {t('cards.wakatime.indisponivel')}
        </div>
      )}
    </article>
  );
}
