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

test('the chat retries incomplete Gemini output in JSON and replaces it in the stream', async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  const first = 'gemini-3.8-flash';
  const second = 'gemini-3.6-flash';
  process.env.GEMINI_API_KEY = 'chat-regression-test';
  mockAdapter = async config => {
    calls.push(config.url);
    assert.match(config.url, /generativelanguage\.googleapis\.com\/v1beta\/models$/);
    return { status: 200, config, data: { models: [first, second].map(name => ({
      name: `models/${name}`, supportedGenerationMethods: ['generateContent'],
    })) } };
  };
  const candidate = (parts, finishReason) => ({ candidates: [{ content: { role: 'model', parts }, finishReason }] });
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body);
    assert.equal(body.generationConfig.thinkingConfig.thinkingLevel, 'LOW');
    assert.ok(body.generationConfig.maxOutputTokens > 1024);
    assert.match(body.systemInstruction.parts[0].text, /STATUS DAS APIS: \{\}/);
    const truncated = url.includes(first);
    assert.ok(truncated || url.includes(second));
    const parts = [
      { text: 'Internal thought', thought: true },
      { text: truncated ? 'A resposta **incom' : 'A resposta completa.' },
    ];
    const finishReason = truncated ? 'MAX_TOKENS' : 'STOP';
    if (url.includes('streamGenerateContent')) {
      const frames = [candidate(parts), candidate([], finishReason)]
        .map(frame => `data: ${JSON.stringify(frame)}\n\n`).join('');
      return new Response(frames, { headers: { 'Content-Type': 'text/event-stream' } });
    }
    return Response.json(candidate(parts, finishReason));
  };
  try {
    const res = response();
    const request = { method: 'POST', body: { userMessage: 'Quem é Gustavo?' } };
    await handler(request, res);
    assert.equal(res.body.response, 'A resposta completa.');
    assert.equal(res.body.model, second);
    assert.deepEqual(res.body.liveContext, {});

    const events = [];
    const streamed = {
      ...response(),
      flushHeaders() { this.headersSent = true; },
      write(line) { events.push(JSON.parse(line)); return true; },
      end() {},
    };
    await handler({ ...request, body: { ...request.body, stream: true, streamRetry: true } }, streamed);
    assert.deepEqual(events.map(event => event.type), ['meta', 'delta', 'reset', 'meta', 'delta', 'context', 'done']);
    assert.equal(events[1].text, 'A resposta **incom');
    assert.equal(events[3].model, second);
    assert.equal(events[4].text, 'A resposta completa.');
    assert.equal(calls.length, 1);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.GEMINI_API_KEY = '';
    mockAdapter = undefined;
  }
});

test('explicit game and proficiency requests bypass generation with one appropriate card', async () => {
  for (const [userMessage, tag] of [
    ['Quero jogar xadrez com você', '[CHESS_GAME]'],
    ['I want to play chess with you', '[CHESS_GAME]'],
    ['Quais tecnologias ele domina?', '[SKILLS_CARD]'],
    ['What technologies does he know?', '[SKILLS_CARD]'],
  ]) {
    const res = response();
    await handler({ method: 'POST', body: { userMessage, lang: 'pt', stream: true } }, res);
    assert.equal(res.code, 200);
    assert.deepEqual(res.body.response.match(/\[[A-Z_]+\]/g), [tag]);
    assert.equal(res.body.model, undefined);
  }
});

test('both Astra surfaces share the same tool contract and request editor data only in the second turn', async () => {
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'portfolio-actions-test';
  mockAdapter = async config => ({ status: 200, config, data: {
    models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }],
  } });
  const actions = [
    { type: 'navigate', target: 'laboratorio' }, { type: 'lab.language', target: 'python' },
    { type: 'lab.example', target: 'bro-fit' }, { type: 'lab.read', target: 'code' },
  ];
  const edits = [{ find: 'aluno = "Carlos"', replace: 'aluno = "Ana"' }];
  const snapshot = { example: 'bro-fit', language: 'python', status: 'idle', code: edits[0].find };
  let requests = 0;
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(options.body);
    const declarations = body.tools[0].functionDeclarations.map(item => item.name);
    const parts = body.contents.at(-1).parts;
    const snapshotTurn = requests++ % 2 === 1;
    assert.deepEqual(declarations, snapshotTurn ? ['propose_lab_edit', 'propose_lab_run'] : ['portfolio_actions']);
    assert.equal(parts.length, snapshotTurn ? 2 : 1);
    if (snapshotTurn) assert.deepEqual(JSON.parse(parts[1].text.split(' (data): ')[1]), snapshot);
    const functionCall = snapshotTurn ? { name: 'propose_lab_edit', args: { edits } }
      : { name: 'portfolio_actions', args: { actions } };
    const frames = [
      { candidates: [{ content: { role: 'model', parts: [{ functionCall }] } }] },
      { candidates: [{ content: { role: 'model', parts: [] }, finishReason: 'STOP' }] },
    ];
    return new Response(frames.map(frame => `data: ${JSON.stringify(frame)}\n\n`).join(''), {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  };
  try {
    for (const surface of ['full', 'compact']) {
      const request = { userMessage: 'Open the Laboratory, select Python, load Bro Fit and rename the student to Ana.',
        lang: 'en', surface, stream: true };
      for (const [labSnapshot, expected] of [[undefined, actions], [snapshot, [{ type: 'lab.edit', edits, runAfter: false }]]]) {
        const events = [];
        const res = { ...response(), flushHeaders() { this.headersSent = true; },
          write(line) { events.push(JSON.parse(line)); return true; }, end() {} };
        await handler({ method: 'POST', body: { ...request, labSnapshot } }, res);
        assert.deepEqual(events.map(event => event.type), ['meta', 'context', 'actions', 'done']);
        assert.deepEqual(events[2].actions, expected);
      }
    }
    assert.equal(requests, 4);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.GEMINI_API_KEY = '';
    mockAdapter = undefined;
  }
});
