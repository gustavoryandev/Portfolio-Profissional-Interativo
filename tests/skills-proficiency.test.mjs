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
import { proficiencyValue, proficiencyLevel } from '../src/data/skillProficiency.js';

test('proficiency cards preserve the declared values, levels and accessible bars', async () => {
  const output = new URL('./.skills-proficiency.mjs', import.meta.url);
  try {
    await build({ entryPoints: ['src/components/SkillsProficiencyCard.jsx'], outfile: fileURLToPath(output), bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', logLevel: 'silent' });
    const { default: Card } = await import(output.href);
    const i18n = createInstance();
    await i18n.init({ lng: 'pt', resources: { pt: { translation: {} }, en: { translation: {} } }, initImmediate: false });
    const profile = JSON.parse(await readFile(new URL('../src/data/perfil.json', import.meta.url), 'utf8'));
    for (const lang of ['pt', 'en']) {
      const html = renderToStaticMarkup(React.createElement(I18nextProvider, { i18n }, React.createElement(Card, { lang })));
      const doc = new JSDOM(html).window.document;
      assert.equal(doc.querySelectorAll('article').length, 20);
      const bars = [...doc.querySelectorAll('[role="progressbar"]')];
      assert.equal(bars.length, 20);
      for (const skill of profile.skills) {
        const bar = bars.find(bar => bar.getAttribute('aria-label').startsWith(`${skill.nome}:`));
        assert.equal(bar.getAttribute('aria-valuenow'), String(skill.proficienciaPercentual));
        assert.equal(bar.getAttribute('aria-valuetext'), `${skill.proficienciaPercentual}% · ${proficiencyLevel(skill.proficienciaPercentual, lang)}`);
      }
      assert.match(doc.body.textContent, lang === 'pt' ? /Autoavaliação de proficiência/ : /Proficiency self-assessment/);
      // Changing only the percentage must update both the badge and accessible label,
      // even if old data still carries a conflicting, manually assigned level.
      for (const [percent, pt, en] of [[30, 'Básico', 'Basic'], [60, 'Intermediário', 'Intermediate'], [80, 'Avançado', 'Advanced']]) {
        const changed = { nome: 'React', categoria: 'Frontend', nivel: 'Nível antigo', proficienciaPercentual: percent };
        const updated = new JSDOM(renderToStaticMarkup(React.createElement(I18nextProvider, { i18n }, React.createElement(Card, { lang, skills: [changed] })))).window.document;
        assert.match(updated.querySelector('article').textContent, new RegExp(lang === 'pt' ? pt : en));
        assert.equal(updated.querySelector('[role="progressbar"]').getAttribute('aria-valuetext'), `${percent}% · ${lang === 'pt' ? pt : en}`);
        assert.doesNotMatch(updated.body.textContent, /Nível antigo/);
      }
    }
    assert.equal(proficiencyValue({ proficienciaPercentual: 0 }), 0);
    for (const value of [null, undefined, '30', -1, 101, NaN]) assert.equal(proficiencyValue({ proficienciaPercentual: value }), null);
  } finally { await unlink(output).catch(() => {}); }
});

test('level boundaries and unavailable percentages', () => {
  for (const value of [0, 30, 49.9]) assert.equal(proficiencyLevel(value), 'Básico');
  for (const value of [50, 60, 79.9]) assert.equal(proficiencyLevel(value), 'Intermediário');
  for (const value of [80, 90, 100]) assert.equal(proficiencyLevel(value), 'Avançado');
  for (const value of [null, undefined, -1, 101, NaN, '60']) assert.equal(proficiencyLevel(value), 'Nível a definir');
});
