import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

// Logo SVG Oficial do Spotify
const SpotifyLogo = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.84.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

export default function SpotifyCard({ context }) {
  const { darkMode } = useContext(ThemeContext);

  const spotify = context?.spotify || {};
  const { current, recent = [], topTracks = [], topArtists = [] } = spotify;

  // Componente reutilizável para cada coluna (Faixas, Artistas, Recentes)
  const ListSection = ({ title, items, isArtist }) => (
    <div className="flex-1 min-w-[200px]">
      <h3 className={`text-center mb-6 font-bold text-[15px] ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      <div className="flex flex-col gap-4">
        {items.length > 0 ? items.map((item, idx) => (
          <a key={idx} href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 group">
            <span className={`w-3 text-right text-[13px] font-bold ${darkMode ? 'text-white' : 'text-black'}`}>{idx + 1}</span>
            <img src={item.image} alt={item.name} className={`w-11 h-11 object-cover shadow-sm ${isArtist ? 'rounded-full' : 'rounded-md'}`} />
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className={`truncate text-[13px] font-bold transition-colors ${darkMode ? 'text-white group-hover:text-[#1DB954]' : 'text-black group-hover:text-[#1DB954]'}`}>{item.name}</span>
              {!isArtist && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.explicit && <span className={`shrink-0 text-[8px] px-1 py-[1px] rounded-[3px] font-black flex items-center justify-center ${darkMode ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-600 text-white'}`}>E</span>}
                  <span className={`truncate text-[11px] font-medium ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{item.artists}</span>
                </div>
              )}
            </div>
          </a>
        )) : (
          <p className={`text-center text-[12px] italic mt-4 ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>Ainda sem dados suficientes.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className={`my-4 w-full max-w-4xl rounded-[32px] border p-6 md:p-8 transition-colors duration-300 relative ${darkMode ? 'bg-[#0f0f0f] border-zinc-800/80 shadow-xl' : 'bg-white border-gray-200 shadow-xl'}`}>
      
      {/* Cabeçalho */}
      <h2 className={`text-center text-xl md:text-2xl font-black mb-8 ${darkMode ? 'text-white' : 'text-black'}`}>Gustavo's Spotify Data</h2>
      
      {/* Música Atual (Currently Listening To) */}
      <div className="flex flex-col items-center mb-10">
        <h3 className={`text-[14px] font-bold mb-4 ${darkMode ? 'text-white' : 'text-black'}`}>Currently Listening To</h3>
        {current ? (
           <a href={current.url} target="_blank" rel="noreferrer" className="flex flex-col items-center group">
               <img src={current.image} alt={current.name} className="w-16 h-16 rounded-md shadow-md mb-3 group-hover:scale-105 transition-transform" />
               <span className={`font-bold text-[15px] text-center ${darkMode ? 'text-white group-hover:text-[#1DB954]' : 'text-black group-hover:text-[#1DB954]'}`}>{current.name}</span>
               <div className="flex items-center gap-1.5 mt-0.5">
                  {current.explicit && <span className={`shrink-0 text-[8px] px-1 py-[1px] rounded-[3px] font-black flex items-center justify-center ${darkMode ? 'bg-zinc-300 text-zinc-900' : 'bg-zinc-600 text-white'}`}>E</span>}
                  <span className={`text-[12px] font-medium text-center ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>{current.artists}</span>
               </div>
           </a>
        ) : (
           <span className={`text-[14px] font-medium ${darkMode ? 'text-zinc-500' : 'text-gray-400'}`}>Nothing</span>
        )}
      </div>

      {/* Grade de Listas em 3 Colunas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
         <ListSection title="Recently Played Tracks" items={recent} />
         <ListSection title="Top Tracks" items={topTracks} />
         <ListSection title="Top Artists" items={topArtists} isArtist />
      </div>

      {/* Rodapé da Identidade Visual */}
      <div className="mt-10 flex justify-between items-end border-t pt-5 border-zinc-800/50">
         <SpotifyLogo className="w-7 h-7 text-[#1DB954]" />
         <span className={`text-[10px] font-bold tracking-[0.2em] ${darkMode ? 'text-zinc-600' : 'text-gray-400'}`}>GUSTAVORYAN.AI</span>
      </div>
    </div>
  );
}