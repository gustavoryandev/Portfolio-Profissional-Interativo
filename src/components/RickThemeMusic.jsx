import { useContext } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeState';

export default function RickThemeMusic() {
  const { theme, musicStatus, toggleMusic } = useContext(ThemeContext) ?? {};
  const { t } = useTranslation();
  if (theme !== 'rick-morty') return null;
  const active = musicStatus === 'playing' || musicStatus === 'loading';
  const label = t(active ? 'rick.music.pause' : musicStatus === 'error' ? 'rick.music.retry' : 'rick.music.play');
  return <button type="button" className="icon-button rick-theme-music" onClick={toggleMusic}
    aria-label={label} title={label} aria-pressed={active}>
    {active ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
    <span className="sr-only" role="status">{musicStatus === 'error' ? t('rick.music.error') : ''}</span>
  </button>;
}
