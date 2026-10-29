import test from 'node:test';
import assert from 'node:assert/strict';

let next = 0;
async function setup(fetchImpl, browser = true) {
  const spoken = [];
  let cancelled = 0;
  globalThis.window = {
    Audio: class {}, fetch: fetchImpl,
    ...(browser ? {
      SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
      speechSynthesis: {
        getVoices: () => [{ lang: 'pt-BR' }, { lang: 'en-US' }],
        speak: u => spoken.push(u),
        cancel: () => cancelled++,
      },
    } : {}),
  };
  globalThis.fetch = fetchImpl;
  const speech = await import(`../src/services/speech.js?test=${next++}`);
  return { speech, spoken, cancelled: () => cancelled };
}

test('502 falls back, selects language, completes, and next click skips failing server', async () => {
  let requests = 0;
  const { speech, spoken } = await setup(async () => { requests++; return { ok: false }; });
  assert.equal(await speech.speak('a', '**Olá**', 'pt'), true);
  assert.equal(spoken[0].text, 'Olá');
  assert.equal(spoken[0].voice.lang, 'pt-BR');
  spoken[0].onstart();
  assert.deepEqual(speech.getSpeechState(), { id: 'a', status: 'playing' });
  spoken[0].onend();
  assert.equal(speech.getSpeechState().status, 'idle');
  await speech.speak('b', 'Hello', 'en');
  assert.equal(requests, 1);
  assert.equal(spoken[1].lang, 'en-US');
  speech.stopSpeaking();
});

test('stopping pending request never starts fallback', async () => {
  let reject;
  const { speech, spoken } = await setup(() => new Promise((_, r) => { reject = r; }));
  const pending = speech.speak('a', 'Olá', 'pt');
  speech.stopSpeaking();
  reject(new Error('aborted'));
  assert.equal(await pending, false);
  assert.equal(spoken.length, 0);
  assert.equal(speech.getSpeechState().status, 'idle');
});

test('browser error is visible and retry is direct; stop cancels browser speech', async () => {
  const { speech, spoken, cancelled } = await setup(async () => ({ ok: false }));
  await speech.speak('a', 'Olá', 'pt');
  spoken[0].onerror({ error: 'not-allowed' });
  assert.equal(speech.getSpeechState().status, 'error');
  await speech.speak('a', 'Olá', 'pt');
  const staleStart = spoken[1].onstart;
  speech.stopSpeaking();
  staleStart();
  assert.equal(speech.getSpeechState().status, 'idle');
  assert.equal(cancelled(), 2);
});

test('failure without browser synthesis shows error', async () => {
  const { speech } = await setup(async () => ({ ok: false }), false);
  assert.equal(await speech.speak('a', 'Olá', 'pt'), false);
  assert.equal(speech.getSpeechState().status, 'error');
});

test('successful server audio remains the first choice', async () => {
  const { speech, spoken } = await setup(async () => ({
    ok: true, headers: new Headers({ 'content-type': 'audio/mpeg' }),
    blob: async () => new Blob(['audio']),
  }));
  globalThis.Audio = class {
    async play() {} pause() {} load() {} removeAttribute() {}
  };
  assert.equal(await speech.speak('a', 'Olá', 'pt'), true);
  assert.equal(spoken.length, 0);
  assert.equal(speech.getSpeechState().status, 'playing');
  speech.stopSpeaking();
});
