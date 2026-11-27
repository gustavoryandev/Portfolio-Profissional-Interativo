import test from 'node:test';
import assert from 'node:assert/strict';
import { BEYOND_CURVE, beyondHintPersona, isBeyondCurveCommand, isBeyondHintQuestion, readRickDimension } from '../src/data/rickDimensions.js';
import { themes } from '../src/data/themes.js';

test('the secret command is an exact normalized utterance inside the Rick theme', () => {
  for (const command of ['Wubba Lubba Dub-Dub', 'Wubba Lubba Dub Dub', 'WubbaLubbaDubDub', 'Wabalaba dubdub',
    'Wabalabadubdub', '  WÚBBA, LUBBA—DUB DUB!  ', '“Wábalabá  Dubdub”']) {
    assert.equal(isBeyondCurveCommand('rick-morty', command), true, command);
    for (const { id } of themes.filter(theme => theme.id !== 'rick-morty')) {
      assert.equal(isBeyondCurveCommand(id, command), false, id);
    }
  }
  for (const mention of ['O que significa Wubba Lubba Dub-Dub?', 'Say Wubba Lubba Dub Dub',
    'Wabalaba dubdub é uma fala?', 'Wubba Lubba Dub', '...', null]) {
    assert.equal(isBeyondCurveCommand('rick-morty', mention), false);
  }
});

test('discovery hints match casual bilingual questions in the intended surfaces', () => {
  for (const question of ['Quais são os mistérios daqui?', 'Que expressão o Rick usa?', 'Does Rick have a secret phrase?', 'Any mysteries around here?']) {
    assert.equal(isBeyondHintQuestion(question), true, question);
  }
  for (const question of ['Wubba Lubba Dub-Dub', 'Explique os segredos da API', 'What does Rick say about this project?']) {
    assert.equal(isBeyondHintQuestion(question), false, question);
  }
  assert.equal(beyondHintPersona('rick-morty', 'lab', 'full', 'birdperson'), 'birdperson');
  assert.equal(beyondHintPersona('rick-morty', 'corrupted', 'compact', 'meeseeks'), 'meeseeks');
  assert.equal(beyondHintPersona('rick-morty', 'corrupted', 'full', 'poopybutthole'), null);
  assert.equal(beyondHintPersona('rick-morty', 'beyond-curve', 'compact', 'evil-rick'), null);
  assert.equal(beyondHintPersona('dark', 'lab', 'full', 'birdperson'), null);
});

test('stored destination validates the unlock, prioritizes the legacy alias and rejects unknown state', () => {
  assert.equal(readRickDimension('rick-morty', BEYOND_CURVE, true), BEYOND_CURVE);
  assert.equal(readRickDimension('rick-morty', BEYOND_CURVE, false), 'lab');
  assert.equal(readRickDimension('rick-morty', 'corrupted', false), 'corrupted');
  assert.equal(readRickDimension('rick-morty-secret', BEYOND_CURVE, true), 'corrupted');
  assert.equal(readRickDimension('rick-morty', 'invalid', true), 'lab');
  assert.equal(readRickDimension(null, null, false), 'lab');
  assert.equal(themes.length, 15);
  assert.equal(themes.some(theme => theme.id === BEYOND_CURVE), false);
});
