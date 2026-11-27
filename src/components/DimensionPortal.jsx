import { useContext, useId, useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/ThemeState';
import { MOBILE_LAYOUT_QUERY, REDUCED_MOTION_QUERY } from '../motionPreferences';
import { preloadScene, yellowPortalIcon } from './rick/sceneAssets';
import { BEYOND_CURVE } from '../data/rickDimensions.js';

export function DimensionTransit({ trip, onArrive, onFinish }) {
  const veil = useRef(null);
  const glow = useId();

  useLayoutEffect(() => {
    const node = veil.current;
    const preference = window.matchMedia?.(REDUCED_MOTION_QUERY);
    const compact = window.matchMedia?.(MOBILE_LAYOUT_QUERY).matches;
    const radius = Math.ceil(Math.hypot(
      Math.max(trip.x, window.innerWidth - trip.x),
      Math.max(trip.y, window.innerHeight - trip.y),
    ));
    const iris = node.firstElementChild;
    // Every corner must lie inside the opaque part of the irregular outline.
    const irisSize = 384;
    const coverage = Math.ceil(radius * 2.8) / irisSize;
    iris.style.setProperty('--iris-size', `${irisSize}px`);
    let active = true;
    let arrived = false;
    let animation;
    function arrive(withDock = false) {
      if (!arrived) onArrive(trip.destination, withDock);
      arrived = true;
    }
    function interrupt() {
      if (!active) return;
      active = false;
      animation?.cancel();
      arrive();
      onFinish(true);
    }
    const onPreference = () => { if (preference?.matches) interrupt(); };
    const onKey = event => { if (event.key === 'Escape') interrupt(); };
    const onVisibility = () => { if (document.hidden) interrupt(); };
    function play(element, frames, duration, easing) {
      animation?.cancel();
      animation = element.animate?.(frames, { duration, easing, fill: 'forwards' });
      return animation?.finished.catch(() => {});
    }
    async function travel() {
      if (preference?.matches || document.hidden) { interrupt(); return; }
      const dock = trip.destination === 'corrupted';
      void preloadScene(dock ? 'citadelExterior' : 'labExterior');
      if (dock) void preloadScene('citadel', 'high');
      const seed = 34 / irisSize;
      const charged = `scale(${seed * .71}) rotate(-12deg)`;
      const opened = `scale(${coverage}) rotate(8deg)`;
      node.dataset.phase = 'charge';
      await play(iris, [{ transform: `scale(${seed})`, opacity: .6 }, { transform: charged, opacity: 1 }], 150, 'ease-out');
      if (!active) return;
      node.dataset.phase = 'open';
      await play(iris, [{ transform: charged }, { transform: opened }],
        compact ? 235 : 355, 'cubic-bezier(.50,.03,.76,.55)');
      if (!active) return;
      // Swap the enlarged SVG for a viewport-sized opaque veil before repainting the scene.
      node.dataset.phase = 'covered';
      flushSync(() => arrive(dock));
      await new Promise(requestAnimationFrame);
      if (!active) return;
      node.dataset.phase = 'reveal';
      await play(node, [{ opacity: 1 }, { opacity: 0 }], compact ? 145 : 210, 'ease-out');
      if (active) { active = false; onFinish(false); }
    }
    void travel();
    preference?.addEventListener('change', onPreference);
    window.addEventListener('resize', interrupt);
    window.addEventListener('keydown', onKey);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      active = false;
      preference?.removeEventListener('change', onPreference);
      window.removeEventListener('resize', interrupt);
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('visibilitychange', onVisibility);
      animation?.cancel();
    };
  }, [trip, onArrive, onFinish]);

  return <div ref={veil} className="dimension-transit" data-rick-motion data-destination={trip.destination} style={{ '--portal-x': `${trip.x}px`, '--portal-y': `${trip.y}px` }} aria-hidden="true">
    <svg viewBox="0 0 100 100" className="transit-iris">
      <defs>
        <radialGradient id={glow} cx="49%" cy="51%" r="54%">
          <stop offset="0" stopColor="var(--transit-depth)" />
          <stop offset=".51" stopColor="var(--transit-band)" />
          <stop offset=".72" stopColor="var(--transit-rim)" />
          <stop offset=".88" stopColor="var(--transit-band)" />
          <stop offset="1" stopColor="var(--transit-rim)" />
        </radialGradient>
      </defs>
      <path fill={`url(#${glow})`} stroke="var(--transit-rim)" strokeWidth="1.1"
        d="M50 3 C61 5 66 1 74 9 S94 18 93 32 S101 48 95 61 S92 80 78 86 S62 98 48 95 S31 99 20 87 S5 74 6 61 S0 45 6 32 S10 17 24 12 S36 2 50 3Z" />
      <g className="portal-current">
        <path fill="var(--transit-depth)" d="M88 45 C87 24 65 11 45 13 C60 14 67 20 70 27 C51 17 28 23 19 37 C9 53 21 76 36 83 C26 71 26 64 28 58 C35 79 57 87 74 77 C90 66 90 53 88 45Z" />
        <path fill="none" stroke="var(--transit-rim)" strokeLinecap="round" opacity=".76"
          d="M14 48 Q16 25 40 17 M76 81 Q87 74 90 60 M33 43 Q41 27 59 31" />
        <g className="portal-core">
          <path fill={`url(#${glow})`} d="M30 49 C34 33 59 27 72 44 C61 37 47 38 42 48 C35 61 54 72 64 60 C56 78 26 68 30 49Z" />
          <path fill="var(--transit-band)" d="M47 48 Q55 38 61 47 Q55 45 52 50 Q49 56 55 57 Q44 58 47 48Z" />
        </g>
      </g>
    </svg>
    <span className="transit-cover" />
  </div>;
}

