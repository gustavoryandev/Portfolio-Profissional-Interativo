import { CardShell } from './ui/CardShell';
import LanguageIcon from './LanguageIcon';
import React, { useState } from 'react';
import { Terminal, Clock, Calendar, Code2, Sun, Trophy, GitBranch } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useWakaTime from '../hooks/useWakaTime';

const ranges = ['last_7_days', 'last_30_days', 'last_6_months', 'last_year', 'all_time'];
const detailsKey = 'cards.wakatime.details';

// Tokens alinhados ao GithubActivityCard
const ui = {
  surface: 'border-line bg-panel-soft', surfaceHover: 'hover:border-accent',
  text: 'text-ink', strong: 'text-ink', label: 'text-muted', muted: 'text-muted',
  accentText: 'text-accent', accent: 'var(--accent)', track: 'var(--line)',
  emptyBox: 'border-line text-muted',
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
      {sub && <p className={`mt-0.5 text-xs ${ui.muted}`}>{sub}</p>}
    </div>
  );
}

// Anel de progresso SVG (cor de acento única do tema)
function CircularProgress({ percent, ui, label }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, Number(percent) || 0)) / 100) * circumference;

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

function Breakdown({ title, items, description, empty }) {
  if (!items?.length && !empty) return null;
  return (
    <section className={`min-w-0 rounded-xl border p-4 ${ui.surface}`}>
      <h4 className={`mb-3 font-semibold ${ui.strong}`}>{title}</h4>
      <ul className="space-y-3">
        {items?.map((item, index) => (
          <li key={`${item.name}-${index}`}>
            <div className={`flex flex-wrap justify-between gap-x-2 text-xs ${ui.text}`}>
              <span className="break-all">{item.name}</span>
              <span>{item.formatted ?? '—'}{item.percent != null && ` · ${item.percent}%`}</span>
            </div>
            {item.percent != null && <div className="mt-1 h-1.5 overflow-hidden rounded-full" style={{ background: ui.track }}>
              <div className="h-full rounded-full" style={{ background: ui.accent, width: `${Math.min(100, Math.max(0, Number(item.percent) || 0))}%` }} />
            </div>}
          </li>
        ))}
      </ul>
      {!items?.length && <p className={`text-xs ${ui.muted}`}>{empty}</p>}
      {description && <p className={`mt-3 text-xs ${ui.muted}`}>{description}</p>}
    </section>
  );
}

function localizedDate(value, locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(value));
}

