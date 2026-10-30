import React, { useState, useEffect, useContext } from 'react';
import { Trophy, MapPin, ExternalLink } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

// Dicionário de Traduções
const translations = {
  pt: {
    title: "Próximos jogos do Galo",
    subtitle: "Clube Atlético Mineiro • Sincronizado com a ESPN • Horários de Brasília",
    home: "EM CASA",
    away: "FORA",
    nextMatchIn: "Próximo jogo em",
    in: "em",
    day: "dia",
    days: "dias",
    and: "e",
    h: "h",
    boxDays: "DIAS",
    boxHours: "HORAS",
    boxMin: "MIN",
    boxSec: "SEG",
    viewTable: "VER TABELA COMPLETA",
    empty: "Nenhum jogo programado no momento.",
    live: "AO VIVO",
    today: "Hoje",
    tbd: "A definir"
  },
  en: {
    title: "Upcoming Galo Matches",
    subtitle: "Clube Atlético Mineiro • Synced with ESPN • Brasília Time",
    home: "HOME",
    away: "AWAY",
    nextMatchIn: "Next match in",
    in: "in",
    day: "day",
    days: "days",
    and: "and",
    h: "h",
    boxDays: "DAYS",
    boxHours: "HOURS",
    boxMin: "MIN",
    boxSec: "SEC",
    viewTable: "VIEW FULL TABLE",
    empty: "No upcoming matches scheduled.",
    live: "LIVE",
    today: "Today",
    tbd: "TBD"
  }
};

// Hook de Contagem Regressiva
const Countdown = ({ dateStr, t, darkMode }) => {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const target = new Date(dateStr).getTime();
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [dateStr]);

  const pad = (num) => num.toString().padStart(2, '0');

  const boxClass = `flex flex-col items-center rounded-md px-3 py-1.5 min-w-0 flex-1 border ${darkMode ? 'bg-black/60 border-brand-500/20' : 'bg-gray-100 border-brand-500/30 shadow-sm'}`;
  const textClass = `text-lg font-semibold leading-none ${darkMode ? 'text-white' : 'text-gray-900'}`;

  return (
    <div className="flex w-full max-w-xs gap-2 mt-3">
      <div className={boxClass}>
        <span className={textClass}>{pad(timeLeft.d)}</span>
        <span className="text-[9px] text-brand-500 font-bold mt-1 tracking-wider">{t.boxDays}</span>
      </div>
      <div className={boxClass}>
        <span className={textClass}>{pad(timeLeft.h)}</span>
        <span className="text-[9px] text-brand-500 font-bold mt-1 tracking-wider">{t.boxHours}</span>
      </div>
      <div className={boxClass}>
        <span className={textClass}>{pad(timeLeft.m)}</span>
        <span className="text-[9px] text-brand-500 font-bold mt-1 tracking-wider">{t.boxMin}</span>
      </div>
      <div className={boxClass}>
        <span className={textClass}>{pad(timeLeft.s)}</span>
        <span className="text-[9px] text-brand-500 font-bold mt-1 tracking-wider">{t.boxSec}</span>
      </div>
    </div>
  );
};

