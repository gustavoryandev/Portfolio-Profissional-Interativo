import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/chat', pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
Object.assign(globalThis, { window, document, HTMLElement: window.HTMLElement, MutationObserver: window.MutationObserver,
  requestAnimationFrame: window.requestAnimationFrame.bind(window), cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  IS_REACT_ACT_ENVIRONMENT: true });
window.localStorage.setItem('astra-intro-seen', '1'); // Left by a previous visit.
window.matchMedia = query => ({ matches: query.includes('prefers-reduced-motion') || query.includes('pointer: coarse'),
  addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
window.scrollTo = () => {};
window.HTMLElement.prototype.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLDialogElement.prototype.showModal = window.HTMLDialogElement.prototype.show = function () { this.open = true; };
window.HTMLDialogElement.prototype.close = function () { this.open = false; };
globalThis.ResizeObserver = globalThis.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };

const requests = [];
const workers = [];
globalThis.Worker = class {
  constructor(url) { this.url = url; workers.push(this); }
  postMessage({ code }) { this.code = code; }
  terminate() {}
};
globalThis.fetch = async (_url, options) => {
  const body = JSON.parse(options.body);
  if (body.action === 'models') return Response.json({ models: ['fixture'] });
  requests.push(body);
  if (body.labSnapshot) return Response.json({ actions: [
    { type: 'lab.edit', edits: [{ find: 'aluno = "Carlos"', replace: 'aluno = "Ana"' }] },
  ] });
  if (body.surface === 'full') return Response.json({ actions: [
    { type: 'navigate', target: 'laboratorio' }, { type: 'lab.language', target: 'python' },
    { type: 'lab.example', target: 'bro-fit' }, { type: 'lab.read', target: 'code' },
  ] });
  return Response.json({ actions: [{ type: 'lab.run' }] });
};

const { createRoot } = await import('react-dom/client');
const { default: App } = await import('../src/App');
const { ThemeProvider } = await import('../src/context/ThemeContext');
const { default: i18n } = await import('../src/i18n/index');
await i18n.changeLanguage('en');
const root = createRoot(document.getElementById('root'));
let activeRoot = root;
const $ = selector => document.querySelector(selector);
const click = node => act(async () => node.click());
const findButton = (parent, label) => [...parent.querySelectorAll('button')].find(button => button.textContent.trim() === label);
async function until(predicate) {
  for (let i = 0; i < 30 && !predicate(); i++) await act(async () => { await new Promise(resolve => setTimeout(resolve, 12)); });
  assert.ok(predicate(), 'expected the UI to reach the requested state');
}
async function send(text) {
  const input = $('#chat-input');
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, text);
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
  });
  assert.equal(input.value, text);
  const button = $('.chat-form button[type="submit"]');
  assert.equal(button.disabled, false);
  await click(button);
}
try {
  await act(async () => root.render(<ThemeProvider><App /></ThemeProvider>));
  assert.ok($('.astra-entrance'), 'direct entry shows the intro in a fresh tab session');
  assert.equal(window.sessionStorage.getItem('astra-intro-seen'), null);
  await click($('.astra-entrance a[href="/"]'));
  await until(() => $('.astra-fab'));
  await click($('.astra-fab'));
  await until(() => $('.astra-compact #chat-input'));
  assert.equal($('.astra-entrance'), null, 'opening compact Astra does not consume the intro');
  await click($('.astra-toolbar a[href="/chat"]'));
  assert.ok($('.astra-entrance'), 'first Full Astra opening from compact plays the intro');
  await click($('.astra-entrance button'));
  assert.equal(window.sessionStorage.getItem('astra-intro-seen'), '1');
  assert.equal($('.astra-entrance'), null);
  // Fresh direct entry: the editor has never mounted, but the intro is already seen in this tab.
  await act(async () => root.unmount());
  const directRoot = createRoot(document.getElementById('root'));
  activeRoot = directRoot;
  await act(async () => directRoot.render(<ThemeProvider><App /></ThemeProvider>));
  await until(() => $('.astra-full #chat-input'));
  assert.equal($('#laboratorio'), null, 'direct entry to Full Astra has no mounted Laboratory');
  await send('/help');
  assert.ok($('#astra-resources[open]'));
  assert.ok($('#astra-resource-labAnalyze'));
  assert.ok($('#astra-resource-chessGame'), 'full Astra keeps its existing integrations');
  assert.equal(requests.length, 0, '/help stays local');
  await click($('#astra-resource-theme').closest('button'));
  assert.equal(document.documentElement.dataset.theme, 'aurora');
  assert.equal($('#astra-resources').open, false);
  assert.equal(requests.length, 0, 'a fixed shortcut does not require the model');
  await send('Open the Laboratory, select Python, load Bro Fit and rename the student to Ana.');
  await until(() => $('#laboratorio .lab-review'));
  assert.equal(window.location.hash, '#laboratorio');
  assert.match($('#playground-code').value, /aluno = "Carlos"/);
  assert.equal(requests[0].labSnapshot, undefined);
  assert.match(requests[1].labSnapshot.code, /aluno = "Carlos"/);
  await click(findButton($('#laboratorio .lab-review'), 'Apply changes'));
  assert.match($('#playground-code').value, /aluno = "Ana"/);
  assert.equal(workers.length, 0);
  await click($('.astra-fab'));
  await until(() => $('.astra-compact #chat-input'));
  const beforeHelp = requests.length;
  await send('/HELP');
  assert.ok($('.astra-compact #astra-resources[open]'));
  assert.ok($('#astra-resource-metrics'));
  assert.equal($('#astra-resource-chessGame'), null);
  await click($('#astra-resource-labRun').closest('button'));
  await until(() => $('.astra-compact .lab-review'));
  assert.equal(requests.length, beforeHelp);
  assert.equal(workers.length, 0, 'the run shortcut still requires approval');
  await click(findButton($('.astra-compact .lab-review'), 'Run code'));
  assert.equal(workers.length, 1);
  assert.match(workers[0].code, /aluno = "Ana"/);
  await click($('.astra-toolbar a[href="/chat"]'));
  await until(() => $('.astra-full #chat-input'));
  assert.equal($('.astra-entrance'), null, 'returning to Full Astra in the same tab skips the intro');
  await act(async () => workers[0].onmessage({ data: { type: 'done', output: 'BRO FIT | Ficha de Ana' } }));
  assert.match($('.astra-full [role="log"]').textContent, /rename the student to Ana/);
  assert.ok($('.astra-full .astra-resources-trigger'));
  await click(findButton($('.astra-full'), 'Open Laboratory'));
  await until(() => window.location.hash === '#laboratorio');
  assert.match($('#playground-code').value, /aluno = "Ana"/);
  assert.match($('.code-lab-output pre').textContent, /Ficha de Ana/);
} finally {
  await act(async () => activeRoot.unmount());
  dom.window.close();
}
