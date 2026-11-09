import { createAudio } from './audio.js';
import { difficulties, gameIds, games } from './catalog.js';
import { validArcadeAction } from './commands.js';
import { getRecords, saveSession } from './records.js';
import { clamp } from './games/shared.js';

const loaders = {
  snake: () => import('./games/snake.js'),
  pong: () => import('./games/pong.js'),
  frogger: () => import('./games/frogger.js'),
  maze: () => import('./games/maze.js'),
  blocks: () => import('./games/blocks.js'),
};
export const playableGames = gameIds.filter(game => Object.hasOwn(loaders, game));

export const fixedStep = 1 / 120;
const validInputs = new Set(['up', 'down', 'left', 'right', 'drop', 'hold', 'reverse']);

export function createArcadeSession({ isFull, load = game => loaders[game](), save = saveSession }) {
  const audio = createAudio();
  const listeners = new Set();
  let generation = 0;
  let engine = null;
  let run = null;
  let status = 'lobby';
  let snapshot;
  let signature;
  let records;
  let inputSources = new Map();

  function publish() {
    const state = engine?.state;
    const game = run?.game ?? null;
    const availableActions = ['arcade.open', 'game.start', 'game.getState'];
    if (run) availableActions.push('game.restart', 'game.exit', 'game.setDifficulty');
    if (status === 'running') availableActions.push('game.pause');
    if (status === 'paused') availableActions.push('game.resume');
    const value = {
      game, status, difficulty: run?.difficulty, score: state?.score ?? 0, level: state?.level ?? 1,
      lives: state?.lives ?? null, timeLeft: state?.timeLeft == null ? null : Math.ceil(state.timeLeft),
      seconds: Math.floor(run?.seconds ?? 0), result: state?.result,
      metrics: state ? { ...state.metrics } : {}, best: game ? records.games[game].best : 0,
      challenge: run?.challenge ? games[game].target : null, sound: audio.enabled, availableActions,
      size: engine ? [engine.width, engine.height] : null,
    };
    const serialized = JSON.stringify(value);
    if (serialized === signature) return;
    signature = serialized;
    snapshot = value;
    for (const listener of listeners) listener();
  }

  function finish(outcome) {
    if (!engine || run.saved) return;
    run.saved = true;
    if (outcome === 'exit' && run.seconds < 1 && engine.state.score === 0) return;
    const { game, difficulty, id, seconds } = run;
    const { score, level, metrics } = engine.state;
    save({ game, difficulty, id, seconds, score, level, metrics: { ...metrics }, outcome,
      endedAt: Date.now(), challenge: Boolean(run.challenge && score >= games[game].target) });
    records = getRecords();
  }

  function resetInput() {
    for (const action of inputSources.values()) engine?.release?.(action);
    inputSources.clear();
    engine?.clearInput?.();
  }

  function lobby() {
    generation++;
    resetInput();
    finish('exit');
    engine = run = null;
    status = 'lobby';
    publish();
  }

  async function start(game, difficulty = 'medium', challenge = false) {
    lobby();
    const ticket = generation;
    const id = globalThis.crypto?.randomUUID?.() ?? Date.now() + '-' + Math.random();
    run = { id, game, difficulty, challenge, seconds: 0, saved: false };
    status = 'loading';
    publish();
    try {
      const module = await load(game);
      if (ticket !== generation || !isFull()) return false;
      engine = module.default(difficulties.indexOf(difficulty));
      status = typeof document !== 'undefined' && document.hidden ? 'paused' : 'running';
      publish();
      return true;
    } catch {
      if (ticket === generation && isFull()) {
        status = 'error';
        publish();
      }
      return false;
    }
  }

  function update(action) {
    const state = engine.state;
    const { score, lives } = state;
    const opponent = state.metrics.opponent;
    action();
    if (state.result) {
      status = 'ended';
      resetInput();
      finish(state.result);
      audio.play(state.result);
    } else if (state.lives < lives || state.metrics.opponent > opponent) audio.play('hit');
    else if (state.score > score) audio.play('score');
  }

  records = getRecords();
  publish();
  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    getSnapshot: () => snapshot,
    refreshRecords() { records = getRecords(); publish(); },
    async dispatch(action) {
      if (!isFull() || !validArcadeAction(action)) return false;
      const { type, game, difficulty, challenge } = action;
      if (type === 'game.getState') return snapshot;
      if (type === 'arcade.open' || type === 'game.exit') { lobby(); return true; }
      if (type === 'game.start') return start(game, difficulty, challenge);
      if (!run || (game && game !== run.game)) return false;
      if (type === 'game.pause' && status === 'running') {
        status = 'paused';
        resetInput();
      } else if (type === 'game.resume' && status === 'paused') status = 'running';
      else if (type === 'game.restart') return start(run.game, run.difficulty, run.challenge);
      else if (type === 'game.setDifficulty') {
        const index = difficulties.indexOf(run.difficulty);
        const next = difficulty === 'increase' ? difficulties[clamp(index + 1, 0, 2)]
          : difficulty === 'decrease' ? difficulties[clamp(index - 1, 0, 2)] : difficulty;
        if (next === run.difficulty) return false;
        return start(run.game, next, run.challenge);
      } else return false;
      publish();
      return true;
    },
    step(dt) {
      if (!isFull() || status !== 'running') return;
      run.seconds += dt;
      update(() => engine.step(dt));
    },
    publish,
    press(action, source = action) {
      if (!isFull() || status !== 'running' || !validInputs.has(action)) return;
      audio.unlock();
      inputSources.set(source, action);
      update(() => engine.press(action));
      publish();
    },
    release(source) {
      const action = inputSources.get(source);
      inputSources.delete(source);
      if (action && ![...inputSources.values()].includes(action)) engine?.release?.(action);
    },
    resetInput,
    point(x, y) { if (isFull() && status === 'running') engine.point?.(x, y); },
    render(ctx, en, palette) { if (isFull()) engine?.render(ctx, en, palette); },
    toggleSound() {
      if (!isFull()) return;
      audio.set(!audio.enabled);
      audio.unlock();
      audio.play('menu');
      publish();
    },
    unlockSound() { if (isFull()) audio.unlock(); },
    destroy() { lobby(); audio.close(); },
  };
}
