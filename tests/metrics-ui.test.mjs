import test from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { unlink } from 'node:fs/promises';
const output = new URL('./.metrics-ui.mjs', import.meta.url);
test('metrics cards and translation toggles', async () => {
  try {
    await build({ entryPoints: ['tests/metrics-ui.jsx'], outfile: fileURLToPath(output), bundle: true, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', define: { 'import.meta.env': '{}' }, logLevel: 'silent', plugins: [{ name: 'unused-resume', setup(build) { build.onResolve({ filter: /ResumeCard$/ }, () => ({ path: 'resume', namespace: 'stub' })); build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export default () => null' })); } }] });
    await import(output.href);
  } finally { await unlink(output).catch(() => {}); }
});

