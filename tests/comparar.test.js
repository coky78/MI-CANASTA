import test from 'node:test';
import assert from 'node:assert/strict';
import { compararCanasta } from '../src/comparar.js';
import { combinarPreciosYOfertas } from '../src/apiComparacion.js';

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

test('usa una oferta vigente de Cucher como precio para el producto vinculado', () => {
  const filas = combinarPreciosYOfertas(
    [{ supermarket_id: 6, product_id: 1, price: 2100, supermarkets: { active: true } }],
    [{ supermarket_id: 6, product_id: 1, price: 1985, valid_until: '2026-09-04' }]
  );

  assert.equal(filas.length, 1);
  assert.equal(filas[0].price, 1985);
});

test('ignora una oferta vencida de Cucher', () => {
  const filas = combinarPreciosYOfertas(
    [{ supermarket_id: 6, product_id: 1, price: 2100, supermarkets: { active: true } }],
    [{ supermarket_id: 6, product_id: 1, price: 1985, valid_until: '2020-09-04' }]
  );

  assert.equal(filas.length, 1);
  assert.equal(filas[0].price, 2100);
});
