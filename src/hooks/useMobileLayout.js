import { useSyncExternalStore } from 'react';
import { MOBILE_LAYOUT_QUERY } from '../motionPreferences';

function subscribe(onChange) {
  const media = window.matchMedia?.(MOBILE_LAYOUT_QUERY);
  media?.addEventListener('change', onChange);
  return () => media?.removeEventListener('change', onChange);
}

function matches() {
  return window.matchMedia?.(MOBILE_LAYOUT_QUERY).matches ?? false;
}

export default function useMobileLayout() {
  return useSyncExternalStore(subscribe, matches, () => false);
}
