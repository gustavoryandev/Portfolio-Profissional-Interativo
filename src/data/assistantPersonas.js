import { BEYOND_CURVE } from './rickDimensions.js';

export const ASTRA_PERSONA_ID = 'astra';

const rickPresentations = new Map([
  ['lab', { compact: 'meeseeks', full: 'birdperson' }],
  ['corrupted', { compact: 'meeseeks', full: 'poopybutthole' }],
  [BEYOND_CURVE, { compact: 'evil-rick', full: 'evil-morty' }],
]);
const knownPersonaIds = new Set(['squanchy', ...[...rickPresentations.values()].flatMap(Object.values)]);
export const isRickPersonaId = id => knownPersonaIds.has(id);

// Share the presentation mapping; callers never supply character names or prompts.
export function assistantPersonaId({ theme, dimension, surface } = {}) {
  if (theme !== 'rick-morty' || !['compact', 'full'].includes(surface)) return null;
  return rickPresentations.get(dimension)?.[surface] ?? null;
}