function activityDuration(seconds, t) {
  const minutes = Math.floor(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : minutes > 0 ? `${minutes}m` : t(`${detailsKey}.underMinute`);
}

function CodingNow({ activity, locale }) {
  const { t } = useTranslation();
  if (activity?.status !== 'ok' || activity.stale) return null;
  const { last } = activity;
  const elapsed = last ? Math.max(0, Date.now() - last.at) : 0;
  const active = activity.active && elapsed <= 600_000;
  const relative = last && new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    .format(-Math.floor(elapsed / 60_000), 'minute');
  return (
    <section className={`mb-5 rounded-xl border p-4 ${ui.surface}`} aria-label={t(`${detailsKey}.activity`)}>
      <h4 className={`flex items-center gap-2 text-sm font-semibold ${ui.strong}`}>
        <span className={`h-2 w-2 rounded-full ${active ? 'bg-accent' : 'bg-line'}`} aria-hidden="true" />
        {t(`${detailsKey}.${active ? 'codingNow' : 'idle'}`)}
      </h4>
      {last ? (
        <>
          <p className={`mt-1 text-xs ${ui.muted}`}>{t(`${detailsKey}.lastActivity`, { relative })}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <strong className="break-all">{last.project || t(`${detailsKey}.privateProject`)}</strong>
            {last.branch && <span className={`inline-flex items-center gap-1 break-all ${ui.muted}`}><GitBranch size={13} aria-hidden="true" />{last.branch}</span>}
            {[last.language, last.editor].filter(Boolean).join(' · ')}
          </p>
          {active && <p className={`mt-2 text-xs ${ui.muted}`}>
            {t(`${detailsKey}.session`, { duration: activityDuration(last.sessionSeconds, t), start: new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(last.sessionStart) })}
            {last.projectTodaySeconds != null && ` · ${t(`${detailsKey}.projectToday`, { duration: activityDuration(last.projectTodaySeconds, t) })}`}
          </p>}
        </>
      ) : <p className={`mt-1 text-xs ${ui.muted}`}>{t(`${detailsKey}.noActivity`)}</p>}
    </section>
  );
}

export default function StatsCard({ context }) {
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState('all_time');
  const [details, reload] = useWakaTime(range);
  const [activity] = useWakaTime();
  const locale = i18n.language.startsWith('en') ? 'en' : 'pt-BR';
  const historical = range === 'all_time' ? context?.wakatime : null;
  const wakatime = details?.status === 'ok' ? details : historical?.status === 'ok' ? historical : details;
  const label = name => t(`${detailsKey}.${name}`);

  const summary = wakatime?.summary || {};
  const languages = wakatime?.languages || [];
  const isConfigured = wakatime?.status === 'ok';
  const total = range === 'all_time' && historical?.status === 'ok' && !historical.stale
    ? historical.summary?.totalFormatted ?? summary.totalFormatted : summary.totalFormatted;
  const today = activity?.today?.status === 'ok' && !activity.today.stale ? activity.today.formatted : null;

  return (
    <CardShell as="article" className="my-3" >
      {/* CABEÇALHO */}
      <div className="mb-6 text-center sm:text-left">
        <h3 className={`flex items-center justify-center gap-2 text-xl font-semibold tracking-tight sm:justify-start ${ui.strong}`}>
          <Clock size={22} className={ui.accentText} aria-hidden="true" />
          {t('cards.wakatime.tempoProgramando')}
        </h3>
        <p className={`mt-1 font-mono text-[12px] ${ui.muted}`}>
          <a href="https://wakatime.com/@43529b87-73e1-4546-a267-d2bf1489e108" target="_blank" rel="noreferrer" className="hover:underline">wakatime.com/@43529b87-73e1-4546-a267-d2bf1489e108</a>
        </p>
      </div>

      <CodingNow activity={activity?.codingNow} locale={locale} />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={label('period')}>
        {ranges.map(value => <button type="button" key={value} aria-pressed={value === range}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${value === range ? 'border-accent text-accent' : 'border-line text-muted hover:border-accent'}`}
          onClick={() => setRange(value)}>{label(value)}</button>)}
      </div>
      {!details && !isConfigured && <p role="status" className={`mb-4 text-xs ${ui.muted}`}>{label('loading')}</p>}
      {details && (details.status === 'error' || details.stale) && (
        <div className={`mb-4 flex flex-wrap items-center gap-2 text-xs ${ui.muted}`}>
          <p role="status">{label(details.reason === 'processing' ? 'pending' : details.stale ? 'stale' : 'periodUnavailable')}</p>
          <button type="button" className="rounded-md border border-line px-2 py-1 hover:border-accent" onClick={reload}>{label('retry')}</button>
        </div>
      )}
      {wakatime?.range?.start && <p className={`mb-4 text-xs ${ui.muted}`}>{wakatime.range.start.slice(0, 10)}{wakatime.range.end && ` — ${wakatime.range.end.slice(0, 10)}`}{wakatime.range.includingToday === false && ` · ${label('excludesToday')}`}</p>}
      {isConfigured ? (
        <>
          {/* MÉTRICAS (4 blocos) */}
          <div className="mb-6 card-grid grid grid-cols-2 gap-3 md:grid-cols-4">
            <HeaderBlock ui={ui} icon={<Clock />} label={t('cards.wakatime.total')} value={total} />
            <HeaderBlock ui={ui} icon={<Terminal />} label={t('cards.wakatime.mediaDiaria')} value={summary.dailyAverageFormatted} />
            <HeaderBlock ui={ui} icon={<Calendar />} label={t('cards.wakatime.diasAtivos')} value={summary.activeDays} sub={summary.totalDays != null ? t('cards.wakatime.deDias', { count: summary.totalDays }) : null} />
            <HeaderBlock ui={ui} icon={<Code2 />} label={t('cards.wakatime.editor')} value={summary.topEditorName} sub={summary.topEditorPercent != null ? t('cards.wakatime.percentualTempo', { percent: summary.topEditorPercent }) : null} />
            {today != null && <HeaderBlock ui={ui} icon={<Sun />} label={label('today')} value={today} />}
            {summary.bestDay && <HeaderBlock ui={ui} icon={<Trophy />} label={label('bestDay')} value={summary.bestDay.formatted} sub={localizedDate(summary.bestDay.date, locale)} />}
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
            <Breakdown title={t('cards.wakatime.operatingSystems')} items={wakatime.operatingSystems} empty={t('cards.wakatime.noBreakdown')} />
            <Breakdown title={t('cards.wakatime.editors')} items={wakatime.editors} empty={t('cards.wakatime.noBreakdown')} />
            <Breakdown title={label('categories')} items={wakatime.categories?.map(item => ({
              ...item, name: t(`${detailsKey}.category.${item.name}`, { defaultValue: item.name }),
            }))} />
            {wakatime.projects && <Breakdown title={label('projects')} items={wakatime.projects} empty={label('noPublicProjects')} />}
            <Breakdown title={label('libraries')} items={wakatime.libraries} description={label('librariesNote')} />
          </div>
        </>
      ) : details?.status === 'not_configured' ? (
        <div className={`rounded-xl border border-dashed py-12 text-center text-sm font-medium ${ui.emptyBox}`}>
          {t('cards.wakatime.indisponivel')}
        </div>
      ) : null}
    </CardShell>
  );
}
