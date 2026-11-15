import test from 'node:test';
import assert from 'node:assert/strict';
import { createWakaTime } from '../server/wakatime.js';

const ok = data => ({ status: 200, data: { data } });
const item = (name, total_seconds) => ({ name, total_seconds });

test('public stats hydrate the requested range and publish only selected ranking entries', async () => {
  let calls = 0;
  const client = { get: async (url, options) => {
    calls++;
    assert.ok(url.endsWith('/users/example/stats/last_6_months'));
    assert.deepEqual(options, {});
    return ok({ total_seconds: 2400, best_day: { date: '2026-11-13', total_seconds: 1200 },
      categories: [item('Coding', 2400)], projects: [item('Private', 2000), item('Portfolio', 400)],
      dependencies: [item('React', 600), item('Other', 200), item('@Internal/lib', 500)],
    });
  } };
  const waka = createWakaTime(client, { WAKATIME_USERNAME: 'example', WAKATIME_PUBLIC_PROJECTS: 'portfolio', WAKATIME_HIDDEN_DEPENDENCIES: '@internal/*' });
  const [stats] = await Promise.all([waka.stats('last_6_months'), waka.stats('last_6_months')]);
  assert.equal(calls, 1);
  assert.equal(stats.summary.totalFormatted, '0h 40m');
  assert.equal(stats.summary.bestDay.formatted, '0h 20m');
  assert.deepEqual(stats.projects.map(entry => entry.name), ['Portfolio']);
  assert.equal(stats.categories[0].name, 'Coding');
  assert.deepEqual(stats.libraries.map(entry => [entry.name, entry.percent]), [['React', '75.0'], ['Other', '25.0']]);
  assert.deepEqual(await waka.activity(), {});
});

test('activity joins sessions across midnight and hides private branches and raw entity paths', async () => {
  const now = Date.parse('2026-11-16T03:05:00Z');
  const signal = (minutes, type = 'file') => ({ time: now / 1000 - minutes * 60, type, project: 'Private',
    branch: 'private-branch', entity: 'private-path', language: 'JavaScript', user_agent_id: 'editor-1' });
  const client = { get: async url => {
    if (url.endsWith('status_bar/today')) return ok({ grand_total: { total_seconds: 240 } });
    if (url.endsWith('user_agents')) return ok([{ id: 'editor-1', editor: 'VS Code' }]);
    if (url.endsWith('date=2026-11-15')) return ok([signal(8)]);
    assert.ok(url.endsWith('date=2026-11-16'));
    return ok([signal(1), signal(0, 'domain'), signal(4)]);
  } };
  const waka = createWakaTime(client, { WAKATIME_ACCESS_TOKEN: 'token' }, () => now);
  const { today, codingNow } = await waka.activity();
  assert.equal(today.formatted, '0h 4m');
  assert.equal(codingNow.active, true);
  assert.equal(codingNow.last.sessionSeconds, 420);
  assert.equal(codingNow.last.projectTodaySeconds, 180);
  assert.equal(codingNow.last.editor, 'VS Code');
  assert.equal(codingNow.last.project, null);
  assert.equal(codingNow.last.branch, null);
  assert.equal(JSON.stringify(codingNow).includes('private-path'), false);
});

test('concurrent expired OAuth requests share a refresh and retry using the new token', async () => {
  let refreshes = 0;
  const client = {
    get: async (_url, { headers }) => {
      if (headers.Authorization === 'Bearer expired') throw { response: { status: 401 } };
      assert.equal(headers.Authorization, 'Bearer renewed');
      return ok({ total_seconds: 1200 });
    },
    post: async (_url, params) => {
      refreshes++;
      assert.equal(params.get('refresh_token'), 'refresh');
      assert.equal(params.get('redirect_uri'), 'http://localhost:8787/callback');
      return { data: { access_token: 'renewed' } };
    },
  };
  const waka = createWakaTime(client, { WAKATIME_ACCESS_TOKEN: 'expired', WAKATIME_REFRESH_TOKEN: 'refresh',
    WAKATIME_APP_ID: 'app', WAKATIME_APP_SECRET: 'secret' });
  const stats = await Promise.all([waka.stats('all_time'), waka.stats('last_year')]);
  assert.ok(stats.every(result => result.status === 'ok'));
  assert.equal(refreshes, 1);
});
