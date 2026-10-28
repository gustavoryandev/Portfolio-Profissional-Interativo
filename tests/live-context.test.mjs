import test from 'node:test';
import assert from 'node:assert/strict';
import { createLiveCache, sourceFailure } from '../server/liveCache.js';
import { mergeLiveContext, needsRefresh, sourcesForText } from '../src/services/liveContext.js';
import { getLanguageIcon } from '../src/data/languageIcons.js';
import { existsSync } from 'node:fs';

test('concurrent requests share the same integration fetch', async () => {
  const cache = createLiveCache({ github: 100 });
  let calls = 0;
  const fetcher = async () => { calls++; return { status: 'ok', languages: { items: [] } }; };
  const [a, b] = await Promise.all([cache.get('github', fetcher), cache.get('github', fetcher)]);
  assert.equal(calls, 1);
  assert.deepEqual(a, b);
});

test('temporary failure preserves data, marks it stale and can recover', async () => {
  let time = 0;
  const cache = createLiveCache({ wakatime: 10 }, () => time);
  await cache.get('wakatime', async () => ({ status: 'ok', summary: { total: 42 } }));
  time = 20;
  const stale = await cache.get('wakatime', async () => { throw { code: 'ECONNABORTED' }; });
  assert.equal(stale.summary.total, 42);
  assert.equal(stale.stale, true);
  assert.equal(stale.reason, 'timeout');
  const fresh = await cache.get('wakatime', async () => ({ status: 'ok', summary: { total: 43 } }), { retryFailed: true });
  assert.equal(fresh.summary.total, 43);
  assert.equal(fresh.stale, false);
});

test('partial GitHub data cannot erase valid language and activity results', async () => {
  let time = 0;
  const cache = createLiveCache({ github: 10 }, () => time);
  await cache.get('github', async () => ({ status: 'ok', languages: { items: [{ name: 'Java' }] }, activity: { commitsPerHour: [3], totalSampleCommits: 3 } }));
  time = 20;
  const partial = await cache.get('github', async () => ({ status: 'ok', languages: null, activity: { weeks: [], commitsPerHour: [0] }, coverage: { events: 'unavailable' } }));
  assert.equal(partial.languages.items[0].name, 'Java');
  assert.deepEqual(partial.activity.commitsPerHour, [3]);
  assert.equal(partial.stale, true);
  assert.equal(partial.reason, 'partial');
});

test('rate limits are classified and respected even during forced retries', async () => {
  assert.equal(sourceFailure({ response: { status: 403, headers: { 'x-ratelimit-remaining': '0' } } }).reason, 'rate_limited');
  const cache = createLiveCache({ github: 10 });
  let calls = 0;
  const fetcher = async () => { calls++; return { status: 'error', reason: 'rate_limited' }; };
  await cache.get('github', fetcher);
  await cache.get('github', fetcher, { retryFailed: true });
  assert.equal(calls, 1);
});

test('card updates retain good snapshots and request only named integrations', () => {
  assert.deepEqual(sourcesForText('[GITHUB_CARD] [REPOSITORIES_CARD] [GALO_CARD:ALL] [STATS_CARD]'), ['github', 'galo', 'wakatime']);
  const old = { github: { status: 'ok', languages: { items: [{ name: 'Java' }] } } };
  const failed = mergeLiveContext(old, { github: { status: 'error' } });
  assert.equal(failed.github.languages.items[0].name, 'Java');
  assert.equal(failed.github.stale, true);
  assert.equal(old.github.stale, undefined);
  assert.equal(mergeLiveContext(old, { github: { status: 'unknown' } }).github, old.github);
  assert.equal(needsRefresh('github', { status: 'ok', languages: null }), true);
  assert.equal(needsRefresh('wakatime', { status: 'not_configured' }), false);
  assert.equal(needsRefresh('github', { status: 'error', reason: 'rate_limited' }), false);
});

test('all mapped icons are local and unknown names never become URLs', () => {
  for (const name of ['Java', 'Spring Boot', 'React', 'Python', 'Tailwind CSS', 'Git', 'Dockerfile', 'C++', 'C#', 'Shell']) {
    const icon = getLanguageIcon(name);
    assert.ok(icon?.startsWith('/icons/'));
    assert.ok(existsSync(new URL('../public' + icon, import.meta.url)));
  }
  assert.equal(getLanguageIcon('  JAVA  '), getLanguageIcon('Java'));
  for (const name of [null, {}, '__proto__', 'https://invalid/icon.svg']) assert.equal(getLanguageIcon(name), null);
});
