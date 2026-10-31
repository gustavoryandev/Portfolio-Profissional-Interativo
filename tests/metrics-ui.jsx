import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import MessageBubble from '../src/components/MessageBubble.jsx';
import GithubCard from '../src/components/GithubCard.jsx';
import StatsCard from '../src/components/StatsCard.jsx';
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
  return new Promise(resolve => { complete = () => resolve({ config, status: 200, data: { text: 'Translated **response**.\n```js\nconst x = 1;\n```\n[Link](https://example.com)\n[GITHUB_CARD]\n[WAKATIME_CARD]' } }); });
};
const context = { github: { status: 'ok', profile: { login: 'fixture' }, stats: {} }, wakatime: {status:'ok',summary:{totalFormatted:'0h 0m',activeDays:0,totalDays:0},languages:[]} };
const message = { id: 'dynamic', sender: 'ai', lang: 'pt', text: 'Resposta **dinâmica**.\n```js\nconst x = 1;\n```\n[Link](https://example.com)\n[GITHUB_CARD]\n[WAKATIME_CARD]' };
const render = (dark, child) => act(async () => root.render(<ThemeContext.Provider value={{ darkMode: dark }}>{child}</ThemeContext.Provider>));
await render(false, <MessageBubble message={message} liveContext={context} />);
assert.match(document.body.textContent, /Resposta/);
const card = document.querySelector('article');
await act(async () => { await i18n.changeLanguage('en'); });
assert.equal(requests, 1);
assert.match(document.body.textContent, /Resposta/); // Keep readable original while waiting.
assert.equal(document.querySelector('article'), card);
assert.equal(document.body.textContent.includes('[WAKATIME_CARD]'), false);
await act(async () => { await i18n.changeLanguage('pt'); await i18n.changeLanguage('en'); });
assert.equal(requests, 1);
await act(async () => { complete(); });
assert.match(document.body.textContent, /Translated response/);
assert.equal(document.querySelector('pre code').textContent, 'const x = 1;');
assert.equal(document.querySelector('a[href="https://example.com"]').textContent, 'Link');
assert.equal(document.querySelector('article'), card);
assert.equal(document.body.textContent.includes('[WAKATIME_CARD]'), false);
await act(async () => { await i18n.changeLanguage('pt'); });
assert.match(document.body.textContent, /Resposta/);
await act(async () => { await i18n.changeLanguage('en'); });
assert.equal(requests, 1);
await render(true, <MessageBubble message={{...message,id:'future'}} liveContext={context} />);
assert.match(document.body.textContent, /Translated/);
assert.equal(requests, 1);
for (const dark of [false,true]) {
  await render(dark, <GithubCard context={context} />);
  assert.equal(document.querySelectorAll('.github-metrics-grid > div').length, 12);
  assert.ok(document.querySelector('article')); 
  await render(dark, <StatsCard context={context} />);
  assert.match(document.body.textContent, /All available history/);
  assert.match(document.body.textContent, /0h 0m/);
}
await act(async () => root.unmount());
dom.window.close();
console.log('UI checks passed: translations, deduplication, code, links, card identity, light/dark, unavailable breakdowns.');
