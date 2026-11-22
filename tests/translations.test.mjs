import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

function entries(value, prefix = '') {
  if (value && typeof value === 'object') return Object.entries(value)
    .flatMap(([key, child]) => entries(child, prefix ? `${prefix}.${key}` : key));
  return [[prefix, value]];
}

test('Portuguese and English have complete keys and matching interpolation variables', async () => {
  const [pt, en] = await Promise.all(['pt', 'en'].map(async lang => new Map(entries(
    JSON.parse(await readFile(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8')),
  ))));
  assert.deepEqual([...pt.keys()].sort(), [...en.keys()].sort());
  for (const [key, text] of pt) {
    assert.equal(typeof text, 'string', key);
    assert.ok(text.trim() && en.get(key).trim(), key);
    assert.deepEqual([...text.matchAll(/{{(.*?)}}/g)].map(match => match[1]).sort(),
      [...en.get(key).matchAll(/{{(.*?)}}/g)].map(match => match[1]).sort(), key);
  }
});
