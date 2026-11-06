import { CardShell } from './ui/CardShell';
import React from 'react';
import { Clock, Code2, Terminal } from 'lucide-react';
import LanguageIcon from './LanguageIcon';

const copy = {
  pt: {
    title: 'WakaTime · esta semana',
    range: 'Últimos 7 dias',
    total: 'Tempo total',
    average: 'Média diária',
    editor: 'Editor mais usado',
    languages: 'Linguagens da semana',
    none: 'Sem atividade registrada na semana.',
    unavailable: 'Dados do WakaTime indisponíveis no momento.',
  },
  en: {
    title: 'WakaTime · this week',
    range: 'Last 7 days',
    total: 'Total time',
    average: 'Daily average',
    editor: 'Most-used editor',
    languages: 'Languages this week',
    none: 'No activity recorded this week.',
    unavailable: 'WakaTime data is unavailable at the moment.',
  },
};

const ui = {
  panel: '', surface: 'border-line bg-panel-soft', strong: 'text-ink', label: 'text-muted', muted: 'text-muted',
  accentText: 'text-accent', tile: 'border-line bg-panel', hover: 'hover:border-accent hover:shadow-md',
  accent: 'var(--accent)', track: 'var(--line)', dashed: 'border-line text-muted',
};

function Block({ icon, label, value, ui }) {
  return (
    <div className={`flex min-w-0 flex-col rounded-xl border p-3 ${ui.surface}`}>
      <div className={`mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest ${ui.label}`}>
        {React.cloneElement(icon, { size: 12, className: ui.accentText, 'aria-hidden': true })}
        {label}
      </div>
      <strong className={`truncate text-[17px] font-semibold tabular-nums ${ui.strong}`}>{value || '--'}</strong>
    </div>
  );
}

export default function WakaTimeCard({ context, lang = 'pt' }) {
  const t = copy[lang] || copy.pt;

  const wakatime = context?.wakatime;
  const week = wakatime?.week || {};
  const languages = Array.isArray(week.languages) ? week.languages : [];
  const ok = wakatime?.status === 'ok';
  const hasData = Boolean(week.totalFormatted || languages.length);

  return (
    <CardShell as="article" className="my-3" >
      <div className="mb-5">
        <h3 className={`flex items-center gap-2 text-lg font-semibold tracking-tight ${ui.strong}`}>
          <Clock size={20} className={ui.accentText} aria-hidden="true" />
          {t.title}
        </h3>
        <p className={`mt-1 text-[12px] ${ui.muted}`}>{t.range}</p>
      </div>

      {!ok ? (
        <div className={`rounded-xl border border-dashed py-10 text-center text-sm font-medium ${ui.dashed}`}>{t.unavailable}</div>
      ) : !hasData ? (
        <div className={`rounded-xl border border-dashed py-10 text-center text-sm font-medium ${ui.dashed}`}>{t.none}</div>
      ) : (
        <>
          <div className="card-grid grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Block ui={ui} icon={<Clock />} label={t.total} value={week.totalFormatted} />
            <Block ui={ui} icon={<Terminal />} label={t.average} value={week.dailyAverageFormatted} />
            <Block ui={ui} icon={<Code2 />} label={t.editor} value={week.topEditorName} />
          </div>

          {languages.length > 0 && (
            <>
              <h4 className={`mb-3 mt-6 text-xs font-bold uppercase tracking-widest ${ui.label}`}>{t.languages}</h4>
              <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 min-[420px]:grid-cols-2 md:grid-cols-3">
                {languages.map((language, index) => {
                  const percent = language.percent == null ? NaN : Number(language.percent);
                  const hasPercent = Number.isFinite(percent);
                  return (
                    <li
                      key={`${language.name}-${index}`}
                      className={`min-w-0 rounded-xl border p-3 transition-all duration-200 ${ui.surface} ${ui.hover}`}
                    >
                      <div className="flex items-center gap-3">
                        <span aria-hidden="true" className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${ui.tile}`}>
                          <LanguageIcon name={language.name} size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-[13px] font-bold ${ui.strong}`}>{language.name}</p>
                          <p className={`text-xs tabular-nums ${ui.muted}`}>{language.formatted ?? '—'}</p>
                        </div>
                        {hasPercent && (
                          <span className={`shrink-0 text-[13px] font-semibold tabular-nums ${ui.accentText}`}>{percent.toFixed(1)}%</span>
                        )}
                      </div>
                      {hasPercent && (
                        <div
                          role="progressbar"
                          aria-label={language.name}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(percent)}
                          className="mt-2.5 h-1.5 overflow-hidden rounded-full"
                          style={{ background: ui.track }}
                        >
                          <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, percent))}%`, background: ui.accent }} />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </CardShell>
  );
}