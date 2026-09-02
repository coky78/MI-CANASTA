import test from 'node:test';
import assert from 'node:assert/strict';
import { parseLista } from './parse-list.js';

test('reconoce productos separados por espacios, comas o sin separadores', () => {
  assert.deepEqual(parseLista('leche yerba azúcar café'), ['leche', 'yerba', 'azucar', 'cafe']);
  assert.deepEqual(parseLista('leche,yerba,azúcar,café'), ['leche', 'yerba', 'azucar', 'cafe']);
  assert.deepEqual(parseLista('lecheyerbaazucarcafe'), ['leche', 'yerba', 'azucar', 'cafe']);
});
