import { BEYOND_CURVE } from './rickDimensions.js';
import { heistMedia, isHeistTheme } from './heistThemes.js';
import { themes } from './themes.js';

export const ASTRA_PERSONA_ID = 'astra';

const rickPresentations = new Map([
  ['lab', { compact: 'meeseeks', full: 'birdperson' }],
  ['corrupted', { compact: 'meeseeks', full: 'poopybutthole' }],
  [BEYOND_CURVE, { compact: 'evil-rick', full: 'evil-morty' }],
]);
const rickPersonaIds = new Set(['squanchy', ...[...rickPresentations.values()].flatMap(Object.values)]);
const heistPresentations = { compact: 'berlin', full: 'professor' };
export const isRickPersonaId = id => rickPersonaIds.has(id);

export function assistantPersonaPresentation(id) {
  if (isRickPersonaId(id)) return { catalog: 'rick', image: `/rick-assets/avatar-${id}.webp` };
  if (Object.hasOwn(heistMedia.avatars, id)) return { catalog: 'heistPersonas', image: heistMedia.avatars[id] };
  return null;
}

// The dimension belongs to Rick and Morty. Both Heist variants use the same IDs.
export function assistantAppearance(theme, dimension) {
  return isHeistTheme(theme) ? { theme } : { theme, dimension };
}

// Share the presentation mapping; callers never supply character names or prompts.
export function assistantPersonaId({ theme, dimension, surface } = {}) {
  if (surface !== 'compact' && surface !== 'full') return null;
  if (theme === 'rick-morty') return rickPresentations.get(dimension)?.[surface] ?? null;
  if (isHeistTheme(theme) && dimension == null && themes.some(option => option.id === theme)) return heistPresentations[surface];
  return null;
}
