import { useEffect, useState, useSyncExternalStore } from 'react';
import { REDUCED_MOTION_QUERY } from '../../motionPreferences';

export const pickleBody = '/rick-assets/pickle.webp';
export const meeseeksBox = '/rick-assets/meeseeks-box.webp';
export const shipArt = '/rick-assets/spaceship.webp';
export const compactBackdropQuery = '(max-width: 900px) and (orientation: portrait)';
export const backdropAssets = {
  garage: { src: '/rick-assets/garage.webp', compact: '/rick-assets/garage-mobile.webp' },
  plaza: { src: '/rick-assets/citadel-plaza.webp', compact: '/rick-assets/citadel-plaza-mobile.webp' },
  dock: { src: '/rick-assets/citadel.webp' },
};
const sceneAssets = {
  workbench: [meeseeksBox],
  experiment: [pickleBody],
  ship: [shipArt],
  garage: [backdropAssets.garage, shipArt, pickleBody],
  citadel: [backdropAssets.dock, shipArt, '/rick-assets/morty.webp'],
  labExterior: [backdropAssets.garage],
  citadelExterior: [backdropAssets.plaza],
};

const images = new Map();
function preload(src, priority) {
  const existing = images.get(src);
  if (existing) {
    if (existing.image && priority !== 'low') existing.image.fetchPriority = priority;
    return existing.pending;
  }
  const entry = { image: new Image() };
  const image = entry.image;
  entry.pending = new Promise(resolve => {
    const finish = ok => {
      clearTimeout(deadline);
      image.onload = image.onerror = null;
      resolve(ok);
    };
    const deadline = setTimeout(() => finish(false), 2500);
    image.onload = () => {
      if (image.decode) image.decode().then(() => finish(true), () => finish(false));
      else finish(true);
    };
    image.onerror = () => finish(false);
    image.fetchPriority = priority;
    image.src = src;
  }).then(ok => {
    entry.image = null;
    if (!ok) images.delete(src);
    return ok;
  });
  images.set(src, entry);
  return entry.pending;
}

export function preloadScene(scene, priority = 'auto') {
  const compact = window.matchMedia?.(compactBackdropQuery).matches;
  return Promise.all(sceneAssets[scene].map(asset => preload(
    typeof asset === 'string' ? asset : (compact && asset.compact) || asset.src, priority,
  ))).then(loaded => loaded.every(Boolean));
}

export function useSceneAssets(scene, enabled = true) {
  const [result, setResult] = useState(null);
  useEffect(() => {
    let current = true;
    if (scene && enabled) preloadScene(scene).then(ready => {
      if (current) setResult({ scene, status: ready ? 'ready' : 'fallback' });
    });
    return () => { current = false; };
  }, [scene, enabled]);
  return scene && result?.scene === scene ? result.status : 'loading';
}

function watchMotion(notify) {
  const query = window.matchMedia?.(REDUCED_MOTION_QUERY);
  query?.addEventListener('change', notify);
  return () => query?.removeEventListener('change', notify);
}
export function useReducedSceneMotion() {
  return useSyncExternalStore(watchMotion, () => Boolean(window.matchMedia?.(REDUCED_MOTION_QUERY).matches), () => true);
}
