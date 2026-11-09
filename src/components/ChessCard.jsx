import { useEffect, useId, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import {
  Crown, Trophy, Zap, Timer, Flame, Calendar, Users,
  Puzzle, Target, MapPin, Swords, Percent,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CardShell, CardHeader, CardFooter } from './ui/CardShell';
import StatTile from './ui/StatTile';

const MODE_ICONS = { rapid: Timer, blitz: Zap, bullet: Flame, daily: Calendar };

export function ChessGame({ active = true }) {
  const { i18n } = useTranslation();
  const en = i18n.language.startsWith('en');
  const [game] = useState(() => new Chess());
  const [fen, setFen] = useState(() => game.fen());
  const timer = useRef(null);
  const boardHost = useRef(null);
  const [boardReady, setBoardReady] = useState(false);

  useEffect(() => {
    // react-chessboard needs measurable squares, including after returning from a hidden tab.
    if (typeof ResizeObserver === 'undefined') { setBoardReady(true); return; }
    const observer = new ResizeObserver(([entry]) => setBoardReady(entry.contentRect.width > 0));
    observer.observe(boardHost.current);
    return () => observer.disconnect();
  }, []);
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
    ? (en ? `Checkmate — ${game.turn() === 'w' ? 'Astra wins' : 'you win'}!` : `Xeque-Mate — ${game.turn() === 'w' ? 'a Astra venceu' : 'você venceu'}!`)
    : game.isDraw()
      ? (en ? 'Draw' : 'Empate')
      : `${game.isCheck() ? (en ? 'Check! ' : 'Xeque! ') : ''}${game.turn() === 'w' ? (en ? 'Your turn' : 'Sua vez') : (en ? 'Astra is thinking…' : 'Astra pensando…')}`;

  return (
    <CardShell as="section" aria-label={en ? "Chess game with Astra" : "Partida de xadrez com a Astra"}>
      <h3 className="mb-2 text-lg font-semibold">{en ? 'Play chess with Astra' : 'Jogue xadrez com a Astra'}</h3>
      <p className="mb-3 text-sm text-muted">{en ? 'You play white. Drag a piece to move. Automatic queen promotion. Astra uses random legal moves in this local game.' : 'Você joga com as brancas. Arraste uma peça para jogar. Promoção automática para dama. Nesta partida local, a Astra usa lances legais aleatórios.'}</p>
      <p role="status" aria-live="polite" className="chip chip--accent mb-3 !text-sm">{status}</p>
      <div ref={boardHost} className="mx-auto w-full max-w-[480px]">
        {active && boardReady && <Chessboard options={{
          id,
          position: fen,
          boardOrientation: 'white',
          allowDragging: game.turn() === 'w' && !game.isGameOver(),
          canDragPiece: ({ square }) => game.get(square)?.color === 'w',
          onPieceDrop,
          darkSquareStyle: { backgroundColor: 'var(--chess-dark-square, #3b6ea5)' },
          lightSquareStyle: { backgroundColor: 'var(--chess-light-square, #dbe9f7)' },
        }} />}
      </div>
      <button type="button" onClick={reset} className="chip chip--accent mt-4 !px-4 !py-2 !text-sm">
        {en ? 'Restart game' : 'Reiniciar Partida'}
      </button>
    </CardShell>
  );
}

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

function ResultBar({ wins = 0, draws = 0, losses = 0, size = 'md' }) {
  const total = wins + draws + losses;
  const pct = (n) => `${(n / total) * 100}%`;
  return (
    <div className="meter" data-size={size} aria-hidden="true">
      {total > 0 && (
        <>
          <i style={{ width: pct(wins), background: 'var(--win)' }} />
          <i style={{ width: pct(draws), background: 'var(--muted)' }} />
          <i style={{ width: pct(losses), background: 'var(--loss)' }} />
        </>
      )}
    </div>
  );
}

function ModeCard({ data, t, fmt }) {
  const Icon = MODE_ICONS[data.mode] || Timer;
  return (
    <div className="tile tile--hover">
      <div className="flex items-center justify-between">
        <span className="label-row">
          <Icon size={14} aria-hidden="true" />
          {t(`cards.chess.modos.${data.mode}`, { defaultValue: data.mode })}
        </span>
        {data.winRate !== null && <span className="chip chip--accent">{data.winRate}%</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <strong className="text-3xl font-semibold tabular-nums text-ink">{fmt(data.rating)}</strong>
        {data.best !== null && <span className="text-xs text-muted">{t('cards.chess.melhor')}: {fmt(data.best)}</span>}
      </div>
      <div className="mt-3"><ResultBar wins={data.wins} draws={data.draws} losses={data.losses} /></div>
      <p className="mt-2 text-xs text-muted">
        <span className="text-win">{fmt(data.wins)}</span>{' / '}
        <span>{fmt(data.draws)}</span>{' / '}
        <span className="text-loss">{fmt(data.losses)}</span>
        {' · '}{t('cards.chess.partidasModo', { count: data.games })}
      </p>
    </div>
  );
}

function GameRow({ game, t, locale }) {
  const ModeIcon = MODE_ICONS[game.timeClass] || Timer;
  const result = ['win', 'loss'].includes(game.result) ? game.result : 'draw';
  const modeLabel = t(`cards.chess.modos.${game.timeClass}`, { defaultValue: game.timeClass });
  const colorLabel = game.color === 'white' ? t('cards.chess.brancas') : t('cards.chess.pretas');
  const subline = [modeLabel, colorLabel, game.opening].filter(Boolean).join(' · ');

  return (
    <a href={game.url} target="_blank" rel="noreferrer" className="tile tile--compact flex items-center gap-3">
      <span className={`result-badge result-badge--${result}`}>{t(`cards.chess.resultado.${result}`)}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink">
          {t('cards.chess.contra')} {game.opponent}
          {game.opponentRating ? <span className="ml-1.5 font-medium text-muted">({game.opponentRating})</span> : null}
        </p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted">
          <ModeIcon size={12} className="shrink-0 text-accent" aria-hidden="true" />
          <span className="truncate">{subline}</span>
        </p>
      </div>
      <div className="shrink-0 text-right text-xs">
        {game.accuracy ? <p className="font-bold text-accent">{game.accuracy}% <span className="font-medium text-muted">{t('cards.chess.precisao')}</span></p> : null}
        <p className="text-muted">{timeAgo(game.date, locale)}</p>
      </div>
    </a>
  );
}

export default function ChessCard({ context, lang = 'pt' }) {
  const { t } = useTranslation();
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

  const extras = [
    { key: 'followers', icon: <Users />, label: t('cards.chess.seguidores'), value: fmt(profile.followers), sub: profile.isStreamer ? 'Streamer' : 'Chess.com' },
    puzzles.tactics != null && { key: 'tactics', icon: <Puzzle />, label: t('cards.chess.problemas'), value: fmt(puzzles.tactics), sub: t('cards.chess.melhorRating') },
    puzzles.rush != null && { key: 'rush', icon: <Target />, label: t('cards.chess.puzzleRush'), value: fmt(puzzles.rush), sub: t('cards.chess.melhorPontuacao') },
    chess?.fide != null && { key: 'fide', icon: <Crown />, label: t('cards.chess.fide'), value: fmt(chess.fide), sub: t('cards.chess.ratingOficial') },
  ].filter(Boolean);

  return (
    <CardShell>
      <CardHeader
        icon={Crown}
        title={t('cards.chess.titulo')}
        subtitle={<a className="hud" href={profileUrl} target="_blank" rel="noreferrer">chess.com/member/{username}</a>}
        aside={isConfigured && (
          <span className="chip hidden sm:inline-flex">
            <img src="/perfil-foto.jpeg" alt="" className="profile-photo h-5 w-5 rounded-full" />
            {t('cards.chess.noChessDesde', { year: profile.joinedYear || '--' })}
          </span>
        )}
      />

      {isConfigured ? (
        <>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {profile.title && <span className="chip chip--accent">{profile.title}</span>}
            {profile.name && <span className="text-sm font-bold text-ink">{profile.name}</span>}
            {countryName && <span className="label-row !normal-case !tracking-normal"><MapPin size={12} aria-hidden="true" />{countryName}</span>}
            {lastSeen && <span className="text-xs text-muted">· {t('cards.chess.visto', { when: lastSeen })}</span>}
          </div>

          <div className="card-grid">
            <StatTile icon={<Swords />} label={t('cards.chess.partidas')} value={fmt(totals.games)} sub={t('cards.chess.somandoModos')} />
            <StatTile icon={<Percent />} label={t('cards.chess.taxaVitoria')} value={totals.winRate != null ? `${totals.winRate}%` : null} sub={t('cards.chess.somandoModos')} highlight />
            <StatTile icon={<Trophy />} label={t('cards.chess.vitorias')} value={fmt(totals.wins)} sub={`${fmt(totals.draws)} ${t('cards.chess.empates').toLowerCase()}`} />
            <StatTile icon={<Flame />} label={t('cards.chess.derrotas')} value={fmt(totals.losses)} sub={t('cards.chess.somandoModos')} />
          </div>

          <div className="mt-4">
            <ResultBar wins={totals.wins} draws={totals.draws} losses={totals.losses} size="lg" />
            <div className="mt-2 flex justify-between text-xs font-semibold text-muted">
              <span className="text-win">{t('cards.chess.vitorias')}</span>
              <span>{t('cards.chess.empates')}</span>
              <span className="text-loss">{t('cards.chess.derrotas')}</span>
            </div>
          </div>

          {ratings.length > 0 && (
            <>
              <h4 className="section-label">{t('cards.chess.ratings')}</h4>
              <div className="card-grid card-grid-wide">
                {ratings.map((r) => <ModeCard key={r.mode} data={r} t={t} fmt={fmt} />)}
              </div>
            </>
          )}

          <div className="card-grid mt-3">
            {extras.map(({ key, ...props }) => <StatTile key={key} {...props} />)}
          </div>

          <h4 className="section-label">{t('cards.chess.ultimasPartidas')}</h4>
          {recent.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {recent.map((game, i) => <GameRow key={game.url || i} game={game} t={t} locale={locale} />)}
            </div>
          ) : (
            <div className="empty-box">{t('cards.chess.semPartidas')}</div>
          )}
        </>
      ) : (
        <div className="empty-box">{t('cards.chess.indisponivel')}</div>
      )}

      <CardFooter status={isConfigured ? t('cards.chess.sincronizado') : undefined} live={isConfigured && !chess?.stale} href={profileUrl} label={t('cards.chess.verPerfil')} />
    </CardShell>
  );
}
