export const ASTRA_PERSONA_ID = 'astra';

// Share the presentation mapping; callers never supply character names or prompts.
export function assistantPersonaId({ theme, dimension, surface } = {}) {
  if (theme !== 'rick-morty' || !['lab', 'corrupted'].includes(dimension) || !['compact', 'full'].includes(surface)) return null;
  return surface === 'compact' ? 'meeseeks' : dimension === 'corrupted' ? 'poopybutthole' : 'squanchy';
}
