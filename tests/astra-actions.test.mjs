import test from 'node:test';
import assert from 'node:assert/strict';
import { createLaboratory } from '../src/services/laboratory.js';
import { createAstraActionEngine } from '../src/services/astraActionEngine.js';
import { requestChatStream } from '../src/services/chatStream.js';

test('a Laboratory plan works before mount and its approval runs once against the reviewed revision', async () => {
  const workers = [];
  const lab = createLaboratory({ makeWorker(language) {
    const worker = { language, postMessage(payload) { this.payload = payload; }, terminate() { this.terminated = true; } };
    workers.push(worker);
    return worker;
  } });
  const engine = createAstraActionEngine({ lab, projectIds: new Set() });
  const routes = [];
  const ui = { navigate: target => routes.push(target) };
  const plan = [
    { type: 'navigate', target: 'laboratorio' },
    { type: 'lab.language', target: 'python' },
    { type: 'lab.example', target: 'bro-fit' },
    { type: 'lab.read', target: 'code' },
  ];
  lab.select({ example: 'free', language: 'javascript' });
  lab.setCode('console.log("independent draft")');
  const { snapshot, base } = await engine.execute(1, plan, ui);
  await engine.execute(1, plan, ui);
  assert.deepEqual(routes, ['laboratorio']);
  assert.match(snapshot.code, /aluno = "Carlos"/);
  assert.equal(Object.hasOwn(snapshot, 'output'), false);
  const edit = [{ type: 'lab.edit', edits: [{ find: 'aluno = "Carlos"', replace: 'aluno = "Ana"' }], runAfter: true }];
  const firstReview = await engine.execute(1, edit, ui, { base });
  const { id } = lab.getSnapshot().review;
  assert.equal(firstReview.reviewId, id);
  assert.equal(lab.getSnapshot().code, snapshot.code);
  assert.equal(workers.length, 0);
  lab.resolveReview(id, true);
  lab.resolveReview(id, true);
  assert.equal(workers.length, 1);
  assert.equal(workers[0].language, 'python');
  assert.match(workers[0].payload.code, /aluno = "Ana"/);
  workers[0].onmessage({ data: { type: 'ready' } });
  workers[0].onmessage({ data: { type: 'done', output: 'BRO FIT | Ficha de Ana' } });
  assert.equal(workers[0].terminated, true);
  lab.select({ example: 'free', language: 'javascript' });
  assert.match(lab.getSnapshot().code, /independent draft/);
  lab.select({ example: 'bro-fit', language: 'python' });
  assert.equal(lab.getSnapshot().output, 'BRO FIT | Ficha de Ana');
  assert.match(lab.getSnapshot().code, /aluno = "Ana"/);

  const next = await engine.execute(2, [{ type: 'lab.read', target: 'code' }], ui);
  await engine.execute(2, [{ type: 'lab.edit', edits: [{ find: 'aluno = "Ana"', replace: 'aluno = "Bia"' }] }], ui, { base: next.base });
  const pendingId = lab.getSnapshot().review.id;
  lab.setCode(next.snapshot.code + '\n# manual change');
  lab.resolveReview(pendingId, true);
  assert.equal(lab.getSnapshot().reviewResults[pendingId], 'stale');
  assert.equal(lab.getSnapshot().reviewResults[id], 'applied');
  assert.match(lab.getSnapshot().code, /# manual change/);
  assert.match(lab.getSnapshot().code, /aluno = "Ana"/);
});

test('the action engine rejects unknown targets and cannot apply a code edit from an output-only read', async () => {
  const lab = createLaboratory();
  const engine = createAstraActionEngine({ lab, projectIds: new Set(['academia']) });
  const calls = [];
  const ui = { navigate: target => calls.push(target), openProject: id => calls.push(id),
    setTheme: theme => calls.push(theme), setLanguage: async language => calls.push(language) };
  const outcome = await engine.execute(1, [{ type: 'navigate', target: 'inicio' }, { type: 'project.open', target: 'https://unknown.test' }], ui);
  assert.deepEqual(outcome.notices, ['invalid']);
  assert.deepEqual(calls, []);
  const shared = await engine.execute(2, [
    { type: 'theme.set', target: 'aurora' }, { type: 'language.set', target: 'en' },
    { type: 'project.open', target: 'academia' }, { type: 'metrics.open', target: 'all' },
    { type: 'lab.read', target: 'result' },
  ], ui);
  assert.deepEqual(calls, ['aurora', 'en', 'academia']);
  assert.match(shared.cards[0], /\[GITHUB_CARD\]\n\[WAKATIME_CARD\]/);
  assert.equal(Object.hasOwn(shared.snapshot, 'code'), false);
  const result = await engine.execute(2, [{ type: 'lab.edit', edits: [{ find: 'Carlos', replace: 'Ana' }] }], ui, { base: shared.base });
  assert.deepEqual(result.notices, ['invalid']);
  assert.equal(lab.getSnapshot().review, null);
});

test('tool-only streamed responses require completion and discarded attempts never return actions', async t => {
  let frames;
  t.mock.method(globalThis, 'fetch', async () => new Response(frames.map(event => JSON.stringify(event)).join('\n'),
    { headers: { 'Content-Type': 'application/x-ndjson' } }));
  const tool = { type: 'actions', actions: [{ type: 'lab.run' }] };
  frames = [tool];
  await assert.rejects(requestChatStream({}), /interrupted/);
  frames = [tool, { type: 'reset' }, { type: 'delta', text: 'Try again.' }, { type: 'done' }];
  assert.equal((await requestChatStream({})).actions, undefined);
  frames = [tool, { type: 'done' }];
  assert.deepEqual((await requestChatStream({})).actions, tool.actions);
});
