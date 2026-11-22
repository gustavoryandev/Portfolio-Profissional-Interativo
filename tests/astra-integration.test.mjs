import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFile, unlink } from 'node:fs/promises';
import { JSDOM } from 'jsdom';
import { legacyThemeIds, themes, themePalettes } from '../src/data/themes.js';

test('The first paint honors current and legacy saved themes', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const cases = [
    ...themePalettes.map(theme => [theme.id, theme]),
    ...Object.entries(legacyThemeIds).map(([oldId, newId]) => [oldId, themes.find(theme => theme.id === newId)]),
    ['unknown-theme', themes.find(theme => theme.id === 'dark')],
  ];
  for (const [saved, expected] of cases) {
    const { window } = new JSDOM(html, {
      url: 'https://portfolio.test/chat',
      runScripts: 'dangerously',
      beforeParse({ localStorage }) { localStorage.setItem('theme', saved); },
    });
    try {
      const root = window.document.documentElement;
      assert.equal(root.dataset.theme, expected.id, saved);
      assert.equal(root.classList.contains('dark'), !expected.light, saved);
      assert.equal(root.hasAttribute('data-custom-theme'), Boolean(expected.name), saved);
    } finally {
      window.close();
    }
  }
});

test('Full and Compact Astra use the same live Laboratory and review', async () => {
  const output = new URL('./.astra-integration.mjs', import.meta.url);
  const stylesheet = new URL('./.astra-integration.css', import.meta.url);
  try {
    await build({ entryPoints: ['tests/astra-integration.jsx'], outfile: fileURLToPath(output), bundle: true,
      platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', define: { 'import.meta.env': '{}' }, logLevel: 'silent',
      plugins: [{ name: 'unused-pdf', setup(build) {
        build.onResolve({ filter: /ResumeCard$/ }, () => ({ path: 'resume', namespace: 'stub' }));
        build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default () => null' }));
      } }],
    });
    await import(output.href);
  } finally {
    await Promise.all([output, stylesheet].map(file => unlink(file).catch(() => {})));
  }
});


test('First paint restores dimensions separately and migrates the former secret palette', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const [theme, savedDimension, expected] of [
    ['rick-morty', 'lab', 'lab'], ['rick-morty', 'corrupted', 'corrupted'],
    ['rick-morty-secret', null, 'corrupted'], ['rick-morty', 'invalid', 'lab'],
    ['dark', 'corrupted', undefined],
  ]) {
    const dom = new JSDOM(html, { url: 'https://portfolio.test', runScripts: 'dangerously',
      beforeParse({ localStorage }) {
        localStorage.setItem('theme', theme);
        if (savedDimension) localStorage.setItem('rick-morty-dimension', savedDimension);
      },
    });
    assert.equal(dom.window.document.documentElement.dataset.dimension, expected);
    assert.equal(dom.window.document.documentElement.dataset.theme, theme === 'rick-morty-secret' ? 'rick-morty' : theme);
    dom.window.close();
  }
});
