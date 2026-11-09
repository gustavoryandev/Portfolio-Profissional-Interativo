import { arcadeHref, difficultyName, gameIds, games, isGame } from './catalog.js';
import { formatTime, getRecords } from './records.js';

export async function answerArcade(intent, { en, compact, session, openArcade }) {
  const tr = (pt, english) => en ? english : pt;
  const lang = Number(en);
  const records = getRecords();
  const game = isGame(intent.game) ? games[intent.game] : null;
  const state = compact ? null : session?.getState();
  const link = (text, id, challenge) => ({ text, arcadeLink: arcadeHref(id, challenge) });
  const names = gameIds.map(id => games[id].name).join(', ');
  const personalBests = ids => ids.map(id => games[id].name + ' · ' + records.games[id].best).join('\n');

  if (intent.info === 'catalog') return link(tr('Jogos do Astra Arcade\n', 'Astra Arcade games\n') + names);
  if (intent.info === 'recommend') {
    const id = intent.game ?? records.favorite ?? 'snake';
    const suggested = games[id];
    return link(tr('Minha sugestão é ', 'I recommend ') + suggested.name + '. ' + suggested.description[lang], id);
  }
  if (intent.info === 'help') {
    if (!game) return link(tr('Escolha um jogo para ver os controles. Temos ', 'Choose a game to see its controls. We have ') + names);
    return link([game.description[lang], game.controls[lang], game.tip[lang]].join('\n\n'), intent.game);
  }
  if (intent.info === 'records') {
    return { text: tr('Recordes salvos neste navegador\n', 'Personal bests saved in this browser\n') + personalBests(game ? [intent.game] : gameIds) };
  }
  if (intent.info === 'stats') {
    const stats = game ? records.games[intent.game] : records.totals;
    const recent = records.recent.filter(run => !game || run.game === intent.game);
    const unlocked = records.achievements.filter(([, , count, target]) => count >= target).map(achievement => achievement[lang]);
    const summary = [
      tr('Partidas', 'Runs') + ' · ' + stats.played,
      tr('Vitórias', 'Wins') + ' · ' + stats.wins,
      tr('Derrotas', 'Losses') + ' · ' + stats.losses,
      tr('Tempo', 'Time') + ' · ' + formatTime(stats.seconds),
      records.favorite && !game && tr('Favorito', 'Favorite') + ' · ' + games[records.favorite].name,
      unlocked.length > 0 && tr('Conquistas', 'Achievements') + ' · ' + unlocked.join(', '),
      recent.length > 0 && tr('Últimas pontuações', 'Latest scores') + ' · ' + recent.slice(0, 3).map(run => games[run.game].name + ' ' + run.score).join(' / '),
      !stats.played && tr('Jogue uma partida para começar a acompanhar seu desempenho.', 'Play a game to start tracking your performance.'),
    ].filter(Boolean).join('\n');
    const suggested = intent.game ?? records.favorite ?? 'snake';
    const recommendation = suggested !== 'snake' || records.favorite
      ? tr('Experimente o desafio de ', 'Try the challenge for ') + games[suggested].name + '.'
      : tr('Snake é um bom começo. Tente coletar doze energias para o desafio da Astra.', 'Snake is a good starting point. Try collecting twelve pickups for Astra’s challenge.');
    return link(summary + '\n\n' + recommendation, suggested, true);
  }
  if (compact) {
    return link(
      game ? game.name + tr(' está disponível no Astra Arcade. Abra a Astra Completa para jogar.', ' is available in Astra Arcade. Open Full Astra to play.')
        : tr('O Astra Arcade fica na Astra Completa. Lá você pode escolher um jogo e usar os controles.', 'Astra Arcade is available in Full Astra, where you can choose a game and use its controls.'),
      intent.type === 'game.start' ? intent.game : undefined, intent.challenge,
    );
  }

  if (intent.type === 'arcade.open' || intent.type === 'game.start') {
    if (!session) {
      openArcade(intent.game, intent.challenge);
      return { text: game ? tr('Abrindo ', 'Opening ') + game.name + '…' : tr('Abrindo o Astra Arcade…', 'Opening Astra Arcade…') };
    }
  }
  if (intent.type === 'game.getState' && state?.game) {
    const current = games[state.game];
    const labels = {
      running: tr('Em jogo', 'Playing'), paused: tr('Pausado', 'Paused'), loading: tr('Carregando', 'Loading'),
      ended: state.result === 'win' ? tr('Vitória', 'Victory') : tr('Fim de jogo', 'Game over'), error: tr('Erro ao carregar', 'Loading failed'),
    };
    return { text: [
      current.name + ' · ' + labels[state.status],
      tr('Placar', 'Score') + ' · ' + state.score,
      tr('Nível', 'Level') + ' · ' + state.level,
      state.lives !== null && tr('Vidas', 'Lives') + ' · ' + state.lives,
      tr('Dificuldade', 'Difficulty') + ' · ' + difficultyName[state.difficulty][lang],
      tr('Recorde', 'Personal best') + ' · ' + state.best,
      ...Object.entries(state.metrics).map(([key, value]) => current.metrics[key][lang] + ' · ' + value),
    ].filter(Boolean).join('\n') };
  }

  const done = await session?.dispatch(intent);
  if (!done) {
    return { text: state?.game ? tr('Essa ação não está disponível no estado atual da partida.', 'That action is unavailable in the current game state.')
      : tr('Escolha um jogo no Astra Arcade para começar.', 'Choose a game in Astra Arcade to get started.') };
  }
  const replies = {
    'arcade.open': tr('Astra Arcade aberto.', 'Astra Arcade is open.'),
    'game.start': game && (intent.challenge
      ? tr('Desafio aberto. Sua meta em ', 'Challenge started. Your goal in ') + game.name + tr(' é ', ' is ') + game.target + tr(' pontos.', ' points.')
      : game.name + tr(' está pronto para jogar.', ' is ready to play.')),
    'game.pause': tr('Partida pausada.', 'Game paused.'),
    'game.resume': tr('Partida retomada.', 'Game resumed.'),
    'game.restart': tr('Partida reiniciada.', 'Game restarted.'),
    'game.exit': tr('De volta à seleção de jogos.', 'Back to game selection.'),
    'game.setDifficulty': tr('Nova partida em ', 'New run on ') + (session.getState().difficulty ? difficultyName[session.getState().difficulty][lang] : '') + '.',
  };
  return { text: replies[intent.type] };
}
