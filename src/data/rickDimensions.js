export const BEYOND_CURVE = 'beyond-curve';
export const BEYOND_UNLOCK_KEY = 'rick-morty-beyond-unlocked';
export const RICK_DIMENSION_KEY = 'rick-morty-dimension';

export function readRickDimension(savedTheme, savedDimension, unlocked) {
  if (savedTheme === 'rick-morty-secret' || savedDimension === 'corrupted') return 'corrupted';
  return unlocked && savedDimension === BEYOND_CURVE ? BEYOND_CURVE : 'lab';
}

export function isBeyondCurveCommand(theme, text) {
  if (theme !== 'rick-morty' || typeof text !== 'string') return false;
  const command = text.normalize('NFD').toLowerCase().replace(/[\p{M}\p{P}\s]/gu, '');
  return command === 'wubbalubbadubdub' || command === 'wabalabadubdub';
}
