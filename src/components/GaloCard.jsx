import React, { useContext, useEffect, useState } from 'react';
import { Trophy, MapPin, ExternalLink, Info } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

export default function GaloCard({ context, limit = 3 }) {
  const { darkMode } = useContext(ThemeContext);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const galo = context?.galo || {};
  const allGames = galo.games || [];
  
  // Mágica aqui: Corta os jogos baseado no limite pedido pela IA (se limit for null, mostra todos)
  const games = limit ? allGames.slice(0, limit) : allGames;
  const isConfigured = galo.status === 'ok';

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).toLowerCase();
      const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      return { dayName, date, time };
    } catch (e) {
      return { dayName: '--', date: '--', time: '--' };
    }
  };

  const getDetailedCountdown = (dateStr) => {
    const diff = new Date(dateStr) - now;
    if (diff <= 0) return null;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return { d, h, m, s };
  };

  const TimeBox = ({ value, label }) => (
    <div className={`flex flex-col items-center justify-center rounded-lg border w-[52px] h-[56px] ${darkMode ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-gray-300'}`}>
      <span className={`text-[19px] font-black leading-none tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${darkMode ? 'text-zinc-500' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <article className={`my-4 w-full max-w-[850px] rounded-2xl border p-5 md:p-6 transition-colors duration-300 ${
      darkMode ? 'bg-[#0f0f0f] border-amber-500/30 shadow-[0_0_20px_rgba(0,0,0,0.5)]' : 'bg-gray-50 border-amber-500/30 shadow-md'
    }`}>
      
      <div className="mb-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-5 border-b border-zinc-800/40 pb-5 text-center sm:text-left">
        <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7632.png" alt="Galo" className="w-10 h-10 object-contain drop-shadow-md" />
        <div>
          <h3 className={`text-[22px] font-black tracking-tight ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
            Próximos jogos do Galo
          </h3>
          <p className={`text-[12px] font-medium mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
            Clube Atlético Mineiro • Sincronizado com a ESPN • Horários de Brasília
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {isConfigured && games.length > 0 ? (
          games.map((game, index) => {
            const { dayName, date, time } = formatDate(game.date);
            const isFirst = index === 0;
            const countdown = getDetailedCountdown(game.date);
            
            const homeIsGalo = game.home.name.includes('Atlético');
            const awayIsGalo = game.away.name.includes('Atlético');

            return (
              <div key={game.id} className={`relative flex flex-col p-5 rounded-[14px] border transition-all ${
                darkMode ? 'bg-[#141414] border-[#222]' : 'bg-white border-gray-200 shadow-sm'
              }`}>
                
                <span className={`absolute top-4 left-5 text-[11px] font-bold tracking-wide ${darkMode ? 'text-zinc-300' : 'text-gray-700'}`}>
                  {game.league}
                </span>

                <div className="flex flex-col sm:flex-row items-center mt-6 sm:mt-2 gap-4 sm:gap-6">
                  <div className="hidden sm:flex flex-col items-center justify-center w-[72px] shrink-0">
                    {game.leagueLogo ? (
                      <img src={game.leagueLogo} alt={game.league} className="w-[52px] h-[52px] object-contain drop-shadow-sm opacity-90" />
                    ) : (
                      <Trophy size={32} className="text-amber-500/80" />
                    )}
                  </div>

                  <div className="flex-1 w-full flex flex-col justify-center sm:pl-2">
                    <div className="flex items-center justify-center sm:justify-start gap-4 sm:gap-6 mb-3">
                      <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
                        <span className={`text-[16px] sm:text-[18px] font-bold text-right leading-tight ${homeIsGalo ? 'text-amber-500' : (darkMode ? 'text-white' : 'text-black')}`}>
                          {game.home.name}
                        </span>
                        <img src={game.home.logo} alt={game.home.name} className="w-10 h-10 sm:w-[46px] sm:h-[46px] object-contain drop-shadow-md" />
                      </div>
                      
                      <span className={`text-[11px] font-black ${darkMode ? 'text-zinc-600' : 'text-gray-300'}`}>x</span>
                      
                      <div className="flex items-center justify-start gap-3 sm:gap-4 flex-1">
                        <img src={game.away.logo} alt={game.away.name} className="w-10 h-10 sm:w-[46px] sm:h-[46px] object-contain drop-shadow-md" />
                        <span className={`text-[16px] sm:text-[18px] font-bold text-left leading-tight ${awayIsGalo ? 'text-amber-500' : (darkMode ? 'text-white' : 'text-black')}`}>
                          {game.away.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-[11px] font-semibold mt-1">
                      <span className={`px-2 py-0.5 rounded-[4px] border font-black uppercase tracking-wider ${
                        game.isHome 
                          ? (darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-amber-100 border-amber-200 text-amber-600') 
                          : (darkMode ? 'bg-zinc-800/80 border-[#333] text-zinc-400' : 'bg-gray-100 border-gray-200 text-gray-500')
                      }`}>
                        {game.isHome ? 'EM CASA' : 'FORA'}
                      </span>
                      
                      <span className={`${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                        {dayName} • {date} • {time}
                      </span>
                      
                      <span className={`flex items-center gap-1 ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
                        <MapPin size={11} className="text-red-500/80" /> {game.venue}
                      </span>
                    </div>
                    
                    {countdown ? (
                      isFirst ? (
                        <div className="mt-4 flex flex-col items-center sm:items-start sm:border-t sm:border-dashed sm:border-zinc-800 sm:pt-4">
                          <span className={`text-[12px] font-bold text-amber-500 mb-2.5`}>
                            Próximo jogo em {countdown.d} dia{countdown.d !== 1 && 's'} e {countdown.h} h
                          </span>
                          <div className="flex gap-2">
                            <TimeBox value={countdown.d} label="Dias" />
                            <TimeBox value={countdown.h} label="Horas" />
                            <TimeBox value={countdown.m} label="Min" />
                            <TimeBox value={countdown.s} label="Seg" />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 flex justify-center sm:justify-start text-[12px] font-bold text-amber-500">
                          em {countdown.d} dia{countdown.d !== 1 && 's'} e {countdown.h} h
                        </div>
                      )
                    ) : (
                      <div className="mt-3 flex justify-center sm:justify-start text-[12px] font-bold text-emerald-500 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                        Partida em andamento ou finalizada hoje
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`py-12 flex flex-col items-center justify-center text-center text-sm font-medium rounded-[14px] border border-dashed ${darkMode ? 'text-zinc-500 border-zinc-800 bg-[#141414]' : 'text-zinc-400 border-gray-300 bg-gray-50'}`}>
            <Info size={32} className="mb-3 opacity-20" />
            Nenhum jogo oficial agendado no momento.
          </div>
        )}
      </div>
      
      <div className={`mt-5 flex justify-end`}>
        <a 
          href="https://www.espn.com.br/futebol/time/calendario/_/id/7632/atletico-mg" 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-500 transition-colors hover:text-amber-400"
        >
          Ver tabela completa <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}