export function PortalArt({ className = '' }) {
  return <span className={`portal-art ${className}`} aria-hidden="true"><img src="/rick-assets/portal.webp" alt="" draggable="false" decoding="async" /></span>;
}

function PortalButton({ gold, onClick, label, hint, crossing }) {
  return <button type="button" className={`dimension-portal${gold ? ' dimension-portal-gold' : ''}`} data-rick-motion onClick={onClick} aria-label={label}
      onPointerDown={event => {
        if (document.activeElement === event.currentTarget) event.currentTarget.setAttribute('data-quiet-focus', '');
      }}
      onBlur={event => event.currentTarget.removeAttribute('data-quiet-focus')}
      onKeyDown={event => event.currentTarget.removeAttribute('data-quiet-focus')}
      data-crossing={crossing} aria-busy={crossing} aria-disabled={crossing} title={label}>
      {gold
        ? <span className="portal-art" aria-hidden="true"><img src={yellowPortalIcon} alt="" decoding="async" draggable="false"
          onError={event => { event.currentTarget.hidden = true; }} /></span>
        : <PortalArt />}
      <span className="portal-hint">{hint}</span>
    </button>;
}

export default function DimensionPortal() {
  const { dimension, crossDimension, crossing, beyondUnlocked } = useContext(ThemeContext);
  const { t } = useTranslation();
  const citadel = dimension === 'corrupted';
  const beyond = dimension === BEYOND_CURVE;
  return <div className="dimension-portals">
    <PortalButton onClick={crossDimension} crossing={crossing}
      label={t(citadel || beyond ? 'rick.portal.return' : 'rick.portal.cross')}
      hint={t(citadel || beyond ? 'rick.portal.back' : 'rick.portal.enter')} />
    {beyondUnlocked && <PortalButton gold crossing={crossing}
      onClick={event => crossDimension(event, beyond ? 'corrupted' : BEYOND_CURVE)}
      label={t(beyond ? 'rick.beyond.citadel' : 'rick.beyond.enter')}
      hint={t(beyond ? 'rick.beyond.citadelShort' : 'rick.beyond.short')} />}
    <span className="sr-only" role="status">{t(beyond ? 'rick.beyond.name' : citadel ? 'rick.portal.secret' : 'rick.portal.original')}</span>
  </div>;
}
