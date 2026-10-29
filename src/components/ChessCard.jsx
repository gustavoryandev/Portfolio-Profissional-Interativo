import React, { useContext, useEffect, useId, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  Crown, ExternalLink, Trophy, Zap, Timer, Flame, Calendar, Users,
  Puzzle, Target, MapPin, Swords, Percent
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeContext';

const MODE_ICONS = { rapid: Timer, blitz: Zap, bullet: Flame, daily: Calendar };

function ChessGame() {
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(() => game.fen());
  const timer = useRef(null);
  const id = useId();

  useEffect(() => {
    if (game.turn() !== 'b' || game.isGameOver()) return;
    timer.current = setTimeout(() => {
      const moves = game.moves();
      if (game.turn() === 'b' && !game.isGameOver() && moves.length) {
        game.move(moves[Math.floor(Math.random() * moves.length)]);
        setFen(game.fen());
      }
      timer.current = null;
    }, 450);
    return () => clearTimeout(timer.current);
  }, [game, fen]);

  function onPieceDrop({ sourceSquare, targetSquare }) {
    if (!targetSquare || game.turn() !== 'w' || game.isGameOver()) return false;
    try {
      game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' });
      setFen(game.fen());
      return true;
    } catch {
      return false;
    }
  }

  function reset() {
    clearTimeout(timer.current);
    timer.current = null;
    game.reset();
    setFen(game.fen());
  }

  const status = game.isCheckmate()
    ? `Xeque-Mate — ${game.turn() === 'w' ? 'o bot venceu' : 'você venceu'}!`
    : game.isDraw()
      ? 'Empate'
      : `${game.isCheck() ? 'Xeque! ' : ''}${game.turn() === 'w' ? 'Sua vez' : 'Bot pensando…'}`;

  return (
    <section className="mb-6 rounded-xl border border-[#f59e0b]/50 bg-zinc-900 p-3 text-[#f59e0b] sm:p-4" aria-label="Partida de xadrez contra o bot">
      <h3 className="mb-2 text-lg font-semibold">Vamos jogar xadrez?</h3>
      <p className="mb-3 text-sm text-zinc-300">Você joga com as brancas. Arraste uma peça para jogar. Promoção automática para dama.</p>
      <p role="status" aria-live="polite" className="mb-3 inline-block rounded-full border border-[#f59e0b]/50 px-3 py-1 text-sm">{status}</p>
      <div className="mx-auto w-full max-w-[480px]">
        <Chessboard options={{
          id,
          position: fen,
          boardOrientation: 'white',
          allowDragging: game.turn() === 'w' && !game.isGameOver(),
          canDragPiece: ({ square }) => game.get(square)?.color === 'w',
          onPieceDrop,
          darkSquareStyle: { backgroundColor: '#92400e' },
          lightSquareStyle: { backgroundColor: '#fef3c7' },
        }} />
      </div>
      <button type="button" onClick={reset} className="mt-4 rounded-lg border border-[#f59e0b] px-4 py-2 text-sm font-semibold hover:bg-amber-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
        Reiniciar Partida
      </button>
    </section>
  );
}

const RESULT_STYLES = {
  win: {
    dark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    light: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  loss: {
    dark: 'bg-red-500/15 text-red-400 border-red-500/30',
    light: 'bg-red-50 text-red-600 border-red-200'
  },
  draw: {
    dark: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    light: 'bg-gray-100 text-gray-600 border-gray-200'
  }
};

function timeAgo(iso, locale) {
  if (!iso) return null;
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  return rtf.format(Math.round(diff / (86400 * 30)), 'month');
}

function StatBox({ icon, label, value, sub, highlight = false }) {
  const { darkMode } = useContext(ThemeContext);
  return (
    <div className={`flex flex-col rounded-xl p-3.5 transition-colors border ${
      darkMode
        ? 'bg-[#0B192B] border-[#163A59] hover:border-sky-500/40'
        : 'bg-white border-gray-200 hover:border-sky-500/50 shadow-sm'
    }`}>
      <div className={`flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase mb-1.5 ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
        {React.cloneElement(icon, { size: 14, className: 'text-sky-500' })}
        {label}
      </div>
      <strong className={`text-xl font-bold ${highlight ? 'text-sky-500' : darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value ?? '--'}
      </strong>
      <p className={`mt-0.5 text-[11px] font-medium leading-tight ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>
        {sub}
      </p>
    </div>
  );
}

function ResultBar({ wins = 0, draws = 0, losses = 0, height = 'h-2' }) {
  const { darkMode } = useContext(ThemeContext);
  const total = wins + draws + losses;
  const track = darkMode ? 'bg-zinc-800' : 'bg-gray-200';
  if (!total) return <div className={`${height} w-full rounded-full ${track}`} />;
  const pct = (n) => `${(n / total) * 100}%`;
  return (
    <div className={`flex ${height} w-full overflow-hidden rounded-full ${track}`}>
      <div className="bg-emerald-500" style={{ width: pct(wins) }} />
      <div className="bg-zinc-500" style={{ width: pct(draws) }} />
      <div className="bg-red-500" style={{ width: pct(losses) }} />
    </div>
  );
}

function SectionTitle({ children }) {
  const { darkMode } = useContext(ThemeContext);
  return (
    <h4 className={`mb-3 mt-6 text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
      {children}
    </h4>
  );
}

function ModeCard({ data, t, fmt }) {
  const { darkMode } = useContext(ThemeContext);
  const Icon = MODE_ICONS[data.mode] || Timer;
  return (
    <div className={`rounded-xl border p-4 transition-colors ${
      darkMode
        ? 'bg-[#0B192B] border-[#163A59] hover:border-sky-500/40'
        : 'bg-white border-gray-200 hover:border-sky-500/50 shadow-sm'
    }`}>
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
          <Icon size={14} className="text-sky-500" />
          {t(`cards.chess.modos.${data.mode}`, { defaultValue: data.mode })}
        </div>
        {data.winRate !== null && (
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-500">
            {data.winRate}%
          </span>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <strong className={`text-3xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{fmt(data.rating)}</strong>
        {data.best !== null && (
          <span className={`text-[11px] font-medium ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>
            {t('cards.chess.melhor')}: {fmt(data.best)}
          </span>
        )}
      </div>

      <div className="mt-3">
        <ResultBar wins={data.wins} draws={data.draws} losses={data.losses} height="h-1.5" />
      </div>
      <p className={`mt-2 text-[11px] font-medium ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>
        <span className="text-emerald-500">{fmt(data.wins)}</span>
        {' / '}
        <span className={darkMode ? 'text-zinc-400' : 'text-gray-500'}>{fmt(data.draws)}</span>
        {' / '}
        <span className="text-red-500">{fmt(data.losses)}</span>
        {' · '}
        {t('cards.chess.partidasModo', { count: data.games })}
      </p>
    </div>
  );
}

function GameRow({ game, t, locale }) {
  const { darkMode } = useContext(ThemeContext);
  const style = RESULT_STYLES[game.result] || RESULT_STYLES.draw;
  const ModeIcon = MODE_ICONS[game.timeClass] || Timer;
  const modeLabel = t(`cards.chess.modos.${game.timeClass}`, { defaultValue: game.timeClass });
  const colorLabel = game.color === 'white' ? t('cards.chess.brancas') : t('cards.chess.pretas');
  const subline = [modeLabel, colorLabel, game.opening].filter(Boolean).join(' · ');

  return (
    <a
      href={game.url}
      target="_blank"
      rel="noreferrer"
      className={`group flex items-center gap-3 rounded-xl border p-3 transition-all hover:border-sky-500/30 ${
        darkMode ? 'bg-[#0B192B] border-[#163A59]' : 'bg-white border-gray-100 hover:shadow-md'
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-[13px] font-semibold ${darkMode ? style.dark : style.light}`}>
        {t(`cards.chess.resultado.${game.result}`)}
      </span>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-[14px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {t('cards.chess.contra')} {game.opponent}
          {game.opponentRating ? <span className={`ml-1.5 font-medium ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>({game.opponentRating})</span> : null}
        </p>
        <p className={`flex items-center gap-1.5 truncate text-[12px] ${darkMode ? 'text-[var(--muted)]' : 'text-gray-500'}`}>
          <ModeIcon size={12} className="shrink-0 text-sky-500/80" />
          <span className="truncate">{subline}</span>
        </p>
      </div>

      <div className="shrink-0 text-right">
        {game.accuracy ? (
          <p className="text-[12px] font-bold text-sky-500">
            {game.accuracy}% <span className={`font-medium ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>{t('cards.chess.precisao')}</span>
          </p>
        ) : null}
        <p className={`text-[11px] ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>{timeAgo(game.date, locale)}</p>
      </div>
    </a>
  );
}

export default function ChessCard({ context, lang = 'pt' }) {
  const { t } = useTranslation();
  const { darkMode } = useContext(ThemeContext);

  const chess = context?.chess;
  const isConfigured = chess?.status === 'ok';
  const profile = chess?.profile || {};
  const totals = chess?.totals || {};
  const ratings = chess?.ratings || [];
  const recent = chess?.recent || [];
  const puzzles = chess?.puzzles || {};

  const username = profile.username || 'seunome6679';
  const profileUrl = profile.url || `https://www.chess.com/member/${username}`;
  const locale = lang === 'en' ? 'en-US' : 'pt-BR';
  const fmt = (n) => (n === null || n === undefined ? '--' : Number(n).toLocaleString(locale));

  let countryName = null;
  try {
    if (profile.country) countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(profile.country);
  } catch {
    countryName = profile.country || null;
  }

  const lastSeen = timeAgo(profile.lastOnline, locale);
  const muted = darkMode ? 'text-zinc-400' : 'text-gray-500';

  const extras = [
    { key: 'followers', icon: <Users />, label: t('cards.chess.seguidores'), value: fmt(profile.followers), sub: profile.isStreamer ? 'Streamer' : 'Chess.com' },
    puzzles.tactics != null && { key: 'tactics', icon: <Puzzle />, label: t('cards.chess.problemas'), value: fmt(puzzles.tactics), sub: t('cards.chess.melhorRating') },
    puzzles.rush != null && { key: 'rush', icon: <Target />, label: t('cards.chess.puzzleRush'), value: fmt(puzzles.rush), sub: t('cards.chess.melhorPontuacao') },
    chess?.fide != null && { key: 'fide', icon: <Crown />, label: t('cards.chess.fide'), value: fmt(chess.fide), sub: t('cards.chess.ratingOficial') }
  ].filter(Boolean);

  return (
    <article className={`portfolio-card my-3 w-full max-w-[700px] rounded-xl border p-6 transition-colors duration-300 ${
      darkMode ? 'bg-[#050E17] border-sky-500/20 shadow-sm' : 'bg-gray-50 border-gray-200 shadow-md'
    }`}>

      <ChessGame />

      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2.5 bg-black text-sky-500 border border-[var(--line)] shadow-md">
            <Crown className="h-7 w-7" />
          </div>
          <div>
            <h3 className={`text-[19px] font-semibold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('cards.chess.titulo')}
            </h3>
            <a
              href={profileUrl}
              target="_blank"
              rel="noreferrer"
              className={`text-[12px] font-mono font-medium hover:text-sky-500 transition-colors ${muted}`}
            >
              chess.com/member/{username}
            </a>
          </div>
        </div>

        {isConfigured && profile.avatar && (
          <div className={`hidden sm:flex items-center gap-2.5 rounded-full border px-3 py-1.5 ${darkMode ? 'bg-[#0B192B] border-[#222]' : 'bg-white border-gray-300'}`}>
            <img src={profile.avatar} alt="Avatar" className="w-6 h-6 rounded-full border border-sky-500/30" />
            <span className={`text-[11px] font-bold tracking-wide uppercase ${darkMode ? 'text-zinc-400' : 'text-gray-600'}`}>
              {t('cards.chess.noChessDesde', { year: profile.joinedYear || '--' })}
            </span>
          </div>
        )}
      </div>

      {isConfigured ? (
        <>
          {/* IDENTIDADE */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {profile.title && (
              <span className="rounded-md border border-sky-500/40 bg-sky-500/10 px-2 py-0.5 text-[11px] font-semibold text-sky-500">
                {profile.title}
              </span>
            )}
            {profile.name && (
              <span className={`text-[14px] font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{profile.name}</span>
            )}
            {countryName && (
              <span className={`flex items-center gap-1 text-[12px] font-medium ${muted}`}>
                <MapPin size={12} className="text-sky-500" /> {countryName}
              </span>
            )}
            {lastSeen && (
              <span className={`text-[12px] font-medium ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>
                · {t('cards.chess.visto', { when: lastSeen })}
              </span>
            )}
          </div>

          {/* VISÃO GERAL */}
          <div className="card-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox icon={<Swords />} label={t('cards.chess.partidas')} value={fmt(totals.games)} sub={t('cards.chess.somandoModos')} />
            <StatBox icon={<Percent />} label={t('cards.chess.taxaVitoria')} value={totals.winRate != null ? `${totals.winRate}%` : null} sub={t('cards.chess.somandoModos')} highlight />
            <StatBox icon={<Trophy />} label={t('cards.chess.vitorias')} value={fmt(totals.wins)} sub={`${fmt(totals.draws)} ${t('cards.chess.empates').toLowerCase()}`} />
            <StatBox icon={<Flame />} label={t('cards.chess.derrotas')} value={fmt(totals.losses)} sub={t('cards.chess.somandoModos')} />
          </div>

          <div className="mt-4">
            <ResultBar wins={totals.wins} draws={totals.draws} losses={totals.losses} height="h-2.5" />
            <div className={`mt-2 flex justify-between text-[11px] font-semibold ${muted}`}>
              <span className="text-emerald-500">{t('cards.chess.vitorias')}</span>
              <span>{t('cards.chess.empates')}</span>
              <span className="text-red-500">{t('cards.chess.derrotas')}</span>
            </div>
          </div>

          {/* RATINGS POR MODO */}
          {ratings.length > 0 && (
            <>
              <SectionTitle>{t('cards.chess.ratings')}</SectionTitle>
              <div className="card-grid grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ratings.map((r) => <ModeCard key={r.mode} data={r} t={t} fmt={fmt} />)}
              </div>
            </>
          )}

          {/* EXTRAS */}
          <div className="mt-3 card-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
            {extras.map(({ key, ...props }) => <StatBox key={key} {...props} />)}
          </div>

          {/* ÚLTIMAS PARTIDAS */}
          <SectionTitle>{t('cards.chess.ultimasPartidas')}</SectionTitle>
          {recent.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {recent.map((game, i) => <GameRow key={game.url || i} game={game} t={t} locale={locale} />)}
            </div>
          ) : (
            <div className={`py-6 text-center text-sm rounded-xl border border-dashed ${darkMode ? 'text-[var(--muted)] border-[var(--line)] bg-[#0B192B]' : 'text-zinc-400 border-gray-200 bg-gray-50'}`}>
              {t('cards.chess.semPartidas')}
            </div>
          )}
        </>
      ) : (
        <div className={`py-12 text-center text-sm font-medium rounded-xl border border-dashed ${darkMode ? 'text-[var(--muted)] border-[var(--line)]' : 'text-zinc-400 border-gray-300'}`}>
          {t('cards.chess.indisponivel')}
        </div>
      )}

      {/* FOOTER */}
      <div className={`mt-6 flex items-center justify-between border-t pt-4 ${darkMode ? 'border-[#222]' : 'border-gray-200'}`}>
        <span className={`text-[11px] font-bold tracking-widest uppercase flex items-center gap-2 ${darkMode ? 'text-[var(--muted)]' : 'text-gray-400'}`}>
          <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></div>
          {t('cards.chess.sincronizado')}
        </span>
        <a
          href={profileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[12px] font-bold text-sky-500 transition-colors hover:text-sky-400"
        >
          {t('cards.chess.verPerfil')} <ExternalLink size={14} />
        </a>
      </div>
    </article>
  );
}
