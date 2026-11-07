import test from 'node:test';
import assert from 'node:assert/strict';
import { requestChatStream, warmModelCatalog } from '../src/services/chatStream.js';
import { createStreamBuffer } from '../src/services/streamBuffer.js';
import { writeEvent } from '../server/ndjson.js';
import { EventEmitter } from 'node:events';

function stream(text) {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream({ start(controller) {
    for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
    controller.close();
  } }), { headers: { 'Content-Type': 'application/x-ndjson' } });
}

test('NDJSON parser preserves split UTF-8, metadata and completion without trailing newline', async () => {
  const original = globalThis.fetch;
  const events = [];
  globalThis.fetch = async (_url, options) => {
    assert.equal(JSON.parse(options.body).stream, true);
    return stream('{"type":"meta","model":"test"}\n{"type":"delta","text":"Olá 🌎"}\n{"type":"context","liveContext":{"github":{"status":"ok"}}}\n{"type":"done"}');
  };
  try {
    const result = await requestChatStream({ userMessage: 'Hi' }, { onEvent: event => events.push(event) });
    assert.equal(result.response, 'Olá 🌎');
    assert.equal(result.model, 'test');
    assert.equal(result.liveContext.github.status, 'ok');
    assert.deepEqual(events.map(event => event.type), ['meta', 'delta', 'context', 'done']);
  } finally { globalThis.fetch = original; }
});

test('partial stream failures are reported without retrying generation', async () => {
  const original = globalThis.fetch;
  try {
    for (const end of ['', '{"type":"error","error":"provider failed"}\n']) {
      let calls = 0;
      const deltas = [];
      globalThis.fetch = async () => { calls++; return stream('{"type":"delta","text":"partial"}\n' + end); };
      await assert.rejects(requestChatStream({}, { onEvent: event => deltas.push(event) }), /interrupted|provider failed/);
      assert.equal(deltas[0].text, 'partial');
      assert.equal(calls, 1);
    }
    globalThis.fetch = async () => Response.json({ response: 'Immediate reply', translationKey: 'key' });
    assert.equal((await requestChatStream({})).response, 'Immediate reply');
    globalThis.fetch = async () => Response.json({ error: 'unavailable' }, { status: 503 });
    await assert.rejects(requestChatStream({}), /unavailable/);
  } finally { globalThis.fetch = original; }
});

test('model warmup is deduplicated and reused in memory', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({ models: ['test'] }); };
  try {
    const first = warmModelCatalog();
    assert.equal(first, warmModelCatalog());
    assert.deepEqual(await first, ['test']);
    assert.deepEqual(await warmModelCatalog(), ['test']);
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});

test('token buffer batches notifications and disposes its pending timer', async () => {
  const buffer = createStreamBuffer();
  let renders = 0;
  buffer.subscribe(() => renders++);
  for (let i = 0; i < 100; i++) buffer.push({ type: 'delta', text: 'a' });
  assert.equal(renders, 0);
  await new Promise(resolve => setTimeout(resolve, 60));
  assert.equal(renders, 1);
  assert.equal(buffer.getSnapshot().text.length, 100);
  buffer.push({ type: 'delta', text: 'b' });
  buffer.dispose();
  await new Promise(resolve => setTimeout(resolve, 60));
  assert.equal(renders, 1);
  assert.equal(buffer.getText().length, 101);
});

test('server stream waits for backpressure and rejects disconnected readers', async () => {
  const res = new EventEmitter();
  res.write = () => false;
  let finished = false;
  const pending = writeEvent(res, { type: 'delta', text: 'token' }).then(() => { finished = true; });
  await Promise.resolve();
  assert.equal(finished, false);
  res.emit('drain'); await pending;
  assert.equal(finished, true);
  const disconnected = writeEvent(res, { type: 'delta', text: 'token' });
  res.emit('close');
  await assert.rejects(disconnected, { name: 'AbortError' });
  assert.equal(res.listenerCount('drain'), 0);
});