export default function GaloCard({ context, lang = 'pt', limit = 3 }) {
  const { darkMode } = useContext(ThemeContext);
  const t = translations[lang] || translations.pt;

  const games = context?.galo?.games?.slice(0, limit) || [];

  // Tradutor de Ligas (A API da ESPN costuma retornar os nomes padrão em inglês)
  const translateLeague = (league) => {
    if (lang !== 'pt') return league;
    const dict = {
      'Brazilian Serie A': 'Brasileirão Série A',
      'Brazilian Mineiro 1': 'Campeonato Mineiro',
      'CONMEBOL Libertadores': 'Libertadores',
      'CONMEBOL Sudamericana': 'Copa Sul-Americana'
    };
    return dict[league] || league;
  };

  const formatMatchDate = (dateStr) => {
    const d = new Date(dateStr);
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US';

    // Dia da semana curto (seg, ter / mon, tue)
    let weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).replace('.', '').toLowerCase();

    // Formato de data (DD/MM ou MM/DD dependendo do idioma)
    const dayMonth = lang === 'pt'
      ? `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
      : `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;

    // Hora (24h para pt, 12h para en)
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d);

    return `${weekday} • ${dayMonth} • ${time}`;
  };

  const getRelativeTime = (dateStr) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (diff <= 0) return t.live;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);

    const dayStr = d === 1 ? t.day : t.days;

    if (d === 0) return `${h} ${t.h}`;
    return `${d} ${dayStr} ${t.and} ${h} ${t.h}`;
  };

  return (
    <div className={`portfolio-card match-card my-4 w-full max-w-2xl rounded-xl border p-5 transition-colors duration-300 ${darkMode ? 'bg-[#050E17] border-brand-500/20' : 'bg-white border-gray-200 shadow-sm'}`}>

      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <div className={`rounded-lg p-2 flex items-center justify-center border shadow-sm ${darkMode ? 'bg-zinc-950 border-[var(--line)]' : 'bg-gray-50 border-gray-200'}`}>
          <img src="https://a.espncdn.com/i/teamlogos/soccer/500/7632.png" alt="Galo" className="w-7 h-7 object-contain drop-shadow-md" />
        </div>
        <div>
          <h3 className={`text-[18px] font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{t.title}</h3>
          <p className={`text-[11px] font-medium ${darkMode ? 'text-[var(--muted)]' : 'text-gray-500'}`}>{t.subtitle}</p>
        </div>
      </div>

      {/* Lista de Jogos */}
      <div className="space-y-4">
        {games.length > 0 ? games.map((game, idx) => {
          const isNextMatch = idx === 0 && game.state === 'pre';

          return (
            <div key={game.id} className={`match-row relative flex items-stretch rounded-xl border transition-colors ${darkMode ? 'bg-[#0B192B] border-[#163A59]' : 'bg-gray-50 border-gray-100'}`}>

              {/* Lado Esquerdo - Liga e Troféu */}
              <div className={`flex flex-col items-center justify-center match-league w-20 shrink-0 px-2 py-4 border-r border-dashed ${darkMode ? 'border-[#333]' : 'border-gray-200'}`}>
                <p className={`text-[9px] font-bold text-center uppercase mb-3 leading-tight ${darkMode ? 'text-[var(--muted)]' : 'text-gray-500'}`}>
                  {translateLeague(game.league)}
                </p>
                <Trophy size={18} className="text-brand-500/60" />
              </div>

              {/* Lado Direito - Times e Infos */}
              <div className="match-body min-w-0 flex-1 flex flex-col p-4">

                {/* Placar / Times */}
                <div className="flex items-center justify-center gap-3 md:gap-5 mb-4">
                  <div className="match-team flex min-w-0 flex-1 items-center gap-3 justify-end">
                    <span className={`text-[14px] md:text-[16px] font-bold text-right break-words ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{game.home.name}</span>
                    <img src={game.home.logo} alt={game.home.name} className="w-10 h-10 shrink-0 object-contain drop-shadow-sm" />
                  </div>

                  <div className={`text-[11px] font-bold ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>X</div>

                  <div className="match-team flex min-w-0 flex-1 items-center gap-3 justify-start">
                    <img src={game.away.logo} alt={game.away.name} className="w-10 h-10 shrink-0 object-contain drop-shadow-sm" />
                    <span className={`text-[14px] md:text-[16px] font-bold text-left break-words ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{game.away.name}</span>
                  </div>
                </div>

                {/* Badges e Local */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4 text-[10px] font-bold uppercase tracking-wider">
                  <span className={`px-2 py-0.5 rounded-sm ${game.isHome ? 'bg-blue-600 text-white' : (darkMode ? 'bg-zinc-800 text-zinc-300' : 'bg-gray-200 text-gray-600')}`}>
                    {game.isHome ? t.home : t.away}
                  </span>
                  <span className={darkMode ? 'text-zinc-400' : 'text-gray-500'}>
                    {formatMatchDate(game.date)}
                  </span>
                  <span className={`flex items-center gap-1 ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>
                    <MapPin size={10} /> {game.venue === 'A definir' && lang === 'en' ? t.tbd : game.venue}
                  </span>
                </div>

                {/* Seção Condicional (Contagem Regressiva vs Texto Simples) */}
                {isNextMatch ? (
                  <div className={`mt-5 pt-5 border-t border-dashed flex flex-col items-center ${darkMode ? 'border-[#163A59]' : 'border-gray-200'}`}>
                    <span className="text-[12px] font-bold text-brand-500 flex items-center gap-1.5">
                      {t.nextMatchIn} {getRelativeTime(game.date)}
                    </span>
                    <Countdown dateStr={game.date} t={t} darkMode={darkMode} />
                  </div>
                ) : (
                  <div className="mt-3 flex justify-center md:justify-start">
                    <span className="text-[10px] font-bold text-brand-500/80 md:ml-2">
                      {t.in} {getRelativeTime(game.date)}
                    </span>
                  </div>
                )}

              </div>
            </div>
          );
        }) : (
          <div className={`py-6 text-center text-sm rounded-xl border border-dashed ${darkMode ? 'text-[var(--muted)] border-[var(--line)] bg-[#0B192B]' : 'text-zinc-400 border-gray-200 bg-gray-50'}`}>
            {t.empty}
          </div>
        )}
      </div>

      {/* Footer Link */}
      {games.length > 0 && (
        <div className="mt-5 flex justify-end">
          <a
            href="https://www.espn.com.br/futebol/time/calendario/_/id/7632/atletico-mg"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] font-bold text-brand-500 hover:text-brand-400 uppercase tracking-wider transition-colors"
          >
            {t.viewTable} <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
