import test from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { unlink } from 'node:fs/promises';

test('the showcase releases at the last card and supports filters, keyboard and native scrolling', async () => {
  const output = new URL('./.projects-scroll.mjs', import.meta.url);
  try {
    await build({ entryPoints: ['tests/projects-scroll.jsx'], outfile: fileURLToPath(output), bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', logLevel: 'silent' });
    await import(output.href);
  } finally { await unlink(output).catch(() => {}); }
});
