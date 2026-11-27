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
let reducedMotion = true;
window.matchMedia = query => ({
  matches: (reducedMotion && query.includes('prefers-reduced-motion')) || query.includes('pointer: coarse') || query.includes('max-width'),
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
const nextResponses = [];
const originalFetch = globalThis.fetch;
const originalAdapter = axios.defaults.adapter;
let activeStream;
globalThis.fetch = async (_url, options) => {
  const body = JSON.parse(options.body);
  if (body.action === 'models') return Response.json({ models: ['fixture'] });
  requests.push(body);
  return nextResponses.shift()?.(body) ?? streamResponse();
};

function streamResponse({ withFirstDelta = true } = {}) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    start(controller) {
      let finished = false;
      const send = event => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      send({ type: 'meta', model: 'fixture' });
      if (withFirstDelta) send({ type: 'delta', text: 'STREAM_START ' });
      activeStream = {
        push: send,
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
}
axios.defaults.adapter = async config => {
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
  translationRequests.push(body);
  return { data: { text: 'Resposta traduzida.' }, status: 200, statusText: 'OK', headers: {}, config };
};

const { App, ThemeProvider, i18n, MessageBubble } = await import(output.href);
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

async function mount(language = 'en', path = '/chat', { theme = 'rick-morty', dimension = 'lab', unlocked = false, reduce = true } = {}) {
  requests.length = 0;
  translationRequests.length = 0;
  nextResponses.length = 0;
  activeStream = null;
  reducedMotion = reduce;
  window.history.replaceState(null, '', path);
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.dimension = dimension;
  window.localStorage.clear();
  window.localStorage.setItem('theme', theme);
  window.localStorage.setItem('rick-morty-dimension', dimension);
  if (unlocked) window.localStorage.setItem('rick-morty-beyond-unlocked', '1');
  window.sessionStorage.setItem('rick-garage-intro-seen', '1');
  await act(async () => i18n.changeLanguage(language));
  root = createRoot(document.getElementById('root'));
  await act(async () => root.render(React.createElement(ThemeProvider, null, React.createElement(App))));
  if (path === '/') {
    await until(() => $('.astra-fab'));
    await click($('.astra-fab'));
    await until(() => $('.astra-shell-modal[open] #chat-input'));
  } else {
    await until(() => $('.astra-full #chat-input'));
  }
}

async function click(node) {
  assert.ok(node, 'expected a control to be present');
  await act(async () => node.click());
}

async function submit(text) {
  const input = $('#chat-input');
  await act(async () => {
    Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), 'value').set.call(input, text);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  await click($('.chat-form button[type="submit"]'));
}

async function send(text, { preview = true } = {}) {
  const before = requests.length;
  await submit(text);
  await until(() => requests.length > before && (!preview || (activeStream && $('[data-streaming-reply]'))));
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

test('compact discovery from the Garage is local, awards once, and follows the normal journal reset', async () => {
  await mount('pt', '/');
  assert.equal($('.dimension-portal-gold'), null);
  assert.equal($('.beyond-achievement'), null);
  await submit('Wabalabadubdub');
  await until(() => document.documentElement.dataset.dimension === 'beyond-curve');
  assert.equal(requests.length, 0);
  assert.equal($('.beyond-transit'), null, 'reduced motion crosses directly');
  assert.equal($('.chat-heading img').dataset.astraCharacter, 'evil-rick');
  assert.match(completedReply('Sinal reconhecido').textContent, /Sr\. Meeseeks/);
  assert.match($('.beyond-achievement').textContent, /Viajante Interdimensional/);
  assert.equal(window.localStorage.getItem('rick-morty-beyond-unlocked'), '1');
  assert.equal(window.localStorage.getItem('rick-morty-dimension'), 'beyond-curve');
  assert.deepEqual(JSON.parse(window.localStorage.getItem('rick-morty-exploration')).found, ['beyond-curve']);
  await click($('.astra-toolbar button'));
  await click($('.dimension-portals button'));
  assert.equal(document.documentElement.dataset.dimension, 'lab');
  await click($('.dimension-portal-gold'));
  assert.equal(document.documentElement.dataset.dimension, 'beyond-curve');
  assert.equal($('.beyond-achievement'), null);
  const reset = [...document.querySelectorAll('.rick-extra-archive button')].find(button => button.textContent === i18n.t('rick.extras.discovery.reset'));
  await click(reset);
  assert.equal(document.documentElement.dataset.dimension, 'lab');
  assert.equal($('.dimension-portal-gold'), null);
  assert.equal(window.localStorage.getItem('rick-morty-beyond-unlocked'), null);
  assert.deepEqual(JSON.parse(window.localStorage.getItem('rick-morty-exploration')).found, []);
});

test('full discovery from the Citadel preserves authors as the journey and language change', async () => {
  await mount('en', '/chat', { dimension: 'corrupted' });
  await submit('Wubba Lubba Dub-Dub');
  await until(() => document.documentElement.dataset.dimension === 'beyond-curve');
  assert.equal(requests.length, 0);
  assert.equal($('.chat-heading img').dataset.astraCharacter, 'evil-morty');
  assert.match(completedReply('Signal recognized').textContent, /Mr\. Poopybutthole/);
  const stream = await send('Explain a design choice.');
  assert.equal(requests.at(-1).appearance.dimension, 'beyond-curve');
  await click($('.dimension-portal-gold'));
  assert.equal(document.documentElement.dataset.dimension, 'corrupted');
  assert.match($('[data-streaming-reply] .astra-label').textContent, /Evil Morty/);
  await act(async () => i18n.changeLanguage('pt'));
  stream.finish('CURVE_FINAL');
  await until(() => completedReply('Resposta traduzida.'));
  const reply = completedReply('Resposta traduzida.');
  assert.equal(reply.querySelector('.astra-label span').textContent, 'Morty Maligno');
  assert.equal(reply.querySelector('img').dataset.astraCharacter, 'evil-morty');
  await act(async () => i18n.changeLanguage('en'));
  assert.equal(reply.querySelector('.astra-label span').textContent, 'Evil Morty');
  assert.equal(reply.querySelector('img').dataset.astraCharacter, 'evil-morty');
  await act(async () => i18n.changeLanguage('pt'));
  assert.match(completedReply('Sinal reconhecido').textContent, /Sr\. Bunda Cagada/);
});

test('the phrase remains an ordinary Astra request outside Rick and Morty', async () => {
  await mount('en', '/chat', { theme: 'dark' });
  await send('Wubba Lubba Dub Dub');
  assert.equal(requests[0].userMessage, 'Wubba Lubba Dub Dub');
  assert.equal(window.localStorage.getItem('rick-morty-beyond-unlocked'), null);
});

test('a direct full visit restores the dimension and renders historical Squanchy without reassignment', async () => {
  await mount('en', '/chat', { dimension: 'beyond-curve', unlocked: true });
  assert.equal($('.chat-heading img').dataset.astraCharacter, 'evil-morty');
  const themeMenu = $('.astra-full .header-actions button[aria-haspopup]');
  await click(themeMenu);
  await click($('.astra-full [data-preview="dark"]'));
  assert.equal(document.documentElement.dataset.dimension, undefined);
  assert.equal(window.localStorage.getItem('rick-morty-dimension'), 'beyond-curve');
  await click(themeMenu);
  await click($('.astra-full [data-preview="rick-morty"]'));
  assert.equal(document.documentElement.dataset.dimension, 'beyond-curve');
  await click($('.astra-full .brand-lockup'));
  await until(() => window.location.pathname === '/' && $('.astra-fab img')?.dataset.astraCharacter === 'evil-rick');
  const author = Object.freeze({ personaId: 'squanchy', theme: 'rick-morty', dimension: 'lab', surface: 'full', language: 'pt' });
  await act(async () => root.render(React.createElement(ThemeProvider, null,
    React.createElement(MessageBubble, { message: { id: 'old', sender: 'ai', lang: 'pt', author, text: 'Resposta antiga.' } }))));
  assert.match($('.astra-label').textContent, /Squanchy/);
  assert.equal($('img[data-astra-character="squanchy"]')?.getAttribute('src'), '/rick-assets/avatar-squanchy.webp');
});

test('one moving canvas survives a missing mansion image and Escape settles the trip', async t => {
  let rendered = 0;
  const noop = () => {};
  t.mock.method(window.HTMLCanvasElement.prototype, 'getContext', () => ({
    clearRect() { rendered++; },
    setTransform: noop, beginPath: noop, closePath: noop, moveTo: noop, lineTo: noop,
    stroke: noop, fill: noop, fillRect: noop, quadraticCurveTo: noop,
    createRadialGradient: () => ({ addColorStop: noop }),
  }));
  await mount('en', '/chat', { dimension: 'corrupted', reduce: false });
  await submit('WubbaLubbaDubDub');
  const dialog = $('.beyond-transit[open]');
  assert.ok(dialog);
  assert.equal(dialog.dataset.renderer, 'canvas');
  const canvas = dialog.querySelector('canvas');
  const initialFrames = rendered;
  assert.equal(document.documentElement.dataset.dimension, 'corrupted');
  assert.equal($('.beyond-achievement'), null);
  assert.equal(window.localStorage.getItem('rick-morty-beyond-unlocked'), '1');
  const portal = $('.astra-full .dimension-portal-gold');
  await click(portal);
  assert.equal($('.beyond-transit[open]'), dialog);
  await act(async () => { await new Promise(resolve => setTimeout(resolve, 1060)); });
  assert.equal(dialog.dataset.shot, 'curve');
  assert.equal(dialog.querySelector('canvas'), canvas);
  assert.ok(rendered > initialFrames);
  const mansion = dialog.querySelector('img');
  assert.match(mansion.src, /evil-morty-mansion/);
  await act(async () => mansion.dispatchEvent(new window.Event('error')));
  assert.equal(mansion.hidden, true);
  await act(async () => dialog.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
  assert.equal($('.beyond-transit'), null);
  assert.equal(document.documentElement.dataset.dimension, 'beyond-curve');
  assert.equal(document.activeElement.id, 'chat-input');
  assert.equal(document.querySelectorAll('.beyond-achievement').length, 1);
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

  assert.equal(initialAuthor, 'Birdperson');
  assert.equal(streamingAuthor, 'Birdperson');
  assert.equal(finalAuthor, 'Birdperson');
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

  assert.equal(initialAuthor, 'Birdperson');
  assert.equal(streamingAuthor, 'Birdperson');
  assert.equal(finalAuthor, 'Birdperson');
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

test('compact authorship survives close, reopen and opening full Astra before the first fragment', async () => {
  await mount('en', '/');
  assert.equal(translationRequests.length, 0, 'the localized greeting does not need Gemini');
  nextResponses.push(() => streamResponse({ withFirstDelta: false }));
  const stream = await send('Wait for the first fragment.', { preview: false });
  await click($('.astra-toolbar button'));
  assert.equal($('.astra-shell-modal').open, false);
  await click($('.astra-fab'));
  await click($('.astra-toolbar a'));
  await until(() => $('.astra-full #chat-input'));
  assert.match($('.astra-full [role="log"] [role="status"]').textContent, /Mr\. Meeseeks/);
  await act(async () => stream.push({ type: 'delta', text: 'COMPACT_FRAGMENT ' }));
  await until(() => $('[data-streaming-reply]'));
  assert.equal($('[data-streaming-reply] .astra-label span').textContent, 'Mr. Meeseeks');
  stream.finish('COMPACT_FINAL');
  await until(() => completedReply('COMPACT_FINAL'));
  assert.equal(completedReply('COMPACT_FINAL').querySelector('.astra-label span').textContent, 'Mr. Meeseeks');
  assert.equal(completedReply('COMPACT_FINAL').querySelector('img').getAttribute('data-astra-character'), 'meeseeks');
  assert.match($('#astra-welcome').textContent, /garage/i);
  assert.equal(translationRequests.length, 0);

  const next = await send('Use the previous reply.');
  assert.equal(requests.at(-1).surface, 'full');
  assert.match(requests.at(-1).chatHistory.find(item => item.text.includes('COMPACT_FINAL')).text, /COMPACT_FRAGMENT/);
  assert.equal($('[data-streaming-reply] .astra-label span').textContent, 'Birdperson');
  next.finish('NEXT_FINAL');
  await until(() => completedReply('NEXT_FINAL'));
  assert.equal(completedReply('NEXT_FINAL').querySelector('.astra-label span').textContent, 'Birdperson');
  assert.equal(completedReply('COMPACT_FINAL').querySelector('.astra-label span').textContent, 'Mr. Meeseeks');
});

test('an explicitly standard Astra reply retains its label and avatar after switching into Rick', async () => {
  await mount();
  await click($('.astra-full .header-actions button[aria-haspopup]'));
  await click($('.astra-full [data-preview="dark"]'));
  await until(() => document.documentElement.dataset.theme === 'dark');
  const stream = await send('A standard Astra turn.');
  stream.finish('STANDARD_FINAL');
  await until(() => completedReply('STANDARD_FINAL'));
  await click($('.astra-full .header-actions button[aria-haspopup]'));
  await click($('.astra-full [data-preview="rick-morty"]'));
  await until(() => document.documentElement.dataset.theme === 'rick-morty');

  const reply = completedReply('STANDARD_FINAL');
  assert.equal(reply.querySelector('.astra-label span').textContent, 'Astra');
  assert.equal(reply.querySelector('img').getAttribute('src'), '/astra-avatar-mobile.png');
  assert.match($('#astra-welcome').textContent, /Birdperson/);
});

test('late JSON after stopping cannot change the theme or clear the replacement stream', async () => {
  await mount('pt');
  let late;
  nextResponses.push(() => new Promise(resolve => { late = resolve; }));
  await send('Troque o tema.', { preview: false });
  await click($('.chat-form [aria-label="Parar resposta"]'));
  await until(() => completedReply('Resposta interrompida.'));
  assert.equal(completedReply('Resposta interrompida.').querySelector('.astra-label span').textContent, 'Pássaro-Pessoa');
  const replacement = await send('Responda de novo.');
  await act(async () => late(Response.json({ response: 'STALE_REPLY', actions: [{ type: 'theme.set', target: 'dark' }] })));
  assert.equal(document.documentElement.dataset.theme, 'rick-morty');
  assert.ok($('.chat-form [aria-label="Parar resposta"]'));
  assert.ok($('[data-streaming-reply]'));
  assert.equal(completedReply('STALE_REPLY'), undefined);
  assert.ok(requests.at(-1).chatHistory.every(item => !item.text.includes('Resposta interrompida.')));
  replacement.finish('RETRY_FINAL');
  await until(() => completedReply('RETRY_FINAL'));
});

test('a late open-full action preserves the Arcade already opened in full Astra', async () => {
  await mount('en', '/');
  let ready;
  nextResponses.push(() => new Promise(resolve => { ready = resolve; }));
  await send('Open Full Astra after a delay.', { preview: false });
  await click($('.astra-toolbar a'));
  await until(() => $('.astra-full .astra-arcade-trigger'));
  await click($('.astra-full .astra-arcade-trigger'));
  await until(() => window.location.search === '?arcade=1');
  await act(async () => ready(Response.json({ actions: [{ type: 'astra.openFull' }] })));
  await until(() => completedReply('You’re already in Full Astra.'));
  assert.equal(window.location.search, '?arcade=1');
  assert.equal(completedReply('You’re already in Full Astra.').querySelector('.astra-label span').textContent, 'Mr. Meeseeks');
});

test('an error is displayed in the current locale without changing the request or author', async () => {
  await mount('en');
  let fail;
  nextResponses.push(() => new Promise(resolve => { fail = resolve; }));
  await send('Explain what happened.', { preview: false });
  await act(async () => i18n.changeLanguage('pt'));
  await act(async () => fail(Response.json({ error: 'Temporarily unavailable' }, { status: 503 })));
  await until(() => completedReply('A resposta ficou incompleta.'));
  assert.equal(requests[0].lang, 'en');
  assert.equal(completedReply('A resposta ficou incompleta.').querySelector('.astra-label span').textContent, 'Pássaro-Pessoa');
  assert.equal(translationRequests.length, 0);
});

test('a Laboratory continuation retains its compact author and still needs review after moving to full Astra', async () => {
  await mount('pt', '/');
  nextResponses.push(() => Response.json({ actions: [
    { type: 'astra.openFull' }, { type: 'lab.example', target: 'cart' }, { type: 'lab.read', target: 'code' },
  ] }));
  const stream = await send('Abra a Astra completa e revise o Carrinho de Compras.');
  await until(() => $('.astra-full #chat-input'));
  assert.equal(requests.length, 2);
  assert.equal(requests[0].labSnapshot, undefined);
  assert.equal(requests[1].labSnapshot.example, 'cart');
  assert.equal(requests[1].surface, 'compact');
  assert.equal(requests[1].lang, 'pt');
  assert.deepEqual(requests[1].appearance, requests[0].appearance);
  assert.equal($('[data-streaming-reply] .astra-label span').textContent, 'Sr. Meeseeks');
  stream.push({ type: 'actions', actions: [{ type: 'lab.run' }] });
  stream.finish('LAB_FINAL');
  await until(() => completedReply('LAB_FINAL')?.querySelector('.lab-review'));
  const final = completedReply('LAB_FINAL');
  assert.equal(final.querySelector('.astra-label span').textContent, 'Sr. Meeseeks');
  assert.match(final.querySelector('.lab-review').textContent, /Revise o código antes de executar/);
});
