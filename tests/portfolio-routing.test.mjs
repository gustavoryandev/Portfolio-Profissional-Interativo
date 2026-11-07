import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { unlink } from 'node:fs/promises';

test('scroll portfolio, section anchors and separate chat route', async () => {
  const output = new URL('./.portfolio-routing.mjs', import.meta.url);
  const stylesheet = new URL('./.portfolio-routing.css', import.meta.url);
  try {
    await build({ entryPoints: ['tests/portfolio-routing.jsx'], outfile: fileURLToPath(output), bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', define: { 'import.meta.env': '{}' }, logLevel: 'silent', plugins: [{ name: 'unused-pdf', setup(build) {
      build.onResolve({ filter: /ResumeCard$/ }, () => ({ path: 'resume', namespace: 'stub' }));
      build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default () => null' }));
    } }] });
    await import(output.href);
    assert.ok(true);
  } finally {
    await Promise.all([output, stylesheet].map(file => unlink(file).catch(() => {})));
  }
});
