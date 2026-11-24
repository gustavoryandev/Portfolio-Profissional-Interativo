import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createContactCaptcha } from '../src/services/contactCaptcha.js';

const payload = { name: 'Visitante', email: 'visitor@example.com', subject: 'Contato profissional', message: 'Gostaria de conversar sobre um projeto.' };

async function fixture(t, { siteKey = 'test-site-key', sendError } = {}) {
  const sends = [], storage = new Map();
  const previous = Object.getOwnPropertyDescriptors(globalThis);
  for (const [key, value] of Object.entries({
    navigator: { onLine: true },
    localStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    fetch: async (_, options) => { const data = JSON.parse(options.body); sends.push([null, data.kind, data]); if (sendError) throw sendError; return { ok: true }; },
  })) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  t.after(() => {
    for (const key of ['navigator', 'localStorage', 'fetch']) {
      if (previous[key]) Object.defineProperty(globalThis, key, previous[key]);
      else delete globalThis[key];
    }
  });
  const result = await build({
    entryPoints: ['src/services/contact.js'], bundle: true, write: false, format: 'esm', platform: 'node',
    define: { 'import.meta.env': JSON.stringify({ VITE_EMAILJS_SERVICE_ID: 'service', VITE_EMAILJS_TEMPLATE_ID_FOR_ME: 'notification', VITE_EMAILJS_TEMPLATE_ID_FOR_SENDER: 'confirmation', VITE_EMAILJS_PUBLIC_KEY: 'public', VITE_RECAPTCHA_SITE_KEY: siteKey }) },

  });
  const source = result.outputFiles[0].text + `\n// ${Math.random()}`;
  const { submitContact } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  return { submitContact, sends, storage };
}

test('missing CAPTCHA configuration blocks all EmailJS calls', async t => {
  const f = await fixture(t, { siteKey: '' });
  assert.equal((await f.submitContact(payload, { getCaptchaToken: async () => 'token' })).code, 'unavailable');
  assert.equal(f.sends.length, 0);
});

test('invalid input, honeypot and missing verifier cannot trigger delivery', async t => {
  const f = await fixture(t);
  for (const invalid of [{ ...payload, website: 'spam' }, { ...payload, email: 'invalid' }, { ...payload, subject: 'Header\ninjection' }]) {
    assert.equal((await f.submitContact(invalid)).code, 'validation_error');
  }
  assert.equal((await f.submitContact(payload)).code, 'captcha_failed');
  assert.equal(f.sends.length, 0);
});

test('empty CAPTCHA prevents calls without uncertain delivery', async t => {
  const f = await fixture(t);
  assert.equal((await f.submitContact(payload, { getCaptchaToken: async () => '' })).code, 'captcha_failed');
  assert.equal(f.sends.length, 0);
  assert.ok([...f.storage.values()].every(value => !value.includes('sending') && !value.includes('unknown')));
});

test('hourly attempt limit blocks verification before consuming another token', async t => {
  const f = await fixture(t);
  f.storage.set('portfolio-emailjs-v2:attempts', JSON.stringify(Array.from({ length: 5 }, (_, index) => Date.now() - 61000 - index * 60000)));
  let challenges = 0;
  assert.equal((await f.submitContact(payload, { getCaptchaToken: async () => { challenges++; return 'token'; } })).code, 'rate_limited');
  assert.equal(challenges, 0);
  assert.equal(f.sends.length, 0);
});

test('each template gets a fresh token and duplicate content is not resent', async t => {
  const f = await fixture(t);
  let count = 0;
  const options = { getCaptchaToken: async () => `single-use-${++count}` };
  assert.equal((await f.submitContact(payload, options)).code, 'sent');
  assert.deepEqual(f.sends.map(args => args[2]['g-recaptcha-response']), ['single-use-1', 'single-use-2']);
  assert.equal((await f.submitContact(payload, options)).code, 'sent');
  assert.equal(count, 2);
  assert.equal((await f.submitContact({ ...payload, message: 'Uma outra mensagem diferente.' }, options)).code, 'rate_limited');
  assert.equal(f.sends.length, 2);
});

test('failed confirmation CAPTCHA can retry only confirmation with a fresh token', async t => {
  const f = await fixture(t);
  let count = 0;
  const options = { getCaptchaToken: async () => { if (++count === 2) throw new Error('blocked'); return `token-${count}`; } };
  const partial = await f.submitContact(payload, options);
  assert.equal(partial.code, 'captcha_failed');
  assert.equal(partial.notificationSent, true);
  for (const key of f.storage.keys()) if (key.endsWith('attempts')) f.storage.set(key, JSON.stringify([Date.now() - 61000]));
  assert.equal((await f.submitContact(payload, options)).code, 'sent');
  assert.deepEqual(f.sends.map(args => args[1]), ['notification', 'confirmation']);
  assert.equal(f.sends[1][2]['g-recaptcha-response'], 'token-3');
});

test('uncertain provider response prevents retry and token consumption', async t => {
  const f = await fixture(t, { sendError: new Error('network response lost') });
  let count = 0;
  const options = { getCaptchaToken: async () => `token-${++count}` };
  assert.equal((await f.submitContact(payload, options)).code, 'delivery_unknown');
  assert.equal((await f.submitContact(payload, options)).code, 'delivery_unknown');
  assert.equal(count, 1);
  assert.equal(f.sends.length, 1);
});

test('v3 executes fresh tokens with expected action and cancels on dispose', async t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  let executions = 0, pending;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: { grecaptcha: {
    ready: callback => callback(),
    execute: (key, options) => {
      assert.equal(key, 'public-site-key'); assert.equal(options.action, 'contact');
      executions++;
      return executions < 3 ? Promise.resolve('token-' + executions) : new Promise(resolve => { pending = resolve; });
    },
  } } });
  t.after(() => { if (previous) Object.defineProperty(globalThis, 'window', previous); else delete globalThis.window; });
  const controller = createContactCaptcha({ isConnected: true }, 'public-site-key', 'pt');
  assert.equal(await controller.getToken(), 'token-1');
  assert.equal(await controller.getToken(), 'token-2');
  const third = controller.getToken();
  await new Promise(resolve => setImmediate(resolve));
  controller.dispose();
  await assert.rejects(third, /cancelled/);
  pending('late');
  await assert.rejects(controller.getToken(), /unavailable/);
});
