import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BarChart3, ChevronDown, ChevronLeft, Gamepad2, Pause, Play, RotateCcw, Sparkles, Trophy, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import OptionMenu from '../components/OptionMenu';
import { difficulties, difficultyName, gameIds, games, isGame } from './catalog.js';
import { useArcadeCanvas, useArcadeInput } from './gameInput.js';
import { formatTime, getRecords } from './records.js';
import { createArcadeSession, playableGames } from './session.js';
import './arcade.css';

const icons = { up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight };
const visualKey = 'astra-arcade-visual';
const visualModes = { classic: ['Clássico', 'Classic'], astra: ['Tema Astra', 'Astra Theme'] };
const controlLabels = {
  up: ['Cima', 'Up'], down: ['Baixo', 'Down'], left: ['Esquerda', 'Left'], right: ['Direita', 'Right'],
  drop: ['Soltar', 'Drop'], hold: ['Guardar', 'Hold'], reverse: ['Girar ↶', 'Rotate ↶'],
};

function DifficultyMenu({ value, onChange, en, lobby = false }) {
  const label = lobby ? (en ? 'Run difficulty' : 'Dificuldade da partida') : (en ? 'Difficulty' : 'Dificuldade');
  const lang = Number(en);
  const options = difficulties.map((id, index) => ({
    id,
    label: difficultyName[id][lang],
    preview: <span className="arcade-level-bars" data-level={index + 1} aria-hidden="true"><i /><i /><i /></span>,
  }));
  return <div className="arcade-difficulty">
    <span>{label}</span>
    <OptionMenu label={label} triggerLabel={label + ' · ' + difficultyName[value][lang]} width={200}
      triggerClassName="arcade-button arcade-difficulty-trigger" value={value} onChange={onChange}
      groups={[{ options }]} triggerContent={<><BarChart3 size={15} aria-hidden="true" /><b>{difficultyName[value][lang]}</b><ChevronDown size={15} aria-hidden="true" /></>} />
  </div>;
}

function Cover({ id }) {
  const artwork = {
    snake: <><path d="M35 81h28V42h50v21h27" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" fill="none" /><circle cx="160" cy="63" r="7" fill="#ffc082" /><circle cx="142" cy="60" r="1.8" fill="#121626" /></>,
    pong: <><path d="M100 17v75" stroke="#566883" strokeDasharray="5 6" /><path d="M35 47v28m130-45v28" stroke="currentColor" strokeWidth="7" strokeLinecap="round" /><path d="m70 65 48-24" stroke="#566883" strokeDasharray="4 5" /><circle cx="116" cy="42" r="5" fill="#edf8ff" /></>,
    frogger: <><path d="M25 77h150M25 36h150" stroke="#547887" strokeWidth="23" /><path d="M44 36h32m44 0h35" stroke="#f3a676" strokeWidth="10" strokeLinecap="round" /><path d="M50 77h15m67 0h20" stroke="#ff8a92" strokeWidth="11" strokeLinecap="round" /><circle cx="99" cy="57" r="9" fill="#a9f6a0" /><path d="m95 54 8 0" stroke="#253e36" strokeWidth="2" strokeDasharray="2 4" /></>,
    maze: <><path d="M40 28h37v54h34V48h46v33M40 82V52h20m33-24h64" stroke="#7485d2" strokeWidth="6" strokeLinejoin="round" fill="none" /><path d="m55 63 8-8 8 8-8 8Z" fill="currentColor" /><path d="M83 43h19" stroke="#f9c5ff" strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" /><circle cx="137" cy="69" r="6" fill="#ef82a5" /></>,
    blocks: <><path d="M57 24v64h86V24" stroke="#586485" strokeWidth="2" fill="none" /><path d="M80 48h15V33h15v30H80Z" fill="currentColor" /><path d="M70 84V69h30v15Z" fill="#76ddf2" /><path d="M105 84V69h15V54h15v30Z" fill="#83dfac" /></>,
  };
  return <svg className="arcade-cover" viewBox="0 0 200 110" aria-hidden="true">{artwork[id]}</svg>;
}

