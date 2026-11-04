import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { localApiPlugin } from '../server/devApi.js';
import { readFile } from 'node:fs/promises';

async function fixture(t, options) {
  let middleware;
  localApiPlugin(options).configureServer({
    middlewares: { use(fn) { middleware = fn; } },
    config: { logger: { error() {} } },
  });
  const server = createServer((req, res) => middleware(req, res, () => {
    res.statusCode = 404;
    res.end('Not found');
  }));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('local route runs the real handler and leaves unrelated paths alone', async t => {
  const url = await fixture(t);
  const get = await fetch(`${url}/api/chat`);
  assert.equal(get.status, 405);
  assert.equal((await get.json()).error, 'Method Not Allowed');
  const invalid = await fetch(`${url}/api/chat?local=1`, {
    method: 'POST', body: JSON.stringify({ action: 'refreshContext', sources: [] }),
  });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error, 'Fontes inválidas.');
  const other = await fetch(`${url}/api/chat/other`);
  assert.equal(other.status, 404);
  await other.text();
});

test('JSON body and response status survive the local adapter', async t => {
  const url = await fixture(t, { loadHandler: async () => ({ default: (req, res) => {
    res.status(201).json({ message: req.body.userMessage });
  } }) });
  const response = await fetch(`${url}/api/chat`, { method: 'POST', body: JSON.stringify({ userMessage: 'Olá, Astra!' }) });
  assert.equal(response.status, 201);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), { message: 'Olá, Astra!' });
  const invalid = await fetch(`${url}/api/chat`, { method: 'POST', body: '{invalid' });
  assert.equal(invalid.status, 400);
  assert.equal((await invalid.json()).error, 'JSON inválido.');
});

test('streaming responses pass through without JSON wrapping', async t => {
  const url = await fixture(t, { loadHandler: async () => ({ default: (req, res) => {
    res.setHeader('Content-Type', 'application/x-ndjson');
    res.write('{"type":"delta","text":"Olá"}\n');
    res.end('{"type":"done"}\n');
  } }) });
  const response = await fetch(`${url}/api/chat`, { method: 'POST' });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /ndjson/);
  assert.deepEqual((await response.text()).trim().split('\n').map(JSON.parse), [{ type: 'delta', text: 'Olá' }, { type: 'done' }]);
});

test('chat errors have readable translations in both supported languages', async () => {
  for (const lang of ['pt', 'en']) {
    const translations = JSON.parse(await readFile(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8'));
    assert.ok(translations.chat.erro.length > 20);
    assert.notEqual(translations.chat.erro, 'chat.erro');
  }
});
