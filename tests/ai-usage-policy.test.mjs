import test from 'node:test';
import assert from 'node:assert/strict';
import { isApprovedModel, isQuotaOrBillingError, MAX_MODEL_ATTEMPTS } from '../server/aiUsagePolicy.js';
test('AI policy rejects unreviewed models and limits fallback attempts', () => {
  assert.equal(isApprovedModel('gemini-3.8-flash'), true);
  for (const name of ['gemini-4-carbon', 'gemini-3.1-pro-preview', 'gemini-3.8-flash-image', 'gemini-9-flash', 'gemini-flash-latest']) {
    assert.equal(isApprovedModel(name), false);
  }
  assert.equal(MAX_MODEL_ATTEMPTS, 2);
});
test('quota and payment failures cannot be retried through another model', () => {
  for (const error of [{status:429}, {status:402}, {response:{status:429}}, new Error('RESOURCE_EXHAUSTED'), new Error('quota exceeded'), new Error('billing not enabled')]) {
    assert.equal(isQuotaOrBillingError(error), true);
  }
  assert.equal(isQuotaOrBillingError({status:503, message:'high demand'}), false);
});