function Dashboard({ records, en }) {
  const tr = (pt, english) => en ? english : pt;
  const lang = Number(en);
  const { totals, favorite, recent, achievements } = records;
  const trends = gameIds.map(id => [id, recent.filter(run => run.game === id).slice(0, 6).reverse()]).filter(([, runs]) => runs.length);
  return <div className="arcade-dashboard">
    <div className="arcade-kpis">
      <div><span>{tr('Partidas', 'Runs')}</span><strong>{totals.played}</strong></div>
      <div><span>{tr('Vitórias / derrotas', 'Wins / losses')}</span><strong>{totals.wins} / {totals.losses}</strong></div>
      <div><span>{tr('Tempo em jogo', 'Playtime')}</span><strong>{formatTime(totals.seconds)}</strong></div>
      <div><span>{tr('Favorito', 'Favorite')}</span><strong>{favorite ? games[favorite].name : '—'}</strong></div>
    </div>
    <section className="arcade-stat-section">
      <h3>{tr('Recordes pessoais', 'Personal bests')}</h3>
      <div className="arcade-records">
        {gameIds.map(id => <div key={id}><span>{games[id].name}</span><strong>{records.games[id].best}</strong>
          <small>{tr('Nível', 'Level')} {records.games[id].level || '—'} · {records.games[id].played} {tr('partidas', 'runs')}</small></div>)}
      </div>
    </section>
    <section className="arcade-stat-section">
      <h3>{tr('Conquistas', 'Achievements')}</h3>
      <ul className="arcade-achievements">
        {achievements.map((achievement, index) => {
          const [, , count, goal] = achievement;
          const label = achievement[lang];
          return <li key={label}><Trophy size={18} aria-hidden="true" className={count >= goal ? 'arcade-unlocked' : undefined} />
            <div><label htmlFor={'arcade-achievement-' + index}>{label}</label><progress id={'arcade-achievement-' + index} value={Math.min(count, goal)} max={goal} /></div>
            <span>{Math.min(count, goal)} / {goal}</span></li>;
        })}
      </ul>
    </section>
    <section className="arcade-stat-section">
      <h3>{tr('Evolução da pontuação', 'Score trends')}</h3>
      {trends.length ? <div className="arcade-trends">{trends.map(([id, runs]) => {
        const max = Math.max(1, ...runs.map(run => run.score));
        return <div key={id} style={{ '--game-color': games[id].color }}><strong>{games[id].name}</strong>
          <ol>{runs.map(run => <li key={run.id} style={{ '--bar-height': Math.max(5, run.score / max * 100) + '%' }}><span>{run.score}</span></li>)}</ol></div>;
      })}</div> : <p>{tr('As primeiras partidas aparecerão aqui.', 'Your first runs will appear here.')}</p>}
    </section>
    <section className="arcade-stat-section">
      <h3>{tr('Sessões recentes', 'Recent runs')}</h3>
      <ul className="arcade-recent">{recent.slice(0, 10).map(run => <li key={run.id}>
        <strong>{games[run.game].name}</strong><span>{difficultyName[run.difficulty][lang]} · {formatTime(run.seconds)}</span>
        <span>{run.outcome === 'win' ? tr('Vitória', 'Win') : run.outcome === 'loss' ? tr('Derrota', 'Loss') : tr('Saída', 'Exit')}</span><b>{run.score}</b>
      </li>)}</ul>
    </section>
  </div>;
}

function Control({ action, en, session, disabled }) {
  const Icon = icons[action];
  const label = controlLabels[action][Number(en)];
  const source = 'pad-' + action;
  const hold = useRef(null);
  const stop = () => {
    clearInterval(hold.current);
    session.release(source);
  };
  useEffect(() => stop, [session, source]);
  useEffect(() => { if (disabled) stop(); }, [disabled]);
  return <button type="button" className={'arcade-control arcade-control-' + action} disabled={disabled} aria-label={label} title={label}
    onPointerDown={event => {
      if (!event.isPrimary || event.button !== 0) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      session.press(action, source);
      if (Icon && session.getSnapshot().game === 'blocks' && action !== 'up') hold.current = setInterval(() => session.press(action, source), 120);
    }}
    onLostPointerCapture={stop} onPointerUp={stop} onPointerCancel={stop} onClick={event => {
      if (event.detail !== 0) return;
      session.press(action, source);
      session.release(source);
    }}>{Icon ? <Icon size={20} aria-hidden="true" /> : label}</button>;
}

