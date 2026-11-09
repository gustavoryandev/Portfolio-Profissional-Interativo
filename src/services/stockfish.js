export const STOCKFISH_LEVELS = {
  beginner: 0,
  easy: 4,
  medium: 9,
  hard: 15,
  master: 20,
};

const MOVE_TIME_MS = 500;
const ENGINE_TIMEOUT_MS = 15000;
const BEST_MOVE = /^bestmove ([a-h][1-8])([a-h][1-8])([qrbn])?(?:\s|$)/;

// Keep the released worker and WASM side by side. The worker resolves the WASM
// relative to its own URL, including when the game is opened from /chat.
function startWorker() {
  return new Worker(`${import.meta.env.BASE_URL}stockfish/stockfish-19-lite-single.js`);
}

export function findStockfishMove(fen, skill, { signal, createWorker = startWorker } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const worker = createWorker();
    let phase = 'uci';

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
    const timeout = setTimeout(() => finish(new Error('Stockfish timed out')), ENGINE_TIMEOUT_MS);

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
        send('setoption name UCI_LimitStrength value false', `setoption name Skill Level value ${skill}`, 'isready');
      } else if (phase === 'ready' && line === 'readyok') {
        phase = 'search';
        send(`position fen ${fen}`, `go movetime ${MOVE_TIME_MS}`);
      } else if (phase === 'search' && line.startsWith('bestmove ')) {
        const match = BEST_MOVE.exec(line);
        if (!match) {
          finish(new Error('Stockfish returned no valid UCI move'));
          return;
        }
        const [, from, to, promotion] = match;
        finish(null, { from, to, promotion });
      }
    };
    signal?.addEventListener('abort', abort, { once: true });
    send('uci');
  });
}
