import { compararCanasta } from './src/comparar.js';

const supermercados = [
  { supermercado: 'Supermax', total: 33000 },
  { supermercado: 'Día', total: 35000 },
  { supermercado: 'ChangoMás', total: 37200 },
  { supermercado: 'Vea', total: 38150 },
  { supermercado: 'Impulso', total: 38900 },
  { supermercado: 'Previsora', total: 39400 },
  { supermercado: 'Kucher Mercados', total: 40100 },
  { supermercado: 'DePot', total: 40700 }
];

const lista = document.querySelector('#lista');
const resultados = document.querySelector('#lista-resultados');
const comparar = document.querySelector('#comparar');

const dinero = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

function renderResultados() {
  const items = compararCanasta(supermercados);
  const menor = items[0].total;

  resultados.innerHTML = items.map(item => `
    <article class="card ${item.mejorPrecio ? 'best' : ''}">
      ${item.mejorPrecio ? '<span class="badge">MEJOR PRECIO</span>' : ''}
      <div class="store">${item.supermercado}</div>
      <div class="total">${dinero.format(item.total)}</div>
      ${item.mejorPrecio ? '<div class="save">Ahorrás más con esta opción.</div>' : `<div class="save">${dinero.format(item.total - menor)} más que la opción más barata.</div>`}
      <button class="buy" type="button">COMPRAR AQUÍ</button>
      <button class="secondary" type="button">📍 VER UBICACIÓN</button>
    </article>
  `).join('');
}

comparar.addEventListener('click', () => {
  if (!lista.value.trim()) {
    lista.focus();
    lista.setAttribute('aria-invalid', 'true');
    return;
  }
  lista.removeAttribute('aria-invalid');
  renderResultados();
  document.querySelector('#resultados').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
