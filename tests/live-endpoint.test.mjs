import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';

// No credentials or external requests are used in this handler test.
process.env.GEMINI_API_KEY = '';
process.env.WAKATIME_API_KEY = 'test-only';
process.env.WAKATIME_ACCESS_TOKEN = '';
process.env.GITHUB_TOKEN = '';
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
      data: { data: { total_seconds: 3600, is_up_to_date: true, daily_average: 3600, days_minus_holidays: 1, days_including_holidays: 1,
        languages: [{ name: 'Java', total_seconds: 3600, percent: 100 }], editors: [{ name: 'VS Code', total_seconds: 3600, percent: 100 }], operating_systems: [{ name: 'Linux', total_seconds: 3600, percent: 100 }] } } };

  };
  try {
    const res = response();
    await handler({ method: 'POST', body: { action: 'refreshContext', sources: ['wakatime', 'wakatime'] } }, res);
    assert.equal(res.code, 200);
    assert.equal(res.body.liveContext.wakatime.status, 'ok');
    assert.equal(res.body.liveContext.wakatime.languages[0].name, 'Java');
    assert.equal(res.body.liveContext.wakatime.editors[0].percent, '100.0');
    assert.equal(res.body.liveContext.wakatime.operatingSystems[0].name, 'Linux');
    assert.equal(calls, 3);
    assert.equal(JSON.stringify(res.body).includes('test-only'), false);
    assert.equal(res.body.model, undefined);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  } finally { mockAdapter = undefined; }
});

test('metrics summary and confirmation bypass the model and keep the requested sources', async () => {
  let res = response();
  await handler({ method: 'POST', body: { userMessage: 'Show GitHub and WakaTime metrics', lang: 'en' } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.model, undefined);
  assert.deepEqual(res.body.response.match(/\[[A-Z_]+\]/g), ['[GITHUB_CARD]', '[WAKATIME_CARD]']);
  const summary = res.body.response;
  res = response();
  await handler({ method: 'POST', body: { userMessage: 'Yes please', lang: 'en', chatHistory: [{ sender: 'ai', text: summary }] } }, res);
  assert.equal(res.code, 200);
  assert.equal(res.body.model, undefined);
  assert.deepEqual(res.body.response.match(/\[[A-Z_]+\]/g), ['[GITHUB_CARD]', '[GITHUB_ACTIVITY_CARD]', '[GITHUB_LANGUAGES_CARD]', '[REPOSITORIES_CARD]', '[STATS_CARD]']);
  assert.deepEqual(Object.keys(res.body.liveContext), ['github', 'wakatime']);
});

test('WakaTime-only requests do not load GitHub', async () => {
  for (const userMessage of ['me mostre as metricas do waka time', 'WakaTime metrics', 'Show Waka-Time metrics', 'tempo de código', 'coding time']) {
    const res = response();
    await handler({ method: 'POST', body: { userMessage, lang: 'pt' } }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body.response.match(/\[[A-Z_]+\]/g), ['[WAKATIME_CARD]']);
    assert.equal(res.body.liveContext.github, undefined);
  }
});

test('explicit GitHub and combined requests retain the summary even after a pending offer', async () => {
  for (const [userMessage, cards] of [
    ['Show GitHub metrics', ['[GITHUB_CARD]']],
    ['Mostre as métricas do GitHub e WakaTime', ['[GITHUB_CARD]', '[WAKATIME_CARD]']],
  ]) {
    const res = response();
    await handler({ method: 'POST', body: { userMessage, chatHistory: [{ sender: 'ai', translationKey: 'chat.metricsSummary' }] } }, res);
    assert.equal(res.code, 200);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body.response.match(/\[[A-Z_]+\]/g), cards);
    assert.equal(Object.hasOwn(res.body.liveContext, 'wakatime'), cards.includes('[WAKATIME_CARD]'));
  }
});

test('translation protects code, URLs and card markers before calling the model', async () => {
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'test-only';
  mockAdapter = async config => ({ status: 200, config, data: { models: [{name:'models/gemini-2.5-flash',supportedGenerationMethods:['generateContent']}] } });
  let invalid = false;
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    const text = body.contents[0].parts[0].text;
    assert.equal(text.includes('const secret = 1'), false);
    assert.equal(text.includes('[GITHUB_CARD]'), false);
    const translated = invalid ? 'Missing placeholders' : text.replace('Olá', 'Hello');
    return new Response(JSON.stringify({ candidates: [{ content: {parts:[{text:translated}],role:'model'},finishReason:'STOP' }] }), {status:200,headers:{'content-type':'application/json'}});
  };
  try {
    const text = 'Olá **amigo**.\n```js\nconst secret = 1;\n```\n[Site](https://example.com)\n[GITHUB_CARD]';
    const res = response();
    await handler({method:'POST',body:{action:'translate',text,lang:'en'}},res);
    assert.equal(res.code,200);
    assert.equal(res.body.text,text.replace('Olá','Hello'));
    invalid = true;
    const rejected = response();
    await handler({method:'POST',body:{action:'translate',text,lang:'en'}},rejected);
    assert.equal(rejected.code,502);
  } finally { globalThis.fetch = originalFetch; process.env.GEMINI_API_KEY = ''; mockAdapter = undefined; }
});

test('partial WakaTime results retain the total without inventing breakdowns', async () => {
  const savedAdapter = axios.defaults.adapter;
  axios.defaults.adapter = async config => {
    if (config.url.endsWith('/stats/all_time')) throw {response:{status:429}};
    assert.ok(config.url.endsWith('/all_time_since_today'));
    return {status:202,config,data:{data:{total_seconds:7200,is_up_to_date:false}}};
  };
  const {default: isolatedHandler} = await import('../api/chat.js?partial-test');
  axios.defaults.adapter = savedAdapter;
  const res = response();
  await isolatedHandler({method:'POST',body:{action:'refreshContext',sources:['wakatime']}},res);
  assert.equal(res.body.liveContext.wakatime.summary.totalFormatted,'2h 0m');
  assert.deepEqual(res.body.liveContext.wakatime.languages,[]);
  assert.equal(res.body.liveContext.wakatime.stale,true);
  assert.equal(res.body.liveContext.wakatime.reason,'rate_limited');
});

test('declining details makes no additional integration or model request', async () => {
  mockAdapter = () => { throw new Error('No request expected'); };
  try {
    const res = response();
    await handler({method:'POST',body:{userMessage:'Não, obrigado',chatHistory:[{sender:'ai',translationKey:'chat.metricsSummary'}]}},res);
    assert.equal(res.code,200);
    assert.equal(res.body.translationKey,'chat.metricsDeclined');
    assert.equal(res.body.liveContext,undefined);
    assert.equal(res.body.response.includes('_CARD]'),false);
  } finally { mockAdapter = undefined; }
});
