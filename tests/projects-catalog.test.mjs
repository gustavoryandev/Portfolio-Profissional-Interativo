import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFile, unlink } from 'node:fs/promises';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JSDOM } from 'jsdom';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';

test('catalog renders every project with bilingual content and individual project links', async () => {
  const output = new URL('./.projects-catalog.mjs', import.meta.url);
  try {
    await build({ entryPoints: ['src/components/ProjectsCard.jsx'], outfile: fileURLToPath(output), bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', logLevel: 'silent' });
    const { default: Projects } = await import(output.href);
    const profile = JSON.parse(await readFile(new URL('../src/data/perfil.json', import.meta.url), 'utf8'));
    assert.ok(profile.projetos.length > 4);
    assert.equal(new Set(profile.projetos.map(project => project.id)).size, profile.projetos.length);
    const resources = {};
    for (const lang of ['pt', 'en']) resources[lang] = { translation: JSON.parse(await readFile(new URL(`../src/i18n/${lang}.json`, import.meta.url), 'utf8')) };
    const i18n = createInstance();
    await i18n.init({ lng: 'pt', resources, initImmediate: false });
    for (const lang of ['pt', 'en']) {
      await i18n.changeLanguage(lang);
      const doc = new JSDOM(renderToStaticMarkup(React.createElement(I18nextProvider, { i18n }, React.createElement(Projects)))).window.document;
      const cards = [...doc.querySelectorAll('article')];
      assert.equal(cards.length, profile.projetos.length);
      for (const [index, project] of profile.projetos.entries()) {
        const card = cards[index];
        assert.equal(card.querySelector('h4').textContent, project.titulo[lang]);
        assert.ok(card.textContent.includes(project.descricao[lang]));
        const action = card.querySelector('a.project-action');
        assert.equal(action.getAttribute('href'), project.githubUrl || project.demoUrl);
        if (project.githubUrl) assert.match(project.githubUrl, /^https:\/\/github\.com\/[^/]+\/[^/]+$/);
      }
      assert.match(doc.querySelector('[role="status"]').textContent, new RegExp(`${cards.length}`));
      assert.doesNotMatch(doc.body.textContent, /projetos\.(kind|category|heading|subtitle)/);
      const preview = new JSDOM(renderToStaticMarkup(React.createElement(I18nextProvider, { i18n }, React.createElement(Projects, { preview: true, onViewAll() {} })))).window.document;
      assert.equal(preview.querySelectorAll('article').length, 5, 'chat preview is limited to five featured projects');
      assert.equal(preview.querySelector('input[type="search"]'), null);
      assert.match(preview.querySelector('button.project-action').textContent, lang === 'en' ? /View more projects/ : /Ver mais projetos/);
    }
  } finally { await unlink(output).catch(() => {}); }
});
