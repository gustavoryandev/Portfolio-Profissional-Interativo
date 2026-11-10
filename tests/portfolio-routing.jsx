import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import App from '../src/App';
import ThemeWaves from '../src/components/ThemeWaves';
import { ThemeContext } from '../src/context/ThemeContext';
import perfil from '../src/data/perfil.json';

const environment = new JSDOM('', { url: 'http://localhost/' });
globalThis.window = environment.window;
globalThis.document = environment.window.document;
const { default: i18n } = await import('../src/i18n/index.js');
function render(path, theme = 'dark') {
  window.history.replaceState({}, '', path);
  return new JSDOM(renderToString(<ThemeContext.Provider value={{ theme, darkMode: theme !== 'galo-light' }}><ThemeWaves /><App /></ThemeContext.Provider>));
}
for (const lang of ['pt', 'en']) {
  await i18n.changeLanguage(lang);
  const page = render('/');
  const doc = page.window.document;
  assert.equal(doc.querySelectorAll('main').length, 1);
  assert.equal(doc.querySelectorAll('h1').length, 1);
  assert.equal(doc.querySelectorAll('[role="log"], #chat-input').length, 0);
  assert.ok(doc.querySelectorAll('a[href="/chat"]').length >= 2);
  assert.equal(doc.querySelectorAll('button.astra-fab[aria-haspopup="dialog"]').length, 1);
  assert.equal(doc.querySelectorAll('#habilidades [role="progressbar"]').length, 0);
  assert.ok(doc.querySelector('#habilidades .scroll-skills'));
  assert.equal(doc.querySelector('.nav-astra').hasAttribute('aria-haspopup'), false);
  for (const id of ['inicio', 'sobre', 'projetos', 'habilidades', 'experience', 'education', 'contato']) assert.ok(doc.getElementById(id));
  for (const anchor of doc.querySelectorAll('a[href^="#"]')) assert.ok(doc.getElementById(anchor.getAttribute('href').slice(1)));
  const ids = [...doc.querySelectorAll('[id]')].map(node => node.id);
  assert.equal(new Set(ids).size, ids.length, 'section and form IDs must be unique');
  assert.equal(doc.querySelectorAll('.project-tile').length, perfil.projetos.length);
  page.window.close();
}

for (const theme of ['galo', 'galo-light']) {
  const page = render('/', theme);
  const doc = page.window.document;
  assert.equal(doc.querySelector('.site-header .galo-brand-badge img').getAttribute('src'), '/galo-logo.png');
  assert.equal(doc.querySelector('.portfolio-hero .hero-galo-watermark').getAttribute('src'), '/galo-logo.png');
  assert.equal(doc.querySelector('.hero-actions .neon-cta').getAttribute('href'), '/chat');
  assert.equal(doc.querySelector('.hero-actions .scroll-secondary').getAttribute('href'), '#projetos');
  assert.ok(doc.querySelector('svg.theme-waves.galo-waves'));
  page.window.close();
}
// Flags left by previous visits must not skip the intro on a fresh load.
window.localStorage.setItem('astra-visited', '1');
window.localStorage.setItem('astra-intro-seen', '1');
window.sessionStorage.setItem('astra-intro-seen', '1');
const firstChat = render('/chat');
assert.ok(firstChat.window.document.querySelector('.astra-shell-full[inert]'));
assert.ok(firstChat.window.document.querySelector('.astra-entrance'));
assert.equal(firstChat.window.document.querySelector('.scroll-portfolio'), null);
firstChat.window.close();

const unknown = render('/missing');
assert.equal(unknown.window.document.querySelector('h1').textContent, '404');
assert.equal(unknown.window.document.querySelector('a').getAttribute('href'), '/');
unknown.window.close();
environment.window.close();
