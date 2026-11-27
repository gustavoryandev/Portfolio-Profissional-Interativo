export type PortalVariant = 'garage' | 'citadel' | 'beyond-curve';
export type PortalQuality = 'auto' | 'low' | 'high';

interface PortalPalette {
  abyss: string;
  shadow: string;
  body: string;
  energy: string;
  current: string;
  accent: string;
  light: string;
}

interface PortalStyle {
  palette: PortalPalette;
  speed: number;
  displacement: number;
  spring: { stiffness: number; damping: number; mass: number };
}

export const portalVariants: Record<PortalVariant, PortalStyle> = {
  garage: {
    palette: { abyss: '#102f18', shadow: '#246421', body: '#58b52b', energy: '#39ff14', current: '#b1f73d', accent: '#ddff74', light: '#ffffce' },
    speed: 1, displacement: 4.6, spring: { stiffness: 178, damping: 19, mass: .82 },
  },
  citadel: {
    palette: { abyss: '#082e38', shadow: '#106172', body: '#1ba4aa', energy: '#45f6ed', current: '#79e9d6', accent: '#c4f785', light: '#ecffff' },
    speed: .71, displacement: 3.2, spring: { stiffness: 166, damping: 21, mass: .82 },
  },
  'beyond-curve': {
    palette: { abyss: '#211807', shadow: '#6e5116', body: '#b18016', energy: '#ffd84a', current: '#eab308', accent: '#e9c66a', light: '#fff4ba' },
    speed: .64, displacement: 2.8, spring: { stiffness: 166, damping: 24, mass: .82 },
  },
};

export const qualityLevels = {
  low: { particles: 4, octaves: 1, updatesPerSecond: 24, flecks: 20 },
  high: { particles: 8, octaves: 2, updatesPerSecond: 36, flecks: 34 },
} as const;

export function resolveQuality(quality: PortalQuality) {
  if (quality === 'high' || quality === 'low') return quality;
  if (typeof window === 'undefined') return 'low';
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return !device.connection?.saveData && (device.deviceMemory ?? 0) >= 8 &&
    device.hardwareConcurrency >= 8 && window.devicePixelRatio <= 2 &&
    window.matchMedia?.('(pointer: fine)').matches ? 'high' : 'low';
}

export function bounded(value: number | undefined, fallback: number, min: number, max: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export function portalWidth(size: number | string | undefined) {
  if (typeof size === 'string' && /^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|vw|vh|vmin|vmax|%)$/.test(size.trim())) return size.trim();
  return bounded(typeof size === 'number' ? size : undefined, 320, 48, 800) + 'px';
}
