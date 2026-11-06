import { CardShell } from './ui/CardShell';

// Logo SVG oficial do Spotify
const SpotifyLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const ExplicitBadge = () => (
  <span className="flex shrink-0 items-center justify-center rounded-[3px] bg-muted px-1 text-xs font-semibold leading-4 text-panel">E</span>
);

// Fora do componente: não é recriado (nem remontado) a cada render
function ListSection({ title, items, isArtist, empty }) {
  return (
    <div className="min-w-0 flex-1">
      <h3 className="mb-4 text-center text-[15px] font-bold text-ink">{title}</h3>
      <div className="flex flex-col gap-4">
        {items.length > 0 ? items.map((item, idx) => (
          <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
            <span className="w-3 text-right text-[13px] font-bold text-ink">{idx + 1}</span>
            <img src={item.image} alt="" className={`h-11 w-11 shrink-0 object-cover shadow-sm ${isArtist ? 'rounded-full' : 'rounded-md'}`} />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="break-words text-[13px] font-bold text-ink transition-colors group-hover:text-[#1DB954]">{item.name}</span>
              {!isArtist && (
                <div className="mt-0.5 flex min-w-0 items-start gap-1.5">
                  {item.explicit && <ExplicitBadge />}
                  <span className="break-words text-xs font-medium text-muted">{item.artists}</span>
                </div>
              )}
            </div>
          </a>
        )) : (
          <p className="mt-4 text-center text-xs italic text-muted">{empty}</p>
        )}
      </div>
    </div>
  );
}

export default function SpotifyCard({ context, lang = 'pt' }) {
  const en = lang.startsWith('en');
  const { current, recent = [], topTracks = [], topArtists = [] } = context?.spotify || {};
  const empty = en ? 'Not enough data yet.' : 'Ainda sem dados suficientes.';

  return (
    <CardShell className="spotify-card" size="lg">
      <h2 className="mb-5 text-center text-xl font-semibold text-ink">{en ? 'Gustavo’s Spotify' : 'Spotify do Gustavo'}</h2>

      <div className="mb-5 flex flex-col items-center">
        <h3 className="mb-4 text-sm font-bold text-ink">{en ? 'Currently listening to' : 'Ouvindo agora'}</h3>
        {current ? (
          <a href={current.url} target="_blank" rel="noreferrer" className="group flex flex-col items-center">
            <img src={current.image} alt="" className="mb-3 h-16 w-16 rounded-md shadow-md transition-transform group-hover:scale-105" />
            <span className="text-center text-[15px] font-bold text-ink transition-colors group-hover:text-[#1DB954]">{current.name}</span>
            <div className="mt-0.5 flex min-w-0 items-start gap-1.5">
              {current.explicit && <ExplicitBadge />}
              <span className="text-center text-xs font-medium text-muted">{current.artists}</span>
            </div>
          </a>
        ) : (
          <span className="text-sm font-medium text-muted">{en ? 'Nothing playing right now.' : 'Nenhuma música tocando agora.'}</span>
        )}
      </div>

      <div className="card-grid card-grid-wide">
        <ListSection title={en ? 'Recently played' : 'Reproduzidas recentemente'} items={recent} empty={empty} />
        <ListSection title={en ? 'Top tracks' : 'Músicas favoritas'} items={topTracks} empty={empty} />
        <ListSection title={en ? 'Top artists' : 'Artistas favoritos'} items={topArtists} isArtist empty={empty} />
      </div>

      <div className="mt-5 flex items-end justify-between border-t border-line pt-5">
        <SpotifyLogo className="h-7 w-7 text-[#1DB954]" />
        <span className="hud tracking-[0.2em]">GUSTAVORYAN.AI</span>
      </div>
    </CardShell>
  );
}
