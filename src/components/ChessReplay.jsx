import { useEffect, useId, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { BookOpen, Check, Star, ThumbsUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CardShell } from './ui/CardShell';
import { MAX_PGN_LENGTH, parseChessReplay } from '../services/chessReplay';
import { chessAccuracy, reviewChessGame, reviewPosition } from '../services/chessReview';
import './ChessReplay.css';

const GRADE_SYMBOLS = {
  brilliant: '!!', great: '!', missed: '×', best: '★', excellent: '!', good: '✓',
  inaccuracy: '?!', mistake: '?', blunder: '??', book: '▤',
};
const GRADE_ICONS = { best: Star, excellent: ThumbsUp, good: Check, book: BookOpen };

function MoveBadge({ grade, label, square }) {
  const Icon = GRADE_ICONS[grade];
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return (
    <span className="chess-replay-badge" data-grade={grade} role="img" aria-label={label} title={label}
      style={{ left: `${(file + 0.94) * 12.5}%`, top: `${(8 - rank + 0.07) * 12.5}%` }}>
      {Icon ? <Icon size="63%" aria-hidden="true" /> : GRADE_SYMBOLS[grade]}
    </span>
  );
}
const GRADE_COLORS = {
  great: 'text-sky-700 dark:text-sky-300',
  missed: 'text-rose-700 dark:text-rose-300',
  brilliant: 'text-cyan-700 dark:text-cyan-300',
  best: 'text-emerald-700 dark:text-emerald-300',
  excellent: 'text-green-700 dark:text-green-300',
  good: 'text-lime-700 dark:text-lime-300',
  inaccuracy: 'text-yellow-700 dark:text-yellow-300',
  mistake: 'text-orange-700 dark:text-orange-300',
  blunder: 'text-red-700 dark:text-red-300',
  book: 'text-amber-800 dark:text-amber-200',
};

export default function ChessReplay({ initialReplay, active }) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'chat.chessReplay' });
  const [replay, setReplay] = useState(initialReplay);
  const [pgn, setPgn] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [variation, setVariation] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [retry, setRetry] = useState(0);
  const [reviewing, setReviewing] = useState(true);
  const [reviewError, setReviewError] = useState(false);
  const [grades, setGrades] = useState([]);
  const [mode, setMode] = useState('deep');
  const [lineSource, setLineSource] = useState('reply');
  const reviewPositions = useRef([]);
  const host = useRef(null);
  const moveList = useRef(null);
  const [boardReady, setBoardReady] = useState(false);
  const id = useId();
  const selected = replay?.moves[index - 1];
  const fen = selected?.after ?? replay?.initial;
  const count = replay?.moves.length ?? 0;
  const localScore = analysis?.replay === replay && analysis?.index === index ? analysis : null;
  const score = reviewPositions.current[index] ?? localScore;
  const selectedGrade = grades[index - 1];
  const reviewComplete = count > 0 && grades.length === count;
  const accuracy = replay ? chessAccuracy(replay.moves, grades) : null;
  const counted = color => grades.filter((grade, offset) => grade.accuracy != null && replay.moves[offset].color === color).length;

  useEffect(() => {
    const list = moveList.current;
    const button = list?.querySelector('[aria-pressed="true"]');
    if (!button) return;
    const bounds = list.getBoundingClientRect();
    const item = button.getBoundingClientRect();
    if (item.top < bounds.top) list.scrollTop += item.top - bounds.top;
    else if (item.bottom > bounds.bottom) list.scrollTop += item.bottom - bounds.bottom;
  }, [index, replay]);

  useEffect(() => {
    if (!active || !replay || !reviewing) return;
    const controller = new AbortController();
    const positions = reviewPositions.current;
    reviewChessGame(replay, {
      signal: controller.signal,
      positions,
      mode,
      start: Math.max(0, positions.length - 1),
      onProgress(offset, before, after, result) {
        positions[offset] = before;
        positions[offset + 1] = after;
        setGrades(current => offset < current.length ? current : [...current, result]);
      },
    }).then(() => {
      if (!controller.signal.aborted) setReviewing(false);
    }).catch(() => {
      if (controller.signal.aborted) return;
      setReviewError(true);
      setReviewing(false);
    });
    return () => controller.abort();
  }, [active, replay, reviewing, mode]);

  useEffect(() => {
    if (!fen || !host.current) return;
    if (typeof ResizeObserver === 'undefined') { setBoardReady(true); return; }
    const observer = new ResizeObserver(([entry]) => setBoardReady(entry.contentRect.width > 0));
    observer.observe(host.current);
    return () => observer.disconnect();
  }, [Boolean(fen)]);

  useEffect(() => {
    if (!playing || !active || index >= count) return;
    const timer = setTimeout(() => {
      setIndex(index + 1);
      if (index + 1 === count) setPlaying(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, [active, count, index, playing]);

  useEffect(() => {
    if (!active || !fen || playing || reviewing || reviewPositions.current[index]) return;
    const controller = new AbortController();
    const position = new Chess(fen);
    async function evaluate() {
      try {
        const result = await reviewPosition(position, { signal: controller.signal });
        if (!controller.signal.aborted) setAnalysis({ replay, index, ...result });
      } catch {
        if (!controller.signal.aborted) setAnalysis({ replay, index, error: true });
      }
    }
    const timer = setTimeout(evaluate, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [active, fen, index, playing, replay, retry, reviewing]);


  function load(text) {
    try {
      const game = parseChessReplay(text);
      setReplay(game);
      reviewPositions.current = [];
      setGrades([]);
      setReviewError(false);
      setReviewing(true);
      setIndex(0);
      setPlaying(false);
      setVariation(null);
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  }

  function goTo(next) {
    setPlaying(false);
    setVariation(null);
    setIndex(next);
  }

  const displayLine = lineSource === 'best' && selectedGrade ? selectedGrade.best.line : score?.line;
  const suggested = displayLine?.[0];
  const variationMove = variation === null ? null : displayLine?.[variation];
  const whiteShare = score?.unit === 'mate'
    ? (score.value === 0 ? fen.split(' ')[1] === 'b' : score.whiteValue > 0) ? 100 : 0
    : 50 + 50 * Math.tanh((score?.whiteValue ?? 0) / 500);
  const evaluationLabel = score?.terminal === 'draw' ? t('draw') : score?.unit === 'mate'
    ? (score.value === 0 ? t('checkmate') : `${score.whiteValue > 0 ? '+' : '-'}M${Math.abs(score.value)}`)
    : new Intl.NumberFormat(i18n.language, { signDisplay: 'exceptZero', minimumFractionDigits: 2 }).format((score?.whiteValue ?? 0) / 100);
  const originSquare = { boxShadow: 'inset 0 0 0 100px rgb(182 213 127 / 36%)' };
  const targetSquare = { boxShadow: 'inset 0 0 0 100px rgb(249 215 128 / 45%)' };
  const moveLabel = selectedGrade ? t(`grades.${selectedGrade.grade}`) : null;
  const checkmate = selected && new Chess(fen).isCheckmate();
  const reason = checkmate ? { key: 'checkmate', move: selected.san } : selectedGrade?.reason;
  const reasonText = reason && t(`reasons.${reason.key}`, {
    ...reason,
    drop: reason.drop ? new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }).format(reason.drop / 100) : undefined,
  });
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 1 });

  return (
    <CardShell as="section" aria-label={t('title')}>
      <h3 className="mb-1 text-lg font-semibold">{t('title')}</h3>
      <p className="mb-3 text-xs text-muted">{t('localOnly')}</p>
      <details open={!replay} className="mb-3">
        <summary className="cursor-pointer text-sm font-semibold">{t('import')}</summary>
        <div className="mt-2 space-y-2">
          <textarea aria-label={t('pgn')} placeholder="1. e4 e5 2. Nf3 Nc6" value={pgn}
            onChange={event => setPgn(event.target.value)} maxLength={MAX_PGN_LENGTH}
            className="min-h-24 w-full rounded-lg border border-line bg-panel-soft p-2 text-sm text-ink" />
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="chip chip--accent min-h-11" disabled={!pgn.trim()} onClick={() => load(pgn)}>{t('load')}</button>
            <input aria-label={t('file')} type="file" accept=".pgn" className="min-w-0 max-w-full text-sm"
              onChange={async event => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (!file) return;
                try {
                  if (file.size > MAX_PGN_LENGTH) throw new Error('PGN too large');
                  load(await file.text());
                } catch { setInvalid(true); }
              }} />
          </div>
        </div>
      </details>
      {invalid && <p role="alert" className="mb-3 text-sm text-ink">{t('invalid')}</p>}
      {replay && (
        <div className="chess-replay">
          <div className="chess-replay-layout">
            <div className="chess-replay-board space-y-2">
              <div ref={host} className="relative w-full">
                {active && boardReady && <Chessboard options={{
                  id, position: variationMove?.after ?? fen, allowDragging: false, allowDrawingArrows: false, showAnimations: playing,
                  darkSquareStyle: { backgroundColor: 'var(--chess-dark-square, #3b6ea5)' },
                  lightSquareStyle: { backgroundColor: 'var(--chess-light-square, #dbe9f7)' },
                  squareStyles: variationMove ? { [variationMove.from]: originSquare, [variationMove.to]: targetSquare }
                    : selected ? { [selected.from]: originSquare, [selected.to]: targetSquare } : {},
                  arrows: suggested && lineSource === 'reply' && !playing && variation === null ? [{ startSquare: suggested.from, endSquare: suggested.to, color: 'rgba(245, 173, 30, 0.8)' }] : [],
                }} />}
                {active && boardReady && selected && selectedGrade && variation === null && (
                  <MoveBadge grade={selectedGrade.grade} label={moveLabel} square={selected.to} />
                )}
              </div>
              {score && !score.error && !playing && (
                <div aria-label={t('evaluation')} className="flex items-center gap-2 text-sm">
                  <div aria-hidden="true" className="h-2 flex-1 overflow-hidden rounded-full border border-line bg-neutral-900">
                    <div className="h-full bg-white" style={{ width: `${whiteShare}%` }} />
                  </div>
                  <span className="font-mono">{evaluationLabel}</span>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" className="chip min-h-11" disabled={!index} onClick={() => goTo(index - 1)}>{t('previous')}</button>
                <button type="button" className="chip chip--accent min-h-11" onClick={() => {
                  setVariation(null);
                  if (!playing && index === count) setIndex(0);
                  setPlaying(!playing);
                }}>{t(playing ? 'pause' : 'play')}</button>
                <button type="button" className="chip min-h-11" disabled={index === count} onClick={() => goTo(index + 1)}>{t('next')}</button>
                <span className="text-sm text-muted">{index}/{count}</span>
              </div>
            </div>
            <div className="chess-replay-analysis space-y-2">
              <div className="rounded-lg border border-line bg-panel-soft px-3 py-2 text-sm">
                <label className="flex items-center justify-between gap-2 mb-2">
                  {t('mode')}
                  <select className="rounded border border-line bg-panel text-ink p-1" value={mode} onChange={event => {
                    setMode(event.target.value);
                    reviewPositions.current = [];
                    setGrades([]);
                    setAnalysis(null);
                    setVariation(null);
                    setReviewError(false);
                    setReviewing(true);
                  }}>
                    <option value="deep">{t('deep')}</option>
                    <option value="quick">{t('quick')}</option>
                  </select>
                </label>
                <p className="text-xs font-semibold" title={t('accuracyNote')}>{t('accuracy')}</p>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {['w', 'b'].map(color => (
                    <div key={color} className="flex flex-wrap items-baseline gap-x-2">
                      <span className="text-muted">{t(color === 'w' ? 'white' : 'black')}</span>
                      <strong className="tabular-nums">{accuracy?.[color] == null ? '—' : percent.format(accuracy[color] / 100)}</strong>
                      <span className="text-xs text-muted">{t('counted', { count: counted(color) })}</span>
                    </div>
                  ))}
                </div>
                {!reviewComplete && <progress className="w-full" aria-label={t('reviewProgress', { done: grades.length, total: count })} value={grades.length} max={count} />}
                <details className="mt-2 text-xs text-muted"><summary>{t('method')}</summary><p>{t('accuracyNote')}</p><p>{t('methodDetails')}</p></details>
                {!reviewComplete && <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <p role="status">{reviewError ? t('reviewFailed') : t('reviewProgress', { done: grades.length, total: count })}</p>
                  <button type="button" className="chip min-h-8" onClick={() => {
                    setReviewError(false);
                    setReviewing(!reviewing);
                  }}>{t(reviewing ? 'pauseReview' : 'resumeReview')}</button>
                </div>}
              </div>
              <div ref={moveList} className="chess-replay-moves overflow-y-auto rounded-lg border border-line p-1" role="group" aria-label={t('moves')}>
                <button type="button" className="chip min-h-11" aria-pressed={index === 0} onClick={() => goTo(0)}>{t('start')}</button>
                {replay.moves.map((move, offset) => (
                  <button type="button" key={offset} className={`chip min-h-11 ${index === offset + 1 ? 'chip--accent' : ''}`}
                    aria-label={grades[offset] ? `${move.before.split(' ')[5]}${move.color === 'w' ? '.' : '...'} ${move.san} · ${t(`grades.${grades[offset].grade}`)}` : undefined}
                    aria-pressed={index === offset + 1} onClick={() => goTo(offset + 1)}>
                    {move.before.split(' ')[5]}{move.color === 'w' ? '.' : '...'} {move.san}
                    {grades[offset] && <span className={`ml-1 font-bold ${GRADE_COLORS[grades[offset].grade]}`}
                      title={t(`grades.${grades[offset].grade}`)} aria-hidden="true">{GRADE_SYMBOLS[grades[offset].grade]}</span>}
                  </button>
                ))}
              </div>
              {(selectedGrade || checkmate) && <div className="space-y-1 text-sm" aria-live={playing ? 'off' : 'polite'}>
                <p className={`font-semibold ${GRADE_COLORS[selectedGrade?.grade] ?? ''}`}>{selectedGrade ? GRADE_SYMBOLS[selectedGrade.grade] : '#'} {moveLabel ?? t('checkmate')}</p>
                {reasonText && <p className="text-muted">{reasonText}</p>}
                {selectedGrade?.book && <p className="text-xs text-muted">{selectedGrade.book.eco} · {selectedGrade.book.name}</p>}
                {selectedGrade && <p className="text-xs text-muted">{t('depth', { best: selectedGrade.depth ?? '—', played: selectedGrade.playedDepth ?? '—' })}</p>}
              </div>}
              {!playing && <div className="space-y-2">
                {score?.error ? <button type="button" className="chip min-h-11" onClick={() => {
                  setAnalysis(null);
                  setRetry(value => value + 1);
                }}>{t('retry')}</button> : score ? <>
                  {selectedGrade && <div className="flex gap-2 text-xs">
                    {['reply', 'best'].map(source => <button type="button" className="chip" aria-pressed={lineSource === source} key={source} onClick={() => { setLineSource(source); setVariation(null); }}>{t(`lineSource.${source}`)}</button>)}
                  </div>}
                  {suggested && <p className="text-sm text-muted">{t('suggestion', { line: displayLine.slice(0, 8).map(move => move.san).join(' ') })}{displayLine.length > 8 ? ' …' : ''}</p>}
                  {suggested && <div className="chess-replay-variation flex gap-2">
                    {variation === null ? <button type="button" className="chip min-h-11" onClick={() => setVariation(0)}>{t('showLine')}</button>
                      : <>
                        <button type="button" className="chip min-h-11" onClick={() => setVariation(null)}>{t('returnGame')}</button>
                        {displayLine.map((move, offset) => <button type="button" className="chip min-h-11" key={offset}
                          aria-pressed={variation === offset} onClick={() => setVariation(offset)}>{move.san}</button>)}
                      </>}
                  </div>}
                </> : <p role="status" className="text-sm text-muted">{t('evaluating')}</p>}
              </div>}
            </div>
          </div>
        </div>
      )}
    </CardShell>
  );
}
