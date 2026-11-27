import { useContext, useId, useRef } from 'react';
import { SlidersHorizontal, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeState';

export default function RickThemeMusic({ className = '' }) {
  const { theme, dimension, musicStatus, musicVolume, toggleMusic } = useContext(ThemeContext) ?? {};
  const { t } = useTranslation();
  if (theme !== 'rick-morty') return null;
  const active = musicStatus === 'playing' || musicStatus === 'loading';
  const unavailable = musicStatus === 'unavailable';
  const trackControls = dimension === 'beyond-curve' ? 'rick.beyond.music' : 'rick.music';
  const label = t(unavailable ? 'rick.music.state.unavailable' : active ? `${trackControls}.pause` : musicStatus === 'error' ? 'rick.music.retry'
    : musicStatus === 'ended' ? 'rick.music.replay' : `${trackControls}.play`);
  return <button type="button" className={`icon-button rick-theme-music ${className}`} onClick={toggleMusic}
    aria-label={label} title={label} aria-pressed={active} disabled={unavailable}>
    {active && musicVolume > 0 ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
    <span className="sr-only" role="status">{['loading', 'error', 'ended'].includes(musicStatus) ? t(`rick.music.state.${musicStatus}`) : ''}</span>
  </button>;
}

export function RickThemeControls({ mobile = false }) {
  const { theme, musicStatus, musicVolume, changeMusicVolume, effectsPaused, changeEffectsPaused } = useContext(ThemeContext) ?? {};
  const { t } = useTranslation();
  const id = useId();
  const trigger = useRef(null);
  if (theme !== 'rick-morty') return null;

  function position(event) {
    if (event.newState !== 'open') return;
    const button = trigger.current.getBoundingClientRect();
    const below = window.innerHeight - button.bottom;
    const above = button.top;
    const up = below < 235 && above > below;
    // Keep the settings reachable when opened from the mobile navigation sheet.
    Object.assign(event.currentTarget.style, {
      top: up ? 'auto' : `${button.bottom + 8}px`,
      bottom: up ? `${window.innerHeight - button.top + 8}px` : 'auto',
      maxHeight: `${Math.max(60, (up ? above : below) - 16)}px`,
    });
    event.currentTarget.style.setProperty('--rick-settings-right', `${window.innerWidth - button.right}px`);
  }
  return <div className={`rick-media-controls${mobile ? ' rick-mobile-media' : ''}`}>
    <RickThemeMusic />
    <button ref={trigger} type="button" className="icon-button rick-media-settings" popoverTarget={id}
      aria-label={t('rick.music.settings')} title={t('rick.music.settings')}>
      <SlidersHorizontal size={17} aria-hidden="true" />
    </button>
    <div id={id} className="rick-settings-popover" popover="auto" role="group" aria-label={t('rick.music.settings')} onBeforeToggle={position}>
      <label className="rick-volume-label" htmlFor={`${id}-volume`}>
        <span>{t('rick.music.volume')}</span><span aria-hidden="true">{musicVolume}%</span>
      </label>
      <input id={`${id}-volume`} className="rick-music-volume" type="range" min="0" max="100" step="1" value={musicVolume}
        aria-valuetext={`${musicVolume}%`} onChange={event => changeMusicVolume(event.currentTarget.valueAsNumber)} />
      <p>{t(`rick.music.state.${musicStatus}`)}</p>
      <label className="rick-effects-option">
        <input type="checkbox" checked={effectsPaused} onChange={event => changeEffectsPaused(event.currentTarget.checked)} />
        <span>{t('rick.music.pauseEffects')}</span>
      </label>
    </div>
  </div>;
}
