import test from 'node:test';
import assert from 'node:assert/strict';
import { agruparPrecios } from '../src/apiComparacion.js';

test('agrupa precios por supermercado y marca como completa la canasta', () => {
  const filas = [
    { supermarket_id: 1, product_id: 10, price: 1000, supermarkets: { id: 1, name: 'Día', slug: 'dia', active: true } },
    { supermarket_id: 1, product_id: 11, price: 2000, supermarkets: { id: 1, name: 'Día', slug: 'dia', active: true } },
    { supermarket_id: 2, product_id: 10, price: 900, supermarkets: { id: 2, name: 'Vea', slug: 'vea', active: true } }
  ];

  const resultado = agruparPrecios(filas, [10, 11]);

  assert.equal(resultado[0].nombre, 'Día');
  assert.equal(resultado[0].total, 3000);
  assert.equal(resultado[0].completo, true);
  assert.equal(resultado[1].nombre, 'Vea');
  assert.equal(resultado[1].completo, false);
});
