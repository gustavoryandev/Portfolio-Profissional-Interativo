import test, { after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import React from 'react';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { vitePublicUrls } from '../vite-public-urls.mjs';

const output = new URL('./.astra-streaming-fixture.mjs', import.meta.url);
const stylesheet = new URL('./.astra-streaming-fixture.css', import.meta.url);
await build({
  entryPoints: ['tests/isolated/astra-streaming-fixture.jsx'],
  outfile: fileURLToPath(output),
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external',
  jsx: 'automatic',
  define: { 'import.meta.env': '{}' },
  logLevel: 'silent',
  plugins: [vitePublicUrls, {
    name: 'unused-pdf',
    setup(esbuild) {
      esbuild.onResolve({ filter: /ResumeCard$/ }, () => ({ path: 'resume', namespace: 'stub' }));
      esbuild.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default () => null' }));
    },
  }],
});

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/chat', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
Object.assign(globalThis, {
  window,
  document,
  HTMLElement: window.HTMLElement,
  SVGElement: window.SVGElement,
  MutationObserver: window.MutationObserver,
  requestAnimationFrame: window.requestAnimationFrame.bind(window),
  cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  IS_REACT_ACT_ENVIRONMENT: true,
});
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: window.localStorage });
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: window.sessionStorage });
window.matchMedia = query => ({
  matches: query.includes('prefers-reduced-motion') || query.includes('pointer: coarse') || query.includes('max-width'),
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
});
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLElement.prototype.hidePopover = () => {};
window.HTMLDialogElement.prototype.show = window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
window.HTMLDialogElement.prototype.close = function () { this.open = false; };
window.Audio = class {
  paused = true;
  play() { this.paused = false; return Promise.resolve(); }
  pause() { this.paused = true; }
};
globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
globalThis.Image = class {
  set src(value) { queueMicrotask(() => this.onload?.()); }
  async decode() {}
};

const requests = [];
const translationRequests = [];
const originalFetch = globalThis.fetch;
const originalAdapter = axios.defaults.adapter;
let activeStream;
globalThis.fetch = async (_url, options) => {
  const body = JSON.parse(options.body);
  if (body.action === 'models') return Response.json({ models: ['fixture'] });
  requests.push(body);
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    start(controller) {
      let finished = false;
      const send = event => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      send({ type: 'meta', model: 'fixture' });
      send({ type: 'delta', text: 'STREAM_START ' });
      activeStream = {
        finish(text = '') {
          if (finished) return;
          finished = true;
          if (text) send({ type: 'delta', text });
          send({ type: 'done' });
          controller.close();
        },
      };
    },
  }), { headers: { 'Content-Type': 'application/x-ndjson' } });
};
axios.defaults.adapter = async config => {
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  translationRequests.push(body);
  return { data: { text: 'Resposta traduzida.' }, status: 200, statusText: 'OK', headers: {}, config };
};

const { App, ThemeProvider, i18n } = await import(output.href);
const { createRoot } = await import('react-dom/client');
const { act } = await import('react');
const $ = selector => document.querySelector(selector);
let root;

async function until(predicate) {
  for (let attempt = 0; attempt < 40 && !predicate(); attempt++) {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 10)); });
  }
  assert.ok(predicate(), 'expected the UI to reach the requested state');
}

async function mount(language = 'en') {
  requests.length = 0;
  translationRequests.length = 0;
  activeStream = null;
  window.history.replaceState(null, '', '/chat');
  document.documentElement.dataset.theme = 'rick-morty';
  document.documentElement.dataset.dimension = 'lab';
  window.localStorage.setItem('theme', 'rick-morty');
  window.localStorage.setItem('rick-morty-dimension', 'lab');
  window.sessionStorage.setItem('rick-garage-intro-seen', '1');
  await act(async () => i18n.changeLanguage(language));
  root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(ThemeProvider, null, React.createElement(App))));
  await until(() => $('.astra-full #chat-input'));
}

