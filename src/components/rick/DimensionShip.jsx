import { useLayoutEffect, useRef } from 'react';
import { shipArt, useSceneAssets } from './sceneAssets';

export function DimensionShip({ className, docked, shipRef }) {
  return <span ref={shipRef} className={`dimension-ship ${className}`} data-rick-motion data-docked={docked} aria-hidden="true">
    <span className="ship-hull">
      {!docked && <i className="ship-exhaust" />}
      <img src={shipArt} alt="" draggable="false" width="846" height="569" />
      {!docked && <i className="ship-headlight" />}
    </span>
    {!docked && <i className="ship-smoke" />}
  </span>;
}

export function PortfolioShip({ docked, onDepart, visible }) {
  const status = useSceneAssets('ship', visible);
  const ship = useRef(null);
  useLayoutEffect(() => {
    if (docked || status === 'loading') return;
    if (status === 'fallback' || !visible) { onDepart(); return; }
    let current = true;
    const flight = ship.current?.getAnimations?.().find(effect => effect.animationName === 'garage-flyby');
    const finish = () => { if (current) onDepart(); };
    if (flight) flight.finished.then(finish, finish);
    else finish();
    return () => { current = false; };
  }, [docked, onDepart, status, visible]);
  return status === 'ready' ? <DimensionShip className="rick-ship" docked={docked} shipRef={ship} /> : null;
}
