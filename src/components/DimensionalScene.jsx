import { useEffect, useRef, useState } from 'react';
import { CitadelWindows } from './RickDimensionExperience';
import SceneBackdrop from './rick/SceneBackdrop';
import { preloadScene } from './rick/sceneAssets';
import useCharacterActivity from './rick/useCharacterActivity';

export function MansionBackdrop() {
  return <div className="dimensional-scene mansion-scene" aria-hidden="true">
    <SceneBackdrop scene="mansion" className="mansion-art" />
  </div>;
}

export default function DimensionalScene({ secret = false }) {
  const scene = secret ? 'plaza' : 'garage';
  const ref = useRef(null);
  const active = useCharacterActivity(ref);
  const [loaded, setLoaded] = useState(null);
  useEffect(() => {
    if (!active || loaded !== scene) return;
    const warm = () => {
      if (document.hidden) return;
      void preloadScene(secret ? 'labExterior' : 'citadelExterior', 'low');
      if (!secret) void preloadScene('citadel', 'low');
    };
    if (window.requestIdleCallback) {
      const job = window.requestIdleCallback(warm, { timeout: 950 });
      return () => window.cancelIdleCallback(job);
    }
    const job = window.setTimeout(warm, 350);
    return () => window.clearTimeout(job);
  }, [active, loaded, scene, secret]);
  return <div ref={ref} className="dimensional-scene" aria-hidden="true">
    {secret && <div className="dimension-starfield" />}
    <SceneBackdrop key={scene} scene={scene} className={secret ? 'citadel-city-art' : 'garage-wall-art'} onReady={() => setLoaded(scene)} />
    {secret && <><div className="citadel-city-shade" /><CitadelWindows /></>}
  </div>;
}
