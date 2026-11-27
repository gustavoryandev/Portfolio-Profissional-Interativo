import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';

process.env.DOTENV_CONFIG_QUIET = 'true';
const originalApiKey = process.env.GEMINI_API_KEY;
process.env.GEMINI_API_KEY = 'isolated-regression-fixture';
let mockAdapter;
const originalAdapter = axios.defaults.adapter;
axios.defaults.adapter = config => {
  if (!mockAdapter) throw new Error('Unexpected integration request');
  return mockAdapter(config);
};
const { default: handler } = await import('../../api/chat.js');
axios.defaults.adapter = originalAdapter;

function response() {
  return {
    code: 200,
    headers: {},
    status(code) { this.code = code; return this; },
    setHeader(name, value) { this.headers[name] = value; },
    json(body) { this.body = body; return this; },
  };
}

test('a typed project question reaches the model with profile facts and no opened-card history', async () => {
  const originalFetch = globalThis.fetch;
  const question = 'What did Gustavo contribute to the ROTA project?';
  let generationRequest;
  mockAdapter = async config => ({
    status: 200,
    config,
    data: { models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }] },
  });
  globalThis.fetch = async (_url, options) => {
    generationRequest = JSON.parse(options.body);
    return Response.json({ candidates: [{
      content: { role: 'model', parts: [{ text: 'Gustavo modeled the vehicle-rental data and SQL migrations.' }] },
      finishReason: 'STOP',
    }] });
  };

  try {
    const res = response();
    await handler({ method: 'POST', body: { userMessage: question, lang: 'en', surface: 'full', chatHistory: [] } }, res);

    assert.equal(res.code, 200);
    assert.equal(res.body.response, 'Gustavo modeled the vehicle-rental data and SQL migrations.');
    assert.doesNotMatch(res.body.response, /\[PROJECTS_CARD\]/);
    assert.deepEqual(generationRequest.contents.at(-1).parts, [{ text: question }]);
    assert.match(generationRequest.systemInstruction.parts[0].text, /ROTA/);
    assert.match(generationRequest.systemInstruction.parts[0].text, /Perguntas sobre um projeto específico ou teoria de programação não autorizam o card/);
  } finally {
    globalThis.fetch = originalFetch;
    process.env.GEMINI_API_KEY = originalApiKey ?? '';
    mockAdapter = undefined;
  }
});
