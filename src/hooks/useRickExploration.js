import { useCallback, useEffect, useState } from 'react';

const storageKey = 'rick-morty-exploration';
export const discoveries = ['citadel', 'meeseeks', 'pickle', 'reception'];
const empty = { enabled: false, found: [] };

function restore() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey));
    if (typeof saved?.enabled === 'boolean' && Array.isArray(saved.found)) {
      return { enabled: saved.enabled, found: discoveries.filter(id => saved.found.includes(id)) };
    }
  } catch { /* The journal also works without storage. */ }
  return empty;
}

export default function useRickExploration() {
  const [progress, setProgress] = useState(restore);
  useEffect(() => {
    if (progress === empty) return;
    try { window.localStorage.setItem(storageKey, JSON.stringify(progress)); } catch {}
  }, [progress]);
  const enable = useCallback(enabled => setProgress(previous => ({ ...previous, enabled })), []);
  const reset = useCallback(() => setProgress(previous => ({ ...previous, found: [] })), []);
  const recordDiscovery = useCallback(id => {
    if (!discoveries.includes(id)) return;
    setProgress(previous => previous.enabled && !previous.found.includes(id)
      ? { ...previous, found: [...previous.found, id] } : previous);
  }, []);
  return { progress, enable, reset, recordDiscovery };
}
