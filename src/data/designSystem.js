export const DESIGN_SYSTEM_CARD = '[DESIGN_SYSTEM_CARD]';
export const DESIGN_SYSTEM_ACTION = { type: 'designSystem.open' };

export function isDesignSystemRequest(query) {
  const command = query.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[.!?]+$/, '').trim();
  return /^(?:\/?(?:design|ds|designsystem)|(?:mostre (?:me )?o |abra o |quero ver o |show(?: me)? the |open the )?(?:design system|sistema de design)(?: do portfolio| of the portfolio)?|(?:show(?: me)? the |open the )?portfolio design system)$/.test(command);
}
