import { useContext, useEffect, useRef, useState } from 'react';
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

export function GarageWorkbench() {
  const persona = useAssistantPersona();
  const { dimension, setEggMessage } = useContext(ThemeContext);
  const { openAstra } = useAstra();
  const { t } = useTranslation();
  const [meeseeks, setMeeseeks] = useState(false);
  return <div className="garage-workbench">
    <button type="button" className="workbench-monitor" onClick={openAstra} aria-haspopup="dialog">
      <span>{dimension === 'corrupted' ? t('rick.terminal') : t('rick.monitor', { name: persona?.name })}</span>
      <strong>{t('rick.openChat')}</strong>
    </button>
    <button type="button" className="meeseeks-box" aria-label={t('rick.box')} aria-pressed={meeseeks} onClick={() => {
      setMeeseeks(value => !value);
      setEggMessage(meeseeks ? '' : 'rick.hint');
    }}><img src="/rick-assets/meeseeks-box.png" alt="" draggable="false" /></button>
    {meeseeks && <div className="meeseeks-visitor"><CharacterArt who="meeseeks" /><p role="status">{t('rick.exit')}<small>{t('rick.upThere')}</small></p></div>}
    <span className="workbench-screw" aria-hidden="true">⚙</span>
  </div>;
}

export function LabPickle() {
  const { theme, dimension } = useContext(ThemeContext) ?? {};
  const { t } = useTranslation();
  const ref = useRef(null);
  const [spotted, setSpotted] = useState(false);
  const [otherSide, setOtherSide] = useState(false);
  const [found, setFound] = useState(false);
  const [escaping, setEscaping] = useState(false);
  useEffect(() => {
    if (dimension !== 'lab' && escaping) { setFound(true); setEscaping(false); }
  }, [dimension, escaping]);
  useEffect(() => {
    if (!ref.current) return;
    if (typeof IntersectionObserver === 'undefined') { setSpotted(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setSpotted(true); observer.disconnect(); }
    }, { threshold: .1 });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [theme]);
  if (theme !== 'rick-morty') return null;
  return <div ref={ref} className="lab-pickle-stage" data-spotted={spotted} data-found={found} data-escaping={escaping} data-side={otherSide ? 'right' : 'left'} hidden={dimension !== 'lab'}>
    <span className="lost-screw" aria-hidden="true">⚙</span>
    <button type="button" className="pickle-button" aria-disabled={escaping} aria-pressed={found} onClick={() => {
      if (escaping) return;
      setOtherSide(value => !value);
      if (!found) {
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setFound(true);
        else setEscaping(true);
      }
    }} onAnimationEnd={event => {
      if (event.animationName === 'pickle-escape') { setFound(true); setEscaping(false); }
    }} aria-label={t('rick.pickleRun')}>
      <CharacterArt who={found ? 'pickle-rat' : 'pickle'} />
    </button><span className="pickle-experiment" aria-hidden="true">{t(found ? 'rick.ratSuit' : 'rick.experiment')}</span>
    <span className="sr-only" role="status">{found ? (t('rick.pickleFound')) : ''}</span>
  </div>;
}

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
