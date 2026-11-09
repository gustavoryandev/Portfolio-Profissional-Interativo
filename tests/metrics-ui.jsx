import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import MessageBubble from '../src/components/MessageBubble.jsx';
import GithubCard from '../src/components/GithubCard.jsx';
import StatsCard from '../src/components/StatsCard.jsx';
import App from '../src/pages/ChatPage.jsx';
import AstraEntrance from '../src/components/AstraEntrance.jsx';
import PortfolioIntro from '../src/components/PortfolioIntro.jsx';
import GaloCard from '../src/components/GaloCard.jsx';
import SpotifyCard from '../src/components/SpotifyCard.jsx';
import ChessCard, { ChessGame } from '../src/components/ChessCard.jsx';
import WakaTimeCard from '../src/components/WakaTimeCard.jsx';
import CanvasCard from '../src/components/CanvasCard.jsx';
import ExperienceCard from '../src/components/ExperienceCard.jsx';
import GithubLanguagesCard from '../src/components/GithubLanguagesCard.jsx';
import RepositoriesCard from '../src/components/RepositoriesCards.jsx';
import GithubActivityCard from '../src/components/GithubActivityCard.jsx';
import { ThemeContext } from '../src/context/ThemeContext.jsx';

const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.requestAnimationFrame = callback => setTimeout(callback, 0);
globalThis.cancelAnimationFrame = clearTimeout;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { default: i18n } = await import('../src/i18n/index.js');
const root = createRoot(document.getElementById('root'));
let requests = 0;
let complete;
axios.defaults.adapter = config => {
  requests++;
  return new Promise(resolve => { complete = () => resolve({ config, status: 200, data: { text: 'Translated **response**.\n```js\nconst x = 1;\n```\n[Link](https://example.com)\n[GITHUB_CARD]' } }); });
};
const context = { github: { status: 'ok', profile: { login: 'fixture' }, stats: {} }, wakatime: {status:'ok',summary:{totalFormatted:'0h 0m',activeDays:0,totalDays:0},languages:[]} };
const message = { id: 'dynamic', sender: 'ai', lang: 'pt', text: 'Resposta **dinâmica**.\n```js\nconst x = 1;\n```\n[Link](https://example.com)\n[GITHUB_CARD]' };
const render = (dark, child) => act(async () => root.render(<ThemeContext.Provider value={{ darkMode: dark }}>{child}</ThemeContext.Provider>));
await render(false, <MessageBubble message={message} liveContext={context} />);
assert.match(document.body.textContent, /Resposta/);
const card = document.querySelector('article');
assert.equal(card.closest('.chat-bubble'), null);
assert.ok(card.closest('.message-card'));
assert.equal(document.querySelector('.astra-label > span').textContent, 'Astra');
await act(async () => { await i18n.changeLanguage('en'); });
assert.equal(requests, 1);
assert.match(document.body.textContent, /Resposta/); // Keep readable original while waiting.
assert.equal(document.querySelector('article'), card);
await act(async () => { await i18n.changeLanguage('pt'); await i18n.changeLanguage('en'); });
assert.equal(requests, 1);
await act(async () => { complete(); });
assert.match(document.body.textContent, /Translated response/);
assert.equal(document.querySelector('pre code').textContent, 'const x = 1;');
assert.equal(document.querySelector('a[href="https://example.com"]').textContent, 'Link');
assert.equal(document.querySelector('article'), card);
await act(async () => { await i18n.changeLanguage('pt'); });
assert.match(document.body.textContent, /Resposta/);
await act(async () => { await i18n.changeLanguage('en'); });
assert.equal(requests, 1);
await render(true, <MessageBubble message={{...message,id:'future'}} liveContext={context} />);
assert.match(document.body.textContent, /Translated/);
assert.equal(requests, 1);
for (const dark of [false,true]) {
  await render(dark, <GithubCard context={context} />);
  assert.equal(document.querySelectorAll('.github-metrics-grid > div').length, 11);
  assert.ok(document.querySelector('article').classList.contains('portfolio-card'));
  await render(dark, <StatsCard context={context} />);
  assert.match(document.body.textContent, /All available history/);
  assert.match(document.body.textContent, /0h 0m/);
}

// The rewritten shells must render both unavailable and populated integration data.
for (const Component of [WakaTimeCard, CanvasCard, SpotifyCard, ChessCard, ExperienceCard, GithubLanguagesCard, RepositoriesCard, GithubActivityCard]) {
  await render(false, <Component context={{}} />);
  assert.ok(document.querySelector('.portfolio-card'));
}
const game = { id: 'test', date: '2035-01-01T20:00:00Z', state: 'pre', league: 'Brazilian Serie A',
  home: { name: 'Atlético', logo: '/icons/git.svg' }, away: { name: 'Visitante', logo: '/icons/react.svg' } };
await render(true, <GaloCard context={{ galo: { games: [game] } }} />);
assert.ok(Number(document.querySelector('.count-box strong').textContent) > 0);
await render(true, <GaloCard context={{ galo: { games: [{ ...game, date: 'invalid' }] } }} />);
assert.ok(!document.body.textContent.includes('NaN'));
assert.match(document.body.textContent, /A definir/);
await render(true, <GithubCard context={{ github: { status: 'ok', stats: { currentStreak: 0 } } }} />);
assert.ok(!document.body.textContent.includes('active today'));
assert.match(document.body.textContent, /consecutive days/);

