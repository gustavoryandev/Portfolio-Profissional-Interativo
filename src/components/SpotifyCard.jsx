import { Music, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SpotifyCard({ context }) {
  const { t } = useTranslation();
  
  // Lendo os dados ao vivo do Spotify
  const spotify = context?.spotify;
  const isPlaying = spotify?.playing;
  const trackName = spotify?.track || 'Spotify Offline';
  const artists = spotify?.artists?.join(', ') || 'Nenhuma música tocando';

  return <article className="card-surface relative flex w-full max-w-sm items-center gap-4 overflow-hidden p-5">
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${isPlaying ? 'bg-emerald-500/15 text-emerald-400 animate-pulse' : 'bg-zinc-800 text-zinc-500'}`}><Music size={26} /></div>
    <div className="flex-1 overflow-hidden">
      <p className={`flex items-center gap-2 text-xs uppercase tracking-wider ${isPlaying ? 'text-emerald-400' : 'text-zinc-500'}`}>
        <Radio size={13} className={isPlaying ? 'animate-pulse' : ''} />
        {isPlaying ? t('cards.spotify.tocando') : 'OFFLINE'}
      </p>
      <h3 className="mt-1 font-bold text-white truncate" title={trackName}>{trackName}</h3>
      <p className="text-sm text-zinc-400 truncate" title={artists}>{artists}</p>
    </div>
  </article>;
}