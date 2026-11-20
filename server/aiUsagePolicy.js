// Explicit text models with a Free Tier in the published Gemini pricing table.
// This does NOT make a billed Google project free: billing must stay disabled.
// Reviewed 2026-11-18: https://ai.google.dev/gemini-api/docs/pricing
export const FREE_TIER_MODELS = Object.freeze([
  'gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite',
]);
export const MAX_MODEL_ATTEMPTS = 3;
export const isApprovedModel = name => FREE_TIER_MODELS.includes(name);

export function isQuotaOrBillingError(error) {
  const status = error?.status ?? error?.response?.status;
  return [402, 429].includes(Number(status))
    || /quota|resource_exhausted|billing|payment.required|insufficient.credit/i.test(
      `${error?.message ?? ''} ${error?.cause?.message ?? ''}`,
    );
}