async function click(node) {
  assert.ok(node, 'expected a control to be present');
  await act(async () => node.click());
}

async function send(text) {
  const input = $('#chat-input');
  await act(async () => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set.call(input, text);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  await click($('.chat-form button[type="submit"]'));
  await until(() => activeStream && $('[data-streaming-reply]'));
  return activeStream;
}

function completedReply(token) {
  return [...document.querySelectorAll('.chat-msg-in')].find(node => node.textContent.includes(token));
}

afterEach(async () => {
  if (activeStream) {
    await act(async () => {
      activeStream.finish();
      await new Promise(resolve => setTimeout(resolve, 15));
    });
  }
  if (root) {
    await act(async () => root.unmount());
    root = null;
  }
});

after(async () => {
  globalThis.fetch = originalFetch;
  axios.defaults.adapter = originalAdapter;
  window.close();
  await Promise.all([output, stylesheet].map(file => unlink(file).catch(() => {})));
});

test('reply authorship stays with the original persona across a dimension change during streaming', async () => {
  await mount();
  const stream = await send('Explain a short function.');
  const initialAuthor = $('[data-streaming-reply] .astra-label span').textContent;
  await click($('.astra-full .dimension-portal'));
  await until(() => document.documentElement.dataset.dimension === 'corrupted');
  const streamingAuthor = $('[data-streaming-reply] .astra-label span').textContent;
  stream.finish('PERSONA_FINAL');
  await until(() => completedReply('PERSONA_FINAL'));
  const finalAuthor = completedReply('PERSONA_FINAL').querySelector('.astra-label span').textContent;

  assert.equal(initialAuthor, 'Squanchy');
  assert.equal(streamingAuthor, 'Squanchy');
  assert.equal(finalAuthor, 'Squanchy');
});

test('reply authorship stays with the original persona across a theme change during streaming', async () => {
  await mount();
  const stream = await send('Explain another short function.');
  const initialAuthor = $('[data-streaming-reply] .astra-label span').textContent;
  await click($('.astra-full .header-actions button[aria-haspopup]'));
  await click($('.astra-full [data-preview="dark"]'));
  await until(() => document.documentElement.dataset.theme === 'dark');
  const streamingAuthor = $('[data-streaming-reply] .astra-label span').textContent;
  stream.finish('THEME_FINAL');
  await until(() => completedReply('THEME_FINAL'));
  const finalAuthor = completedReply('THEME_FINAL').querySelector('.astra-label span').textContent;

  assert.equal(initialAuthor, 'Squanchy');
  assert.equal(streamingAuthor, 'Squanchy');
  assert.equal(finalAuthor, 'Squanchy');
});

test('a language change during streaming keeps the request language and translates the completed reply', async () => {
  await mount('en');
  const stream = await send('Tell me one sentence.');
  await act(async () => i18n.changeLanguage('pt'));
  stream.finish('LANGUAGE_FINAL');
  await until(() => completedReply('Resposta traduzida.'));

  assert.equal(requests[0].lang, 'en');
  assert.deepEqual(translationRequests.at(-1), {
    action: 'translate',
    text: 'STREAM_START LANGUAGE_FINAL',
    lang: 'pt',
  });
});

test('a simple programming example renders as code without opening a resource card', async () => {
  await mount();
  const stream = await send('Show a simple JavaScript example.');
  stream.finish('```js\nconst dobro = n => n * 2;\nconsole.log(dobro(3));\n```');
  await until(() => completedReply('console.log(dobro(3))'));
  const reply = completedReply('console.log(dobro(3))');

  assert.match(reply.querySelector('pre').textContent, /const dobro = n => n \* 2/);
  assert.match(reply.querySelector('pre').textContent, /console\.log\(dobro\(3\)\)/);
  assert.equal(reply.querySelector('.project-tile, .chess-game'), null);
});
