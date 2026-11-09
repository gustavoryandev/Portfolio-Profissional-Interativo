import { difficulties, gameIds, games, isGame } from './catalog.js';

const prefix = 'astra-arcade-session-v1:';
const memory = new Map();
const blankGame = () => ({ played: 0, wins: 0, losses: 0, best: 0, level: 0, seconds: 0, challenges: 0 });

function validSession(value) {
  return value && typeof value.id === 'string' && value.id.length <= 100 && isGame(value.game) && difficulties.includes(value.difficulty)
    && ['win', 'loss', 'exit'].includes(value.outcome)
    && ['score', 'level', 'seconds', 'endedAt'].every(key => Number.isFinite(value[key]) && value[key] >= 0);
}

function readSessions() {
  const sessions = new Map(memory);
  try {
    const storage = globalThis.localStorage;
    for (let index = 0; index < storage.length; index++) {
      const key = storage.key(index);
      if (!key?.startsWith(prefix)) continue;
      try {
        const session = JSON.parse(storage.getItem(key));
        if (validSession(session) && key === prefix + session.id) sessions.set(session.id, session);
      } catch { /* Skip an unreadable entry. */ }
    }
  } catch { /* In-memory records remain available. */ }
  return [...sessions.values()];
}

export function getRecords() {
  const records = Object.fromEntries(gameIds.map(id => [id, blankGame()]));
  const sessions = readSessions();
  for (const session of sessions) {
    const record = records[session.game];
    record.played++;
    record.wins += Number(session.outcome === 'win');
    record.losses += Number(session.outcome === 'loss');
    record.challenges += Number(session.challenge === true);
    record.best = Math.max(record.best, session.score);
    record.level = Math.max(record.level, session.level);
    record.seconds += session.seconds;
  }
  const recent = sessions.sort((a, b) => b.endedAt - a.endedAt).slice(0, 30);
  const totals = Object.values(records).reduce((all, game) => ({
    played: all.played + game.played,
    wins: all.wins + game.wins,
    losses: all.losses + game.losses,
    seconds: all.seconds + game.seconds,
    challenges: all.challenges + game.challenges,
  }), blankGame());
  const favorite = gameIds.reduce((best, id) => records[id].played > (records[best]?.played ?? 0) ? id : best, null);
  const achievements = [
    ['Primeira partida', 'First Game', totals.played, 1],
    ['Primeira vitória', 'First Victory', totals.wins, 1],
    ['Mestre da serpente', 'Snake Master', records.snake.best, games.snake.target],
    ['Campeão de Pong', 'Pong Champion', records.pong.wins, 1],
    ['Explorador do pulso', 'Maze Explorer', records.maze.level, 3],
    ['Sobrevivente da travessia', 'Frogger Survivor', records.frogger.level, 3],
    ['Estrategista orbital', 'Block Strategist', records.blocks.best, games.blocks.target],
    ['Veterano do arcade', 'Arcade Veteran', totals.played, 25],
    ['Desafiante da Astra', 'Astra Challenger', totals.challenges, 1],
  ];
  return { games: records, recent, totals, favorite, achievements };
}

export function saveSession(session) {
  if (!validSession(session) || memory.has(session.id)) return;
  try {
    const storage = globalThis.localStorage;
    const key = prefix + session.id;
    if (storage.getItem(key) === null) storage.setItem(key, JSON.stringify(session));
  } catch {
    memory.set(session.id, session);
  }
}

export function formatTime(seconds) {
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  return [hours && hours + 'h', Math.floor(whole % 3600 / 60) + 'm', whole % 60 + 's'].filter(Boolean).join(' ');
}
