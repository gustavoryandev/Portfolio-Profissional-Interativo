import assert from 'node:assert/strict';
import { readFile, unlink } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { assistantAppearance, assistantPersonaPresentation } from '../src/data/assistantPersonas.js';
import { HEIST_DARK, HEIST_LIGHT } from '../src/data/heistThemes.js';
import { themes } from '../src/data/themes.js';
import { validateActions } from '../src/services/portfolioActions.js';
import { assistantPersonaInstruction, isCharacterIntroduction, resolveAssistantPersona } from '../server/assistantPersona.js';

test('O Assalto uses the existing theme slot and migrates directly before React', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.equal(themes.length, 15);
  assert.ok(themes.some(theme => theme.id === HEIST_DARK && !theme.light));
  assert.ok(themes.some(theme => theme.id === 'quartzo-framboesa' && theme.light));
  assert.ok(!themes.some(theme => theme.id === HEIST_LIGHT));
  for (const saved of ['midnight-pink', 'obsidian-gold', 'grafite-coral', HEIST_DARK]) {
    const dom = new JSDOM(html, { url: 'https://portfolio.test/chat', runScripts: 'dangerously', beforeParse(window) {
      window.localStorage.setItem('theme', saved);
      window.localStorage.setItem('rick-morty-dimension', 'beyond-curve');
      window.localStorage.setItem('rick-morty-beyond-unlocked', '1');
    } });
    try {
      const root = dom.window.document.documentElement;
      assert.equal(root.dataset.theme, HEIST_DARK, saved);
      assert.equal(root.dataset.dimension, undefined, saved);
      assert.ok(root.classList.contains('dark') && root.hasAttribute('data-custom-theme'), saved);
    } finally { dom.window.close(); }
    assert.deepEqual(validateActions([{ type: 'theme.set', target: saved }], new Set()), [{ type: 'theme.set', target: HEIST_DARK }]);
  }
  assert.deepEqual(validateActions([{ type: 'theme.set', target: HEIST_LIGHT }], new Set()), []);
});

test('Astra gives each Heist surface its own bilingual identity and keeps Rick dimensions separate', () => {
  const appearance = assistantAppearance(HEIST_DARK, 'beyond-curve');
  assert.deepEqual(appearance, { theme: HEIST_DARK });
  const compact = resolveAssistantPersona({ ...appearance, id: 'professor', manner: 'injected' }, 'compact');
  const full = resolveAssistantPersona(appearance, 'full');
  assert.deepEqual([compact.id, compact.pt, compact.en], ['berlin', 'Berlim', 'Berlin']);
  assert.deepEqual([full.id, full.pt, full.en], ['professor', 'Professor', 'The Professor']);
  assert.match(assistantPersonaPresentation(compact.id).image, /avatar-berlin\.webp$/);
  assert.match(assistantPersonaPresentation(full.id).image, /avatar-professor\.webp$/);
  assert.equal(isCharacterIntroduction('Quem é Berlim?', compact), true);
  assert.equal(isCharacterIntroduction('Who is the Professor?', full), true);
  assert.equal(isCharacterIntroduction('Who is Berlin?', full), false);
  assert.match(assistantPersonaInstruction(compact, 'pt'), /Money Heist.*\nYour displayed name for THIS turn is Berlim/);
  assert.doesNotMatch(assistantPersonaInstruction(compact, 'en'), /injected/);
  assert.equal(resolveAssistantPersona({ theme: HEIST_DARK, dimension: 'beyond-curve' }, 'full'), null);
  assert.equal(resolveAssistantPersona({ theme: HEIST_LIGHT }, 'compact'), null);
  assert.equal(resolveAssistantPersona(appearance, 'unknown'), null);
  assert.equal(resolveAssistantPersona({ theme: 'rick-morty', dimension: 'beyond-curve' }, 'full').id, 'evil-morty');
});

test('PhotoReveal handles touch, a dissipating trail, alternative controls and media failures', async () => {
  const output = new URL('./.heist-photo-reveal.mjs', import.meta.url);
  try {
    await build({ entryPoints: ['tests/heist-photo-reveal.jsx'], outfile: fileURLToPath(output), bundle: true,
      platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', logLevel: 'silent' });
    const { verifyPhotoReveal } = await import(output.href);
    await verifyPhotoReveal();
  } finally { await unlink(output).catch(() => {}); }
});
