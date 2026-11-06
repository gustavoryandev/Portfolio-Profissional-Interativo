import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import MessageBubble from '../src/components/MessageBubble.jsx';
import GithubCard from '../src/components/GithubCard.jsx';
import StatsCard from '../src/components/StatsCard.jsx';
import App from '../src/pages/ChatPage.jsx';
import GaloCard from '../src/components/GaloCard.jsx';
import SpotifyCard from '../src/components/SpotifyCard.jsx';
import ChessCard from '../src/components/ChessCard.jsx';
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
axios.defaults.adapter = async config => {
  submitted.push(JSON.parse(config.data));
  return { config, status: 200, data: { response: 'Test reply.', model: 'test-model' } };
};
await render(true, <App />);
assert.equal(document.querySelectorAll('main').length, 1);
assert.equal(document.querySelector('[role="log"]').tagName, 'DIV');
assert.equal(document.querySelectorAll('.astra-starter').length, 6);
assert.equal(document.querySelector('.astra-hero-wrap').hasAttribute('inert'), false);
await act(async () => document.querySelector('.astra-starter').click());
assert.equal(submitted.length, 1);
assert.equal(submitted[0].predefinedSuggestion, true);
assert.equal(document.querySelector('.astra-hero-wrap').hasAttribute('inert'), true);
assert.match(document.querySelector('.astra-label .dim-tag').textContent, /test-model/);
assert.equal(document.querySelectorAll('.chat-composer button[type="button"]').length, 6);
await act(async () => document.querySelector('.nav-items button:nth-child(2)').click());
await act(async () => document.querySelector('.astra-fab').click());
assert.equal(document.activeElement.id, 'chat-input');
await act(async () => document.querySelector('.sidebar-note').click());
assert.equal(document.activeElement.id, 'chat-input');

await act(async () => root.unmount());
dom.window.close();
console.log('UI checks passed: translations, deduplication, code, links, card identity, light/dark, unavailable breakdowns.');
