import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { I18nextProvider } from 'react-i18next';
import { JSDOM } from 'jsdom';
import { HeaderActions } from '../src/components/Navbar.jsx';
import { ThemeContext } from '../src/context/ThemeContext.jsx';

const dom = new JSDOM('<!doctype html><html lang="pt-BR"><body></body></html>', { url: 'http://localhost' });
globalThis.window = dom.window;
globalThis.document = dom.window.document;

const { default: i18n } = await import('../src/i18n/index.js');
const theme = {
  theme: 'dark',
  darkMode: true,
  setTheme() {},
  anthemPlaying: false,
  toggleAnthem() {},
};

for (const [language, expectedLabel, expectedSelected] of [
  ['pt', 'Idioma', 'PT'],
  ['en', 'Language', 'EN'],
]) {
  await i18n.changeLanguage(language);
  const markup = renderToStaticMarkup(
    <I18nextProvider i18n={i18n}>
      <ThemeContext.Provider value={theme}>
        <HeaderActions />
      </ThemeContext.Provider>
    </I18nextProvider>,
  );
  const document = new JSDOM(markup).window.document;
  const group = document.querySelector('.language-switch');
  assert.equal(group.getAttribute('role'), 'group');
  assert.equal(group.getAttribute('aria-label'), expectedLabel);
  assert.deepEqual([...group.querySelectorAll('button')].map(button => button.textContent), ['PT', 'EN']);
  assert.equal([...group.querySelectorAll('button')].find(button => button.getAttribute('aria-pressed') === 'true')?.textContent, expectedSelected);
}

dom.window.close();
