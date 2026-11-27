import test from 'node:test';
import assert from 'node:assert/strict';
import { BEYOND_CURVE, isBeyondCurveCommand, readRickDimension } from '../src/data/rickDimensions.js';
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
