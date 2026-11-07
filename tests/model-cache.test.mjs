import test from 'node:test';
import assert from 'node:assert/strict';
import { createModelCache } from '../server/modelCache.js';

test('cold catalog discovery is shared and cached by credential', async () => {
  let calls = 0;
  let finish;
  const get = createModelCache({ fallback: ['fallback'], discover: () => { calls++; return new Promise(resolve => { finish = resolve; }); } });
  const first = get('key-a');
  const second = get('key-a');
  await Promise.resolve();
  assert.equal(calls, 1);
  finish(['available']);
  assert.deepEqual(await first, ['available', 'fallback']);
  assert.deepEqual(await second, await get('key-a'));
  assert.equal(calls, 1);
  const other = get('key-b');
  await Promise.resolve();
  assert.equal(calls, 2);
  finish(['other']);
  assert.deepEqual(await other, ['other', 'fallback']);
});

test('stale catalog returns immediately and survives failed discovery', async () => {
  let now = 0;
  let calls = 0;
  let finish;
  const get = createModelCache({ fallback: ['fallback'], now: () => now, ttl: 10, retryTtl: 5,
    discover: () => ++calls === 1 ? ['first'] : new Promise(resolve => { finish = resolve; }) });
  await get('key');
  now = 11;
  assert.deepEqual(await get('key'), ['first', 'fallback']);
  assert.deepEqual(await get('key'), ['first', 'fallback']);
  assert.equal(calls, 2);
  finish([]);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(await get('key'), ['first', 'fallback']);
  assert.equal(calls, 2);
});

test('cold discovery deadline uses fallback without duplicating slow discovery', async () => {
  let calls = 0;
  let finish;
  const get = createModelCache({ fallback: ['fallback'], wait: 2, discover: () => { calls++; return new Promise(resolve => { finish = resolve; }); } });
  assert.deepEqual(await get('key'), ['fallback']);
  assert.deepEqual(await get('key'), ['fallback']);
  assert.equal(calls, 1);
  finish(['discovered']);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(await get('key'), ['discovered', 'fallback']);
});
