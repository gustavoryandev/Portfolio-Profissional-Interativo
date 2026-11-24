import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/contact.js';

test('server rejects invalid v3 assessments before sending email', async t => {
  const keys = { RECAPTCHA_SECRET_KEY: 'secret', RECAPTCHA_ALLOWED_HOSTNAMES: 'localhost', RECAPTCHA_MIN_SCORE: '0.5', EMAILJS_SERVICE_ID: 'service', EMAILJS_PUBLIC_KEY: 'public', EMAILJS_PRIVATE_KEY: 'private', EMAILJS_TEMPLATE_ID_FOR_ME: 'me', EMAILJS_TEMPLATE_ID_FOR_SENDER: 'sender' };
  const old = { ...process.env }, originalFetch = globalThis.fetch;
  Object.assign(process.env, keys);
  t.after(() => { globalThis.fetch = originalFetch; for (const key of Object.keys(keys)) { if (old[key] === undefined) delete process.env[key]; else process.env[key] = old[key]; } });
  const valid = { success: true, action: 'contact', score: 0.9, hostname: 'localhost', challenge_ts: new Date().toISOString() };
  const body = { kind: 'notification', name: 'Visitor', email: 'visitor@example.com', subject: 'Hello', message: 'A professional message.', reference: 'ref', 'g-recaptcha-response': 'token' };
  for (const override of [{ success: false }, { action: 'login' }, { score: 0.1 }, { score: null }, { hostname: 'evil.example' }, { challenge_ts: new Date(Date.now() - 180000).toISOString() }, { challenge_ts: 'invalid' }, null]) {
    const calls = [];
    globalThis.fetch = async (url, options) => { calls.push([url, options]); return { ok: true, json: async () => ({ ...valid, ...override }) }; };
    const res = { setHeader() {}, status(value) { this.statusCode = value; return this; }, json(value) { this.body = value; } };
    await handler({ method: 'POST', body }, res);
    assert.equal(res.statusCode, override === null ? 200 : 403);
    assert.equal(calls.length, override === null ? 2 : 1);
    if (override === null) {
      const sent = JSON.parse(calls[1][1].body);
      assert.equal(sent.accessToken, 'private');
      assert.equal(sent.template_id, 'me');
      assert.ok(!('g-recaptcha-response' in sent.template_params));
    }
  }
});
