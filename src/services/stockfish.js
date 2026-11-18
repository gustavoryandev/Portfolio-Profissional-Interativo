export const STOCKFISH_LEVELS = {
  beginner: 0,
  easy: 4,
  medium: 9,
  hard: 15,
  master: 20,
};

const MOVE_TIME_MS = 500;
export const REVIEW_MODES = {
  deep: { depth: 24, nodes: 2000000, movetime: 12000 },
  quick: { depth: 16, nodes: 200000, movetime: 1200 },
};
const ENGINE_TIMEOUT_MS = 15000;
const REVIEW_TIMEOUT_MS = 25000;
const BEST_MOVE = /^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?(?:\s|$)/;

// Keep the released worker and WASM side by side. The worker resolves the WASM
// relative to its own URL, including when the game is opened from /chat.
function startWorker() {
  return new Worker(`${import.meta.env?.BASE_URL ?? '/'}stockfish/stockfish-19-lite-single.js`);
}

export function findStockfishMove(fen, skill, options) {
  return searchPosition(fen, skill, options);
}

const reviewCache = new Map();
const MAX_CACHED_SEARCHES = 256;

export async function evaluateStockfishPosition(fen, options = {}) {
  options.signal?.throwIfAborted();
  // Exact completed results only. Full FEN retains the fifty-move clock;
  // mode, root restriction and MultiPV must match. Custom engines bypass it.
  const key = JSON.stringify([fen, options.mode ?? (options.deep ? 'deep' : 'preview'),
    options.candidate ?? '', options.multiPV ?? 1]);
  const cached = !options.createWorker && reviewCache.get(key);
  if (cached) {
    reviewCache.delete(key);
    reviewCache.set(key, cached);
    return structuredClone(cached);
  }
  const result = await searchPosition(fen, STOCKFISH_LEVELS.master, { ...options, evaluate: true });
  options.signal?.throwIfAborted();
  if (!options.createWorker) {
    reviewCache.set(key, structuredClone(result));
    if (reviewCache.size > MAX_CACHED_SEARCHES) reviewCache.delete(reviewCache.keys().next().value);
  }
  return result;
}

function searchPosition(fen, skill, { signal, createWorker = startWorker, evaluate = false, deep = false, mode, candidate, multiPV = 1 } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const worker = createWorker();
    let phase = 'uci';
    let evaluation;
    const variants = new Map();
    const budget = mode ? REVIEW_MODES[mode] : deep ? REVIEW_MODES.deep : null;

    function finish(error, move) {
      if (phase === 'done') return;
      phase = 'done';
      clearTimeout(timeout);
      signal?.removeEventListener('abort', abort);
      worker.onmessage = worker.onerror = worker.onmessageerror = null;
      worker.terminate();
      if (error) reject(error);
      else resolve(move);
    }

    const abort = () => finish(signal.reason);
    const timeout = setTimeout(() => finish(new Error('Stockfish timed out')), budget ? REVIEW_TIMEOUT_MS : ENGINE_TIMEOUT_MS);

    function send(...commands) {
      try {
        for (const command of commands) worker.postMessage(command);
      } catch (error) {
        finish(error);
      }
    }

    worker.onerror = worker.onmessageerror = () => finish(new Error('Stockfish failed to load or respond'));
    worker.onmessage = ({ data }) => {
      if (typeof data !== 'string') return;
      const line = data.trim();
      if (phase === 'uci' && line === 'uciok') {
        phase = 'ready';
        send('setoption name UCI_LimitStrength value false', `setoption name Skill Level value ${skill}`);
        if (multiPV > 1 && !candidate) send(`setoption name MultiPV value ${multiPV}`);
        send('isready');
      } else if (phase === 'ready' && line === 'readyok') {
        phase = 'search';
        const limit = budget ? `go depth ${budget.depth} nodes ${budget.nodes} movetime ${budget.movetime}` : `go movetime ${MOVE_TIME_MS}`;
        send(`position fen ${fen}`, candidate ? `${limit} searchmoves ${candidate}` : limit);
      } else if (evaluate && phase === 'search' && line.startsWith('info ')) {
        const score = /\bscore (cp|mate) (-?\d+) (?!lowerbound|upperbound).*?\bpv (.+)$/.exec(line);
        if (score) {
          const rank = Number(/\bmultipv (\d+)/.exec(line)?.[1] ?? 1);
          const result = { unit: score[1], value: Number(score[2]), line: score[3].split(/\s+/),
            depth: Number(/\bdepth (\d+)/.exec(line)?.[1] ?? 0),
            nodes: Number(/\bnodes (\d+)/.exec(line)?.[1] ?? 0),
            time: Number(/\btime (\d+)/.exec(line)?.[1] ?? 0) };
          variants.set(rank, result);
          if (rank === 1) evaluation = result;
        }
      } else if (phase === 'search' && line.startsWith('bestmove ')) {
        const match = BEST_MOVE.exec(line);
        if (!match) {
          finish(new Error('Stockfish returned no valid UCI move'));
          return;
        }
        const [, from, to, promotion] = match;
        if (evaluate && !evaluation) {
          finish(new Error('Stockfish returned no evaluation'));
          return;
        }
        finish(null, evaluate ? { ...evaluation, variants: [...variants.values()].filter(item => item.depth === evaluation.depth) } : { from, to, promotion });
      }
    };
    signal?.addEventListener('abort', abort, { once: true });
    send('uci');
  });
}
