import { useContext } from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

const FONT_SANS = "Inter, 'Geist Sans', Roboto, system-ui, sans-serif";
const DAILY_GOAL_SECONDS = 28800; // meta de 8h

// Tokens do design system (Alvinegro + Gold)
const THEME = {
  dark: {
    card: '#1E1E1E',
    border: '#2A2A2A',
    text: '#FFFFFF',
    muted: '#A1A1AA',
    accent: '#FFD700',
    track: '#2A2A2A',
    accentSoft: 'rgba(255, 215, 0, 0.5)',
    dashed: '#3F3F46',
    shadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
  },
  light: {
    card: '#FFFFFF',
    border: '#E5E7EB',
    text: '#121212',
    muted: '#52525B',
    accent: '#D4AF37',
    track: '#E5E7EB',
    accentSoft: 'rgba(212, 175, 55, 0.5)',
    dashed: '#D4D4D8',
    shadow: '0 10px 25px -8px rgba(18, 18, 18, 0.15)',
  },
};

const calcPercent = (seconds) => Math.min(((seconds || 0) / DAILY_GOAL_SECONDS) * 100, 100);

// Linha com rótulo, tempo e barra de progresso
function DayRow({ label, readable, percent, soft = false, ui }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-medium" style={{ color: ui.text }}>
        <span>{label}</span>
        <span className="tabular-nums font-semibold">{readable}</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        className="h-2 overflow-hidden rounded-full"
        style={{ background: ui.track }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${percent}%`,
            background: soft ? ui.accentSoft : ui.accent,
          }}
        />
      </div>
    </div>
  );
}

export default function StatsCard({ context }) {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);
  const ui = darkMode ? THEME.dark : THEME.light;

  const wakatime = context?.wakatime;
  const days = wakatime?.days || [];
  const today = days.at(-1);
  const yesterday = days.at(-2);

  return (
    <article
      className="card-surface w-full max-w-sm p-5 transition-colors duration-300"
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
        <h3 className="card-heading" style={{ color: ui.text }}>
          {t('cards.wakatime.titulo')}
        </h3>
      </div>

      {wakatime?.status === 'ok' && days.length > 0 ? (
        <div className="space-y-4">
          <DayRow
            label={t('cards.wakatime.hoje')}
            readable={today?.readable || '0h 0m'}
            percent={calcPercent(today?.totalSeconds)}
            ui={ui}
          />
          <DayRow
            label={t('cards.wakatime.ontem')}
            readable={yesterday?.readable || '0h 0m'}
            percent={calcPercent(yesterday?.totalSeconds)}
            soft
            ui={ui}
          />
        </div>
      ) : (
        <div
          className="rounded-lg border border-dashed py-4 text-center text-sm"
          style={{ color: ui.muted, borderColor: ui.dashed }}
        >
          {t('cards.wakatime.indisponivelHoje')}
        </div>
      )}

      <footer
        className="mt-4 flex items-center gap-2 border-t pt-3 text-xs tracking-wide"
        style={{ borderColor: ui.border, color: ui.muted }}
      >
        <TrendingUp size={14} style={{ color: ui.accent }} aria-hidden="true" />
        {t('cards.wakatime.aoVivo')}
      </footer>
    </article>
  );
}