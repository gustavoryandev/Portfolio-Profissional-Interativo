import test from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { unlink } from 'node:fs/promises';

const output = new URL('./.navbar-accessibility.mjs', import.meta.url);

test('language controls expose a translated accessible group', async () => {
  try {
    await build({
      entryPoints: ['tests/navbar-accessibility.jsx'],
      outfile: fileURLToPath(output),
      bundle: true,
      platform: 'node',
      format: 'esm',
      packages: 'external',
      jsx: 'automatic',
      loader: { '.css': 'empty' },
      define: { 'import.meta.env': '{}' },
      logLevel: 'silent',
    });
    await import(output.href);
  } finally {
    await unlink(output).catch(() => {});
  }
});
