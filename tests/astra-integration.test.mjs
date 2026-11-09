import test from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { unlink } from 'node:fs/promises';

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