// Exercise the actual chat entry point with a mocked API, including its focus shortcut.
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
window.HTMLElement.prototype.scrollTo = () => {};
window.HTMLElement.prototype.attachEvent = () => {};
window.HTMLElement.prototype.detachEvent = () => {};
const submitted = [];
globalThis.fetch = async (_url, options) => {
  const body = JSON.parse(options.body);
  if (body.action === 'models') return Response.json({ models: ['test-model'] });
  submitted.push(body);
  return Response.json({ response: 'Test reply.', model: 'test-model' });
};
await render(true, <App />);
assert.equal(document.querySelector('[role="log"]').tagName, 'DIV');
assert.equal(document.querySelectorAll('.astra-starter').length, 6);
assert.equal(document.querySelectorAll('.message-card').length, 0);
assert.equal(document.querySelector('.astra-details'), null);
await act(async () => document.querySelector('.astra-starter, .chat-composer button[type="button"]').click());
assert.equal(submitted.length, 1);
assert.equal(submitted[0].predefinedSuggestion, true);
assert.equal(submitted[0].stream, true);
assert.match(document.querySelector('.astra-label .dim-tag').textContent, /test-model/);

// The pending stream must display the user message before any token arrives.
let streamController;
let streamRequests = 0;
globalThis.fetch = async (_url, options) => new Response(new ReadableStream({
  start(controller) {
    streamRequests++;
    streamController = controller;
    options.signal.addEventListener('abort', () => controller.error(new DOMException('Stopped', 'AbortError')), { once: true });
  },
}), { headers: { 'Content-Type': 'application/x-ndjson' } });
const previousMessages = document.querySelectorAll('.chat-msg-in').length;
const firstBubble = document.querySelector('.chat-msg-in');
await act(async () => document.querySelector('.chat-composer button[type="button"]').click());
assert.equal(document.querySelectorAll('.chat-msg-in').length, previousMessages + 1);
assert.ok(document.querySelector('[aria-label="Stop response"]'));
await act(async () => {
  streamController.enqueue(new TextEncoder().encode('{"type":"meta","model":"stream-model"}\n{"type":"delta","text":"Incremental response"}\n'));
  await new Promise(resolve => setTimeout(resolve, 70));
});
assert.match(document.querySelector('[data-streaming-reply]').textContent, /Incremental response/);
assert.equal(document.querySelector('.chat-msg-in'), firstBubble);
// Switching presentation or closing the modal must preserve the active stream and history.
const countBeforeSwitch = document.querySelectorAll('.chat-msg-in').length;
await render(true, <App modal visible={false} />);
assert.equal(document.querySelectorAll('.chat-msg-in').length, countBeforeSwitch);
await render(true, <App modal visible />);
assert.equal(document.querySelector('.chat-msg-in'), firstBubble);
await render(true, <App />);
assert.match(document.querySelector('[data-streaming-reply]').textContent, /Incremental response/);
assert.equal(document.querySelectorAll('.chat-msg-in').length, countBeforeSwitch);
assert.equal(streamRequests, 1, 'mode changes must not resend the active request');

await act(async () => document.querySelector('[aria-label="Stop response"]').click());
assert.equal(document.querySelector('[data-streaming-reply]'), null);
assert.match(document.body.textContent, /Incremental response/);
assert.match(document.body.textContent, /Response stopped/);
assert.equal(document.querySelector('button[type="submit"]').disabled, true); // empty input, no stuck loading state

// Restarting before the opening move must start a fresh search even if black is drawn again.
const originalRandom = Math.random;
const originalWorker = globalThis.Worker;
const originalRect = window.HTMLElement.prototype.getBoundingClientRect;
window.HTMLElement.prototype.getBoundingClientRect = function () {
  // JSDOM has no layout, but the board needs a square width to animate the opening move.
  return this.hasAttribute('data-square') ? new window.DOMRect(0, 0, 60, 60) : originalRect.call(this);
};
const workers = [];
globalThis.Worker = class {
  constructor() { workers.push(this); }
  postMessage() {}
  terminate() { this.terminated = true; }
  emit(data) { this.onmessage?.({ data }); }
};
const restartChess = () => act(async () => {
  [...document.querySelectorAll('button')].find(button => button.textContent === 'Restart game').click();
});
try {
  Math.random = () => 0.75;
  await render(true, <ChessGame />);
  assert.match(document.body.textContent, /You play black/);
  assert.equal(document.querySelector('[data-square]').dataset.square, 'h1');
  assert.match(document.querySelector('[role="status"]').textContent, /Astra is thinking/);
  assert.equal(workers.length, 1);
  await restartChess();
  assert.equal(workers[0].terminated, true);
  assert.equal(workers.length, 2);
  await act(async () => {
    workers[1].emit('uciok');
    workers[1].emit('readyok');
    workers[1].emit('bestmove e2e4');
  });
  assert.equal(document.querySelector('[role="status"]').textContent, 'Your turn');
  Math.random = () => 0.25;
  await restartChess();
  assert.match(document.body.textContent, /You play white/);
  assert.equal(document.querySelector('[data-square]').dataset.square, 'a8');
  assert.equal(workers.length, 2);
} finally {
  Math.random = originalRandom;
  globalThis.Worker = originalWorker;
  window.HTMLElement.prototype.getBoundingClientRect = originalRect;
}

await render(true, <PortfolioIntro en><p>Portfolio ready</p></PortfolioIntro>);
assert.equal(document.querySelector('.portfolio-opening'), null);
assert.match(document.body.textContent, /Portfolio ready/);

// The full entrance starts immediately and can still be dismissed.
let finished = false;
await render(true, <AstraEntrance en onFinish={() => { finished = true; }} />);
assert.ok(document.querySelector('.astra-entrance'));
assert.equal(window.localStorage.getItem('astra-intro-seen'), '1');
assert.equal(finished, false);
await act(async () => document.querySelector('.astra-entrance-bottom button').click());
assert.equal(finished, true);
await act(async () => root.unmount());
dom.window.close();
console.log('UI checks passed: translations, deduplication, code, links, card identity, light/dark, unavailable breakdowns.');