function GameView({ session, state, en, onLobby, visualMode }) {
  const game = games[state.game];
  const tr = (pt, english) => en ? english : pt;
  const lang = Number(en);
  const canvas = useArcadeCanvas(session, state.size, en, visualMode);
  const handlers = useArcadeInput(session, state.game, canvas);
  const [showHelp, setShowHelp] = useState(false);
  const [coach, setCoach] = useState(false);
  const play = async type => {
    setShowHelp(false);
    session.unlockSound();
    if (await session.dispatch({ type })) canvas.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (state.status !== 'running') return;
    setShowHelp(false);
    if (!window.matchMedia('(pointer: coarse)').matches
      && !document.activeElement?.closest('input, select, .arcade-view')) canvas.current?.focus({ preventScroll: true });
  }, [state.status, canvas]);

  return <div className="arcade-view" style={{ '--game-color': game.color }}>
    <header className="arcade-game-header">
      <button type="button" className="arcade-button" onClick={onLobby}><ChevronLeft size={17} aria-hidden="true" /> {tr('Jogos', 'Games')}</button>
      <h2>{game.name}</h2>
      <DifficultyMenu value={state.difficulty} en={en} onChange={difficulty => {
        session.unlockSound();
        void session.dispatch({ type: 'game.setDifficulty', difficulty });
      }} />
    </header>
    <div className="arcade-hud" aria-label={tr('Placar e estado', 'Score and state')}>
      <span>{tr('Placar', 'Score')} <b>{state.score}</b></span>
      <span>{tr('Recorde', 'Best')} <b>{state.best}</b></span>
      <span>{tr('Nível', 'Level')} <b>{state.level}</b></span>
      {state.lives !== null && <span>{tr('Vidas', 'Lives')} <b>{state.lives}</b></span>}
      {state.timeLeft !== null && <span>{tr('Tempo', 'Time')} <b>{state.timeLeft}s</b></span>}
      {state.game === 'pong' && <span>CPU <b>{state.metrics.opponent ?? 0}</b></span>}
      {state.game === 'blocks' && <span>{tr('Linhas', 'Lines')} <b>{state.metrics.lines ?? 0} / 40</b></span>}
      {state.challenge && <span><Trophy size={15} aria-hidden="true" /> {tr('Meta', 'Goal')} <b>{Math.min(state.score, state.challenge)} / {state.challenge}</b></span>}
    </div>
    {state.size && <div className="arcade-board" style={{ '--board-width': state.size[0], '--board-height': state.size[1] }}>
      <canvas ref={canvas} tabIndex={0} aria-label={game.name + ' · ' + game.controls[lang]} {...handlers} />
      {(showHelp || state.status !== 'running') && <div className="arcade-overlay">
        <div id={showHelp ? 'arcade-game-help' : undefined}>
          <strong role="status">{showHelp ? tr('Como jogar', 'How to play') : state.status === 'paused' ? tr('Pausado', 'Paused')
            : state.result === 'win' ? tr('Vitória!', 'Victory!') : tr('Fim de jogo', 'Game over')}</strong>
          {showHelp ? <>
            <p>{game.rules?.[lang] ?? game.description[lang]}</p>
            <p>{game.controls[lang]}</p>
            <button type="button" className="arcade-button" onClick={() => setShowHelp(false)}>{tr('Fechar instruções', 'Close instructions')}</button>
          </>
            : <>{state.status === 'ended' && <p>{tr('Pontuação final', 'Final score')} · {state.score}</p>}
          <button type="button" className="arcade-button arcade-primary" onClick={() => play(state.status === 'paused' ? 'game.resume' : 'game.restart')}>
            <Play size={16} aria-hidden="true" /> {state.status === 'paused' ? tr('Continuar', 'Resume') : tr('Jogar de novo', 'Play again')}
          </button></>}
        </div>
      </div>}
    </div>}
    {state.status === 'loading' && <p role="status">{tr('Carregando partida…', 'Loading game…')}</p>}
    {state.status === 'error' && <p role="alert">{tr('O jogo não carregou. Use Reiniciar para tentar novamente.', 'The game did not load. Use Restart to try again.')}</p>}
    {state.size && <div className={'arcade-pad arcade-pad-' + state.game} role="group" aria-label={tr('Controles do jogo', 'Game controls')}>
      {(state.game === 'pong' ? ['up', 'down'] : ['up', 'left', 'down', 'right']).map(action =>
        <Control key={action} action={action} en={en} session={session} disabled={state.status !== 'running'} />)}
      {state.game === 'blocks' && <div className="arcade-special">
        {['reverse', 'hold', 'drop'].map(action => <Control key={action} action={action} en={en} session={session} disabled={state.status !== 'running'} />)}
      </div>}
    </div>}
    <div className="arcade-game-actions">
      <button type="button" className="arcade-button" disabled={!['running', 'paused'].includes(state.status)}
        onClick={() => play(state.status === 'paused' ? 'game.resume' : 'game.pause')}>
        {state.status === 'paused' ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        {state.status === 'paused' ? tr('Continuar', 'Resume') : tr('Pausar', 'Pause')}
      </button>
      <button type="button" className="arcade-button" disabled={state.status === 'loading'} onClick={() => play('game.restart')}><RotateCcw size={16} aria-hidden="true" /> {tr('Reiniciar', 'Restart')}</button>
      <button type="button" className="arcade-button" disabled={!state.size} aria-expanded={showHelp}
        aria-controls={showHelp ? 'arcade-game-help' : undefined} onClick={() => {
        if (!showHelp) void session.dispatch({ type: 'game.pause' });
        setShowHelp(!showHelp);
      }}>{tr('Controles', 'Controls')}</button>
      <button type="button" className="arcade-button" aria-expanded={coach} onClick={() => setCoach(!coach)}><Sparkles size={16} aria-hidden="true" /> Astra Coach</button>
    </div>
    <p className="arcade-key-hint">{tr('Enter / Esc para pausar no tabuleiro.', 'Enter / Esc to pause on the board.')}</p>
    {coach && <aside className="arcade-note">
      <strong>Astra Coach</strong><p>{game.tip[lang]}</p>
      {state.game === 'snake' && state.metrics.food >= 5 && <p>{tr('A serpente já acelerou. Prepare a próxima curva cedo.', 'The snake has sped up. Queue your next turn early.')}</p>}
      {state.game === 'maze' && state.lives === 1 && <p>{tr('Resta uma vida. Priorize corredores com mais de uma saída.', 'One life left. Favor corridors with more than one exit.')}</p>}
      {state.game === 'pong' && state.metrics.opponent >= 5 && <p>{tr('A CPU está perto de vencer. Antecipe o rebote na parede.', 'The CPU is close to winning. Anticipate rebounds off the wall.')}</p>}
      {state.game === 'frogger' && state.level > 1 && <p>{tr('O trânsito acelerou nesta fase. Use a margem central para planejar o próximo salto.', 'Traffic sped up on this stage. Use the median to plan the next hop.')}</p>}
      {state.game === 'blocks' && state.level > 1 && <p>{tr('Os blocos estão caindo mais rápido. Use a próxima peça para planejar duas jogadas.', 'Blocks are falling faster. Use the preview to plan two moves ahead.')}</p>}
    </aside>}
  </div>;
}

