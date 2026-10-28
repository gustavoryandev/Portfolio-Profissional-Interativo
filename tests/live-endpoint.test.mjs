import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';

// No credentials or external requests are used in this handler test.
process.env.GEMINI_API_KEY = '';
process.env.WAKATIME_API_KEY = 'test-only';
process.env.DOTENV_CONFIG_QUIET = 'true';
let mockAdapter;
const originalAdapter = axios.defaults.adapter;
axios.defaults.adapter = config => {
  if (!mockAdapter) throw new Error('Unexpected integration request');
  return mockAdapter(config);
};
const { default: handler } = await import('../api/chat.js');
axios.defaults.adapter = originalAdapter;

function response() {
  return { code: 200, headers: {}, status(code) { this.code = code; return this; },
    setHeader(name, value) { this.headers[name] = value; }, json(body) { this.body = body; return this; } };
}

test('refreshContext validates its allowlist before any integration call', async () => {
  for (const sources of [[], ['__proto__'], ['https://invalid'], ['github', 'invalid']]) {
    const res = response();
    await handler({ method: 'POST', body: { action: 'refreshContext', sources } }, res);
    assert.equal(res.code, 400);
  }
});

test('integration refresh completes without a Gemini key or model request', async () => {
  let calls = 0;
  mockAdapter = async config => {
    calls++;
    assert.match(config.url, /^https:\/\/wakatime\.com\//);
    return { status: 200, statusText: 'OK', headers: {}, config,
      data: { data: [{ grand_total: { total_seconds: 3600 }, languages: [{ name: 'Java', total_seconds: 3600 }], editors: [] }] } };
  };
  try {
    const res = response();
    await handler({ method: 'POST', body: { action: 'refreshContext', sources: ['wakatime', 'wakatime'] } }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.liveContext.wakatime.status, 'ok');
    assert.equal(res.body.liveContext.wakatime.languages[0].name, 'Java');
    assert.equal(calls, 1);
    assert.equal(JSON.stringify(res.body).includes('test-only'), false);
    assert.equal(res.body.model, undefined);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  } finally { mockAdapter = undefined; }
});
