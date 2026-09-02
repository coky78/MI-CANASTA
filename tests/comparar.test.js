import test from 'node:test';
import assert from 'node:assert/strict';
import { compararCanasta } from '../src/comparar.js';

test('ordena supermercados por el total de la canasta', () => {
  const resultado = compararCanasta([
    { supermercado: 'Día', total: 35000 },
    { supermercado: 'Vea', total: 38000 },
    { supermercado: 'Supermax', total: 33000 }
  ]);

  assert.deepEqual(resultado.map(item => item.supermercado), ['Supermax', 'Día', 'Vea']);
});

test('marca el supermercado con menor total como mejor precio', () => {
  const resultado = compararCanasta([
    { supermercado: 'Día', total: 35000 },
    { supermercado: 'Vea', total: 38000 }
  ]);

  assert.equal(resultado[0].mejorPrecio, true);
  assert.equal(resultado[1].mejorPrecio, false);
});
