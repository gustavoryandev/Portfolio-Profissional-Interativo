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

export function beyondHintPersona(theme, dimension, surface, personaId) {
  if (theme !== 'rick-morty') return null;
  if (dimension === 'lab' && surface === 'full' && personaId === 'birdperson') return personaId;
  if ((dimension === 'lab' || dimension === 'corrupted') && surface === 'compact' && personaId === 'meeseeks') return personaId;
  return null;
}

export function isBeyondHintQuestion(text) {
  const words = text.normalize('NFD').toLowerCase().replace(/\p{M}/gu, '');
  if (/\b(?:projetos?|projects?|codigo|code|api|apis|github|seguranca|security|gustavo)\b/.test(words)) return false;
  const mystery = /\b(?:segredos?|misterios?|secrets?|myster(?:y|ies))\b/.test(words);
  const expression = /\b(?:frases?|express(?:ao|oes)|bord(?:ao|oes)|fala|diz|repete|phrases?|expressions?|catchphrases?|say|says|repeat|repeats)\b/.test(words);
  return mystery || (expression && /\brick\b/.test(words));
}
