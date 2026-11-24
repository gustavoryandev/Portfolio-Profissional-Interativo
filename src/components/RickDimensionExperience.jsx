import { projectContent } from '../data/projectContent';
import perfil from '../data/perfil.json';
import { resumeUrl } from '../data/resume';
import useCharacterActivity from './rick/useCharacterActivity';
import { meeseeksBox, shipArt, useSceneAssets } from './rick/sceneAssets';
import MeeseeksRig from './rick/MeeseeksRig';
import CharacterPerformance from './rick/CharacterPerformance';
import { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeState';
import { useAstra } from '../context/AstraContext';
import { useAssistantPersona } from '../context/AssistantAppearanceContext';

export function CharacterArt({ who = 'morty', badge = false }) {
  const { t } = useTranslation();
  return <span className="series-character" data-who={who} aria-hidden="true">
    <img src={`/rick-assets/${who}.png`} alt="" draggable="false" decoding="async" />
    {badge && <span className="series-character-badge">MORTY<br />{t('rick.intern')}</span>}
  </span>;
}

const rota = perfil.projetos.find(project => project.id === 'car-rental');
export function GarageWorkbench({ onSectionLink }) {
  const persona = useAssistantPersona();
  const { dimension, setEggMessage, recordDiscovery } = useContext(ThemeContext);
  const { openAstra } = useAstra();
  const { t, i18n } = useTranslation();
  const [meeseeks, setMeeseeks] = useState(false);
  const bench = useRef(null);
  const active = useCharacterActivity(bench, dimension === 'lab');
  const assets = useSceneAssets(dimension === 'lab' ? 'workbench' : null, active || meeseeks);
  return <div ref={bench} className="garage-workbench" data-rick-motion data-active={active}>
    <button type="button" className="workbench-monitor" onClick={openAstra} aria-haspopup="dialog">
      <span>{dimension === 'corrupted' ? t('rick.terminal') : t('rick.monitor', { name: persona?.name })}</span>
      <strong>{t('rick.openChat')}</strong>
    </button>
    <button type="button" className="meeseeks-box" aria-label={t('rick.box')} aria-pressed={meeseeks} onClick={() => {
      setMeeseeks(value => !value);
      if (!meeseeks) recordDiscovery?.('meeseeks');
      setEggMessage(meeseeks ? '' : 'rick.hint');
    }}>{assets === 'ready' ? <><img src={meeseeksBox} alt="" draggable="false" />
      <svg viewBox="0 0 368 401" aria-hidden="true"><path fill="#406366" d="M114 56 Q184 18 256 58 V110 Q233 142 154 131 Q111 126 111 99Z" />
        <ellipse cx="184" cy="99" rx="67" ry="29" fill="#24383b" />
        <g className="box-plunger"><path fill="#51a5c3" d="M125 71 Q181 43 242 71 V94 C241 131 128 132 125 95Z" />
          <ellipse cx="183" cy="72" rx="58" ry="25" fill="#69caf0" stroke="#a9e1ed" strokeWidth="3" /></g>
      </svg></> : <span className="meeseeks-box-glyph" aria-hidden="true">◆</span>}</button>
    {dimension === 'lab' && <CharacterPerformance active={active} visible={meeseeks && assets !== 'loading'}>
      {(pose, reduced) => <div className="meeseeks-visitor" data-rick-motion data-pose={pose}>
        {pose === 'entrance' && !reduced && <span className="summon-ring" aria-hidden="true" />}
        <MeeseeksRig key={reduced ? 'still' : 'playing'} state={pose} reduced={reduced} />
        <div className="meeseeks-presentation" data-presented={meeseeks && (pose === 'reaction' || pose === 'idle')}>
          <p>{t('rick.exit')}<small>{t('rick.upThere')}</small></p>
          <div className="meeseeks-actions">
            <a href="/?tech=Java#projetos" onClick={onSectionLink}>{t('rick.javaProjects')}</a>
            <a href={resumeUrl(i18n.language)} target="_blank" rel="noopener noreferrer">{t('rick.openResume')}</a>
            <button type="button" aria-haspopup="dialog" onClick={event => openAstra(event, t('projetos.astraPrompt', { title: projectContent(rota, 'titulo', i18n.language, t) }))}>{t('rick.explainRota')}</button>
          </div>
        </div>
      </div>}
    </CharacterPerformance>}
    <span className="workbench-screw" aria-hidden="true">⚙</span>
  </div>;
}

export { default as LabPickle } from './rick/LabPickle';

export function ProjectMorty({ expanded }) {
  return <div className="project-morty" data-expanded={expanded} aria-hidden="true"><CharacterArt /><i /><b /></div>;
}

export function CitadelReception() {
  const persona = useAssistantPersona();
  const { theme, dimension, setEggMessage } = useContext(ThemeContext) ?? {};
  const { t } = useTranslation();
  const [flipped, setFlipped] = useState(false);
  if (theme !== 'rick-morty' || dimension !== 'corrupted') return null;
  return <aside className="citadel-reception" aria-label={t('rick.reception')}>
    <button type="button" aria-pressed={flipped} className="reception-morty" aria-label={t('rick.turnSign')} onClick={() => {
      setFlipped(value => !value);
      setEggMessage('rick.application');
    }}><CharacterArt badge /><span className="paper-stack" aria-hidden="true">▱▱▱</span><span className="reception-sign">{flipped ? (t('rick.direct')) : (t('rick.receptionSign'))}</span></button>
    <span className="morty-badge">{t('rick.mortyIntern')}</span>
    {flipped && <p role="status"><strong>{persona?.name}:</strong> {t('rick.application')}</p>}
  </aside>;
}

export function CitadelWindows() {
  return <div className="citadel-windows" aria-hidden="true">
    <div className="citadel-window-scene scene-cargo"><CharacterArt badge /><span className="cargo-box">▰</span></div>
    <div className="citadel-window-scene scene-debate"><CharacterArt who="rick" /><CharacterArt who="rick" /></div>
    <div className="citadel-window-scene scene-dock"><CharacterArt who="rick" /><img src="/rick-assets/spaceship.png" alt="" /></div>
  </div>;
}

export function DimensionalIntro({ scene, onDismiss }) {
  const persona = useAssistantPersona('full');
  const { t } = useTranslation();
  const skip = useRef(null);
  useEffect(() => {
    if (!scene) return;
    const onKey = event => { if (event.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scene, onDismiss]);
  if (!scene) return null;
  const dock = scene === 'citadel';
  return <section className={`dimension-intro ${dock ? 'intro-dock' : 'intro-garage'}`} aria-label={dock ? (t('rick.dockCamera')) : (t('rick.garageOpening'))}>
    <div className="intro-illustration" aria-hidden="true">
      <div className="intro-garage-door" />
      <img className="intro-spaceship" src="/rick-assets/spaceship.png" alt="" />
      {dock ? <div className="intro-reception"><CharacterArt badge /><span>Morty — {t('rick.intern')}</span></div> : <div className="intro-pickle"><CharacterArt who="pickle" /><span>⚙</span></div>}
    </div>
    <div className="intro-caption"><small>{t(dock ? 'rick.dockCam' : 'rick.garageOnline')}</small><strong>{dock ? (t('rick.welcomeGustavo')) : 'Gustavo Ryan'}</strong><p>{dock ? (t('rick.destination')) : persona?.intro}</p></div>
    <button ref={skip} type="button" onClick={onDismiss}>{t('rick.skip')} <span aria-hidden="true">Esc</span></button>
  </section>;
}
