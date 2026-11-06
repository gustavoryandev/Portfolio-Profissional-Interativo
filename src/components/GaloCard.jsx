import { useState, useEffect, useMemo } from 'react';
import { Trophy, MapPin } from 'lucide-react';
import { CardShell, CardHeader, CardFooter } from './ui/CardShell';

const translations = {
  pt: {
    title: 'Próximos jogos do Galo',
    subtitle: 'Clube Atlético Mineiro • Sincronizado com a ESPN • Horários de Brasília',
    home: 'EM CASA', away: 'FORA', nextMatchIn: 'Próximo jogo em', in: 'em',
    day: 'dia', days: 'dias', and: 'e', h: 'h',
    boxDays: 'DIAS', boxHours: 'HORAS', boxMin: 'MIN', boxSec: 'SEG',
    viewTable: 'VER TABELA COMPLETA', empty: 'Nenhum jogo programado no momento.',
    live: 'AO VIVO', today: 'Hoje', tbd: 'A definir',
  },
  en: {
    title: 'Upcoming Galo Matches',
    subtitle: 'Clube Atlético Mineiro • Synced with ESPN • Brasília Time',
    home: 'HOME', away: 'AWAY', nextMatchIn: 'Next match in', in: 'in',
    day: 'day', days: 'days', and: 'and', h: 'h',
    boxDays: 'DAYS', boxHours: 'HOURS', boxMin: 'MIN', boxSec: 'SEC',
    viewTable: 'VIEW FULL TABLE', empty: 'No upcoming matches scheduled.',
    live: 'LIVE', today: 'Today', tbd: 'TBD',
  },
};

const remaining = (target) => {
  const diff = Number.isFinite(target) ? Math.max(0, target - Date.now()) : 0;
  return {
    d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24,
    m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60,
    done: diff === 0,
  };
};

// O estado inicial já é calculado: sem o "00:00:00:00" do primeiro segundo
const Countdown = ({ dateStr, t }) => {
  const target = useMemo(() => new Date(dateStr).getTime(), [dateStr]);
  const [left, setLeft] = useState(() => remaining(target));

  useEffect(() => {
    setLeft(remaining(target));
    if (!Number.isFinite(target) || target <= Date.now()) return undefined;
    const id = setInterval(() => {
      const next = remaining(target);
      setLeft(next);
      if (next.done) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!Number.isFinite(target)) return <p className="mt-3 text-sm text-muted">{t.tbd}</p>;
  const pad = (n) => String(n).padStart(2, '0');
  const boxes = [[left.d, t.boxDays], [left.h, t.boxHours], [left.m, t.boxMin], [left.s, t.boxSec]];
  return (
    <div className="mt-3 flex w-full max-w-xs gap-2">
      {boxes.map(([value, label]) => (
        <div className="count-box" key={label}><strong>{pad(value)}</strong><span>{label}</span></div>
      ))}
    </div>
  );
};

const LEAGUES_PT = {
  'Brazilian Serie A': 'Brasileirão Série A',
  'Brazilian Mineiro 1': 'Campeonato Mineiro',
  'CONMEBOL Libertadores': 'Libertadores',
  'CONMEBOL Sudamericana': 'Copa Sul-Americana',
};

export default function GaloCard({ context, lang = 'pt', limit = 3 }) {
  const t = translations[lang] || translations.pt;
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  // limit === null significa "todos" ([GALO_CARD:ALL]); slice(0, null) retornaria []
  const games = (Array.isArray(context?.galo?.games) ? context.galo.games : []).slice(0, limit ?? undefined);

  const translateLeague = (league) => (lang === 'pt' ? LEAGUES_PT[league] || league : league);

  const formatMatchDate = (dateStr) => {
    const d = new Date(dateStr);
    if (!Number.isFinite(d.getTime())) return t.tbd;
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(d).replace('.', '').toLowerCase();
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d);
    return `${weekday} • ${lang === 'pt' ? `${dd}/${mm}` : `${mm}/${dd}`} • ${time}`;
  };

  const getRelativeTime = (dateStr) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    if (!Number.isFinite(diff)) return t.tbd;
    if (diff <= 0) return t.live;
    const d = Math.floor(diff / 864e5);
    const h = Math.floor(diff / 36e5) % 24;
    return d === 0 ? `${h} ${t.h}` : `${d} ${d === 1 ? t.day : t.days} ${t.and} ${h} ${t.h}`;
  };

  return (
    <CardShell className="match-card">
      <CardHeader
        media={<img src="https://a.espncdn.com/i/teamlogos/soccer/500/7632.png" alt="" />}
        title={t.title}
        subtitle={t.subtitle}
      />

      {games.length > 0 ? (
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {games.map((game, idx) => {
            const isNextMatch = idx === 0 && game.state === 'pre';
            return (
              <li key={game.id} className="match-row tile tile--flush flex items-stretch">
                <div className="match-league flex w-24 shrink-0 flex-col items-center justify-center gap-3 border-r border-dashed border-line px-2 py-4">
                  <p className="text-center text-xs font-bold uppercase leading-tight text-muted">{translateLeague(game.league)}</p>
                  <Trophy size={18} className="text-accent" aria-hidden="true" />
                </div>

                <div className="match-body flex min-w-0 flex-1 flex-col p-4">
                  <div className="mb-4 flex items-center justify-center gap-3 md:gap-5">
                    <div className="match-team flex min-w-0 flex-1 items-center justify-end gap-3">
                      <span className="break-words text-right text-[15px] font-bold text-ink md:text-base">{game.home.name}</span>
                      <img src={game.home.logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
                    </div>
                    <span className="text-xs font-bold text-muted">X</span>
                    <div className="match-team flex min-w-0 flex-1 items-center justify-start gap-3">
                      <img src={game.away.logo} alt="" className="h-10 w-10 shrink-0 object-contain" />
                      <span className="break-words text-left text-[15px] font-bold text-ink md:text-base">{game.away.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-wider md:gap-4">
                    <span className={`chip ${game.isHome ? 'chip--solid' : ''}`}>{game.isHome ? t.home : t.away}</span>
                    <span className="text-muted">{formatMatchDate(game.date)}</span>
                    <span className="flex items-center gap-1 text-muted">
                      <MapPin size={12} aria-hidden="true" /> {game.venue === 'A definir' && lang === 'en' ? t.tbd : game.venue}
                    </span>
                  </div>

                  {isNextMatch ? (
                    <div className="mt-5 flex flex-col items-center border-t border-dashed border-line pt-5">
                      <span className="text-xs font-bold text-accent">{t.nextMatchIn} {getRelativeTime(game.date)}</span>
                      <Countdown dateStr={game.date} t={t} />
                    </div>
                  ) : (
                    <div className="mt-3 flex justify-center md:justify-start">
                      <span className="text-xs font-bold text-accent md:ml-2">{t.in} {getRelativeTime(game.date)}</span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-box">{t.empty}</div>
      )}

      {games.length > 0 && (
        <CardFooter href="https://www.espn.com.br/futebol/time/calendario/_/id/7632/atletico-mg" label={t.viewTable} />
      )}
    </CardShell>
  );
}
