import { useContext } from 'react';
import { Clock, Code2, Terminal, TrendingUp } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";

const copy = {
  pt: {
    title: 'WakaTime · esta semana',
    range: 'Últimos 7 dias',
    total: 'Total',
    average: 'Média diária',
    editor: 'Editor mais usado',
    languages: 'Linguagens',
    empty: 'Sem atividade registrada na semana.',
    unavailable: 'Dados da semana indisponíveis no momento.',
    live: 'Sincronizado ao vivo',
  },
  en: {
    title: 'WakaTime · this week',
    range: 'Last 7 days',
    total: 'Total',
    average: 'Daily average',
    editor: 'Top editor',
    languages: 'Languages',
    empty: 'No activity recorded this week.',
    unavailable: 'Weekly data is unavailable at the moment.',
    live: 'Synced live',
  },
};

// Tokens do design system (Alvinegro + Azul)
const THEME = {
  dark: {
    card: '#0B192B',
    border: '#163A59',
    text: '#FFFFFF',
    muted: '#A5BDDF',
    accent: '#38BDF8',
    track: '#163A59',
    dashed: '#3F3F46',
    shadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
  },
  light: {
    card: '#FFFFFF',
    border: '#E5E7EB',
    text: '#121212',
    muted: '#52525B',
    accent: '#0D6EFD',
    track: '#E5E7EB',
    dashed: '#D4D4D8',
    shadow: '0 10px 25px -8px rgba(18, 18, 18, 0.15)',
  },
};

function Metric({ icon, label, value, ui }) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border p-3" style={{ borderColor: ui.border }}>
      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: ui.muted }}>
        <span style={{ color: ui.accent }} aria-hidden="true">{icon}</span>
        {label}
      </div>
      <strong className="truncate text-[17px] font-semibold tabular-nums" style={{ color: ui.text }}>
        {value ?? '--'}
      </strong>
    </div>
  );
}

export default function WakaTimeCard({ context, lang = 'pt' }) {
  const { darkMode } = useContext(ThemeContext);
  const ui = darkMode ? THEME.dark : THEME.light;
  const t = copy[lang] || copy.pt;

  const wakatime = context?.wakatime;
  const week = wakatime?.status === 'ok' ? wakatime.week : null;
  const hasActivity = Boolean(week) && Number(week.totalSeconds) > 0;
  const languages = Array.isArray(week?.languages) ? week.languages : [];

  return (
    <article
      className="portfolio-card card-surface w-full max-w-[700px] p-5 transition-colors duration-300"
      style={{
        background: ui.card,
        borderColor: ui.border,
        color: ui.text,
        boxShadow: ui.shadow,
        fontFamily: FONT_SANS,
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <Clock size={22} style={{ color: ui.accent }} aria-hidden="true" />
        <div className="min-w-0">
          <h3 className="card-heading" style={{ color: ui.text }}>{t.title}</h3>
          <p className="text-[11px]" style={{ color: ui.muted }}>{t.range}</p>
        </div>
      </div>

      {hasActivity ? (
        <div className="space-y-4">
          <div className="card-grid grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric ui={ui} icon={<Clock size={12} />} label={t.total} value={week.totalFormatted} />
            <Metric ui={ui} icon={<Terminal size={12} />} label={t.average} value={week.dailyAverageFormatted} />
            <Metric
              ui={ui}
              icon={<Code2 size={12} />}
              label={t.editor}
              value={week.topEditorName ? `${week.topEditorName}${week.topEditorPercent != null ? ` · ${week.topEditorPercent}%` : ''}` : null}
            />
          </div>

          {languages.length > 0 && (
            <div>
              <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: ui.muted }}>{t.languages}</h4>
              <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
                {languages.map((language) => {
                  const percent = Math.min(100, Math.max(0, Number(language.percent) || 0));
                  return (
                    <li key={language.name}>
                      <div className="mb-1 flex justify-between gap-2 text-xs font-medium" style={{ color: ui.text }}>
                        <span className="truncate">{language.name}</span>
                        <span className="shrink-0 tabular-nums font-semibold">{language.formatted ?? '--'} · {percent}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={language.name}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(percent)}
                        className="h-2 overflow-hidden rounded-full"
                        style={{ background: ui.track }}
                      >
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%`, background: ui.accent }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-lg border border-dashed py-6 text-center text-sm font-medium"
          style={{ color: ui.muted, borderColor: ui.dashed }}
        >
          {week ? t.empty : t.unavailable}
        </div>
      )}

      <footer
        className="mt-4 flex items-center gap-2 border-t pt-3 text-xs tracking-wide"
        style={{ borderColor: ui.border, color: ui.muted }}
      >
        <TrendingUp size={14} style={{ color: ui.accent }} aria-hidden="true" />
        {t.live}
      </footer>
    </article>
  );
}