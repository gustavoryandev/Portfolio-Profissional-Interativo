import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../public/python-playground.worker.js', import.meta.url), 'utf8');

test('Python worker forwards code, caps output and releases Python results', async () => {
  const messages = [];
  let received;
  let destroyed = false;
  const self = {
    postMessage: message => messages.push(message),
    loadPyodide: async options => ({
      runPythonAsync: async code => {
        received = code;
        options.stdout('x'.repeat(20000));
        options.stdout('more');
        return { destroy() { destroyed = true; } };
      },
    }),
  };
  vm.runInNewContext(source, { self, importScripts() {} });
  await self.onmessage({ data: { code: 'print(42)' } });
  assert.equal(received, 'print(42)');
  assert.equal(messages[0].type, 'ready');
  assert.equal(messages[1].type, 'done');
  assert.equal(messages[1].output.length, 12000);
  assert.equal(destroyed, true);
});

test('Python worker reports runtime download failures', async () => {
  const messages = [];
  const self = { postMessage: message => messages.push(message) };
  vm.runInNewContext(source, { self, importScripts() { throw new Error('offline'); } });
  await self.onmessage({ data: { code: 'print(42)' } });
  assert.equal(messages[0].type, 'error');
  assert.equal(messages[0].error, 'offline');
});
