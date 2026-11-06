import { CardShell } from './ui/CardShell';
import LanguageIcon from './LanguageIcon';
import React from 'react';
import { Terminal, Clock, Calendar, Code2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Tokens alinhados ao GithubActivityCard
const ui = {
  panel: '', surface: 'border-line bg-panel-soft', surfaceHover: 'hover:border-accent',
  divider: 'border-line', text: 'text-ink', strong: 'text-ink', label: 'text-muted', muted: 'text-muted',
  accentText: 'text-accent', accent: 'var(--accent)', track: 'var(--line)',
  emptyBox: 'border-line text-muted', shadow: '',
};

// Caixa de estatística (mesmo padrão das métricas do GithubActivityCard)
function HeaderBlock({ icon, label, value, sub, ui }) {
  return (
    <div className={`flex flex-col rounded-xl border p-3 transition-colors ${ui.surface}`}>
      <div className={`mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${ui.label}`}>
        {React.cloneElement(icon, { size: 12, className: ui.accentText, 'aria-hidden': true })}
        {label}
      </div>
      <strong className={`text-[17px] font-semibold tabular-nums ${ui.strong}`}>{value ?? '--'}</strong>
      <p className={`mt-0.5 text-xs ${ui.muted}`}>{sub}</p>
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
      <circle cx="25" cy="25" r={radius} strokeWidth="4" fill="none" style={{ stroke: ui.track }} />
      <circle
        cx="25"
        cy="25"
        r={radius}
        strokeWidth="4"
        fill="none"
        style={{ stroke: ui.accent }}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export default function StatsCard({ context }) {
  const { t, i18n } = useTranslation();
  const en = i18n.language.startsWith('en');

  const wakatime = context?.wakatime;
  const summary = wakatime?.summary || {};
  const languages = wakatime?.languages || [];
  const isConfigured = wakatime?.status === 'ok';

  return (
    <CardShell as="article" className="my-3" >
      {/* CABEÇALHO */}
      <div className="mb-6 text-center sm:text-left">
        <h3 className={`flex items-center justify-center gap-2 text-xl font-semibold tracking-tight sm:justify-start ${ui.strong}`}>
          <Clock size={22} className={ui.accentText} aria-hidden="true" />
          {t('cards.wakatime.tempoProgramando')}
        </h3>
        <p className={`mt-1 font-mono text-[12px] ${ui.muted}`}>
          {en ? 'All available history' : 'Todo o histórico disponível'} • wakatime.com/@43529b87-73e1-4546-a267-d2bf1489e108
        </p>
      </div>

      {wakatime?.range?.start && <p className={`mb-4 text-xs ${ui.muted}`}>{wakatime.range.start.slice(0, 10)} — {wakatime.range.end?.slice(0, 10)}{wakatime.range.includingToday === false ? (en ? ' (breakdowns exclude today)' : ' (distribuições não incluem hoje)') : ''}</p>}
      {isConfigured ? (
        <>
          {/* MÉTRICAS (4 blocos) */}
          <div className="mb-6 card-grid grid grid-cols-2 gap-3 md:grid-cols-4">
            <HeaderBlock ui={ui} icon={<Clock />} label={t('cards.wakatime.total')} value={summary.totalFormatted} sub={en ? 'all-time total' : 'total de todo o histórico'} />
            <HeaderBlock ui={ui} icon={<Terminal />} label={t('cards.wakatime.mediaDiaria')} value={summary.dailyAverageFormatted} sub={en ? 'average reported by WakaTime' : 'média informada pelo WakaTime'} />
            <HeaderBlock ui={ui} icon={<Calendar />} label={t('cards.wakatime.diasAtivos')} value={summary.activeDays} sub={t('cards.wakatime.deDias', { count: summary.totalDays ?? '--' })} />
            <HeaderBlock ui={ui} icon={<Code2 />} label={t('cards.wakatime.editor')} value={summary.topEditorName} sub={t('cards.wakatime.percentualTempo', { percent: summary.topEditorPercent ?? '--' })} />
          </div>

          {!languages.length && <p className={`mb-4 text-xs ${ui.muted}`}>{t('cards.wakatime.noBreakdown')}</p>}
          {/* LINGUAGENS */}
          <div className="card-grid grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {languages.map((lang, index) => (
              <div
                key={`${lang.name}-${index}`}
                className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-colors ${ui.surface} ${ui.surfaceHover}`}
              >
                <div className="relative mb-3 flex items-center justify-center">
                  <CircularProgress percent={lang.percent} ui={ui} label={`${lang.name}: ${lang.percent == null ? '—' : `${lang.percent}%`}`} />
                  <span className={`absolute text-[18px] font-semibold ${ui.strong}`} aria-hidden="true">
                    <LanguageIcon name={lang.name} size={22} />
                  </span>
                </div>
                <strong className={`w-full truncate text-center text-[13px] font-bold ${ui.strong}`}>
                  {lang.name}
                </strong>
                <p className={`mt-0.5 text-xs ${ui.muted}`}>{lang.formatted}</p>
                <p className={`mt-1 text-xs font-bold tabular-nums ${ui.accentText}`}>{lang.percent == null ? '—' : `${lang.percent}%`}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {['operatingSystems', 'editors'].map(category => (
              <section key={category} className={`rounded-xl border p-4 ${ui.surface}`}>
                <h4 className={`mb-3 font-semibold ${ui.strong}`}>{t(`cards.wakatime.${category}`)}</h4>
                <div className="space-y-3">
                  {(wakatime[category] || []).map(item => (
                    <div key={item.name}>
                      <div className={`flex flex-wrap justify-between gap-2 text-xs ${ui.text}`}>
                        <span>{item.name}</span><span>{item.formatted ?? '—'} · {item.percent == null ? '—' : `${item.percent}%`}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: ui.track }}>
                        <div className="h-full rounded-full" style={{ background: ui.accent, width: `${Math.min(100, Math.max(0, Number(item.percent) || 0))}%` }} />
                      </div>
                    </div>
                  ))}
                  {!wakatime[category]?.length && <p className={`text-xs ${ui.muted}`}>{t('cards.wakatime.noBreakdown')}</p>}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className={`rounded-xl border border-dashed py-12 text-center text-sm font-medium ${ui.emptyBox}`}>
          {t('cards.wakatime.indisponivel')}
        </div>
      )}
    </CardShell>
  );
}
