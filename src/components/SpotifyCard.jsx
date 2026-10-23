import React, { useContext } from 'react';
import { Music, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

export default function SpotifyCard({ context }) {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);

  const spotify = context?.spotify;
  const isPlaying = spotify?.playing;
  const trackName = spotify?.track || 'Spotify Offline';
  const artists = spotify?.artists?.join(', ') || 'Nenhuma música tocando agora';

  return (
    <div className={`my-2 flex w-full max-w-sm items-center gap-4 rounded-2xl border p-5 transition-colors duration-300 ${darkMode ? 'bg-[#0f0f0f] border-amber-500/20' : 'bg-white border-gray-200 shadow-sm'}`}>
      <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm ${isPlaying ? 'bg-emerald-500/15 text-emerald-500 animate-pulse' : (darkMode ? 'bg-[#1a1a1a] text-zinc-600' : 'bg-gray-100 text-gray-400')}`}>
        <Music size={30} />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${isPlaying ? 'text-emerald-500' : (darkMode ? 'text-zinc-500' : 'text-gray-400')}`}>
          <Radio size={12} className={isPlaying ? 'animate-pulse' : ''} />
          {isPlaying ? t('cards.spotify.tocando') : 'OFFLINE'}
        </p>
        <h3 className={`mt-1 truncate text-[15px] font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`} title={trackName}>
          {trackName}
        </h3>
        <p className={`truncate text-[13px] ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`} title={artists}>
          {artists}
        </p>
      </div>
    </div>
  );
}