export default function FullArcade({ ref, en, initialGame, challenge, onClose }) {
  const root = useRef(null);
  const active = useRef(false);
  const [session] = useState(() => createArcadeSession({ isFull: () => {
    const entry = new URLSearchParams(window.location.search).get('arcade');
    return active.current && root.current?.isConnected && root.current.closest('.astra-full')
      && /^\/chat\/*$/.test(window.location.pathname) && (entry === '1' || isGame(entry));
  } }));
  const state = useSyncExternalStore(session.subscribe, session.getSnapshot, session.getSnapshot);
  const [dashboard, setDashboard] = useState(false);
  const [difficulty, setDifficulty] = useState('medium');
  const [visualMode, setVisualMode] = useState(() => {
    try { if (localStorage.getItem(visualKey) === 'astra') return 'astra'; } catch {}
    return 'classic';
  });
  const tr = (pt, english) => en ? english : pt;
  const lang = Number(en);
  const records = state.status === 'lobby' || dashboard ? getRecords() : null;

  useLayoutEffect(() => {
    active.current = true;
    return () => { active.current = false; session.destroy(); };
  }, [session]);
  useImperativeHandle(ref, () => ({
    dispatch(action) { setDashboard(false); return session.dispatch(action); },
    getState: session.getSnapshot,
  }), [session]);
  useEffect(() => {
    if (initialGame) void session.dispatch({ type: 'game.start', game: initialGame, challenge });
  }, [session, initialGame, challenge]);
  useEffect(() => {
    const pause = () => { void session.dispatch({ type: 'game.pause' }); };
    const visibility = () => { if (document.hidden) pause(); };
    const pageHide = event => { if (event.persisted) pause(); else session.destroy(); };
    window.addEventListener('blur', pause);
    window.addEventListener('pagehide', pageHide);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', pause);
      window.removeEventListener('pagehide', pageHide);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [session]);

  const toLobby = () => { setDashboard(false); void session.dispatch({ type: 'game.exit' }); };
  return <section className="arcade" ref={root} aria-labelledby="arcade-title" data-visual={visualMode}>
    <header className="arcade-toolbar">
      <span><Gamepad2 size={21} aria-hidden="true" /> <b id="arcade-title">Astra Arcade</b></span>
      <div>
        <OptionMenu label={tr('Visual do jogo', 'Game appearance')} width={185} value={visualMode}
          triggerClassName="arcade-button" triggerContent={<>{visualModes[visualMode][lang]} <ChevronDown size={15} aria-hidden="true" /></>}
          groups={[{ options: Object.entries(visualModes).map(([id, labels]) => ({ id, label: labels[lang] })) }]}
          onChange={mode => {
            setVisualMode(mode);
            try { localStorage.setItem(visualKey, mode); } catch {}
          }} />
        <button className="arcade-button" type="button" aria-pressed={state.sound} aria-label={tr('Som do arcade', 'Arcade sound')} title={tr('Som do arcade', 'Arcade sound')}
          onClick={() => session.toggleSound()}>{state.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
        <button className="arcade-button" type="button" aria-pressed={dashboard} onClick={() => {
          if (!dashboard) { session.refreshRecords(); void session.dispatch({ type: 'game.pause' }); }
          setDashboard(!dashboard);
        }}><BarChart3 size={17} aria-hidden="true" /> {tr('Estatísticas', 'Stats')}</button>
        <button className="arcade-button" type="button" onClick={onClose}>{tr('Fechar arcade', 'Close arcade')}</button>
      </div>
    </header>
    {dashboard ? <Dashboard records={records} en={en} />
      : state.game ? <GameView key={state.game} session={session} state={state} en={en} onLobby={toLobby} visualMode={visualMode} />
        : <>
          <div className="arcade-hero">
            <div>
              <p>{tr('ESTAÇÃO DE JOGOS · ASTRA COMPLETA', 'GAME STATION · FULL ASTRA')}</p>
              <h2>{tr('Escolha sua próxima partida', 'Pick your next game')}</h2>
              <span>{tr('Cinco clássicos. Seus recordes e desafios em um só lugar.', 'Five classics. Your records and challenges in one place.')}</span>
            </div>
            <DifficultyMenu value={difficulty} onChange={setDifficulty} en={en} lobby />
          </div>
          <div className="arcade-cards">
            {playableGames.map((id, index) => {
              const game = games[id];
              const launch = challenge => {
                session.unlockSound();
                void session.dispatch({ type: 'game.start', game: id, difficulty, challenge });
              };
              return <article key={id} className="arcade-card" style={{ '--game-color': game.color }}>
                <div className="arcade-card-art"><Cover id={id} /><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></div>
                <div className="arcade-card-body">
                  <div className="arcade-card-tag"><span>{game.tag[lang]}</span><span>{difficultyName[game.difficulty][lang]}</span></div>
                  <h3>{game.name}</h3><p>{game.description[lang]}</p>
                  <div className="arcade-card-best">{tr('Recorde pessoal', 'Personal best')} <b>{records.games[id].best}</b></div>
                  <div className="arcade-card-actions">
                    <button className="arcade-button arcade-primary" type="button" aria-label={tr('Jogar ', 'Play ') + game.name} onClick={() => launch(false)}><Play size={15} aria-hidden="true" /> {tr('Jogar', 'Play')}</button>
                    <button className="arcade-button" type="button" aria-label={tr('Desafio de ', 'Challenge for ') + game.name} onClick={() => launch(true)}><Trophy size={15} aria-hidden="true" /> {tr('Desafio', 'Challenge')}</button>
                  </div>
                </div>
              </article>;
            })}
          </div>
        </>}
  </section>;
}
