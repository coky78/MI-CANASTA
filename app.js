const lista = document.querySelector('#lista');
const resultados = document.querySelector('#lista-resultados');
const comparar = document.querySelector('#comparar');
const ahorrar = document.querySelector('#ahorrar');
const dinero = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

async function buscarProducto(linea) {
  const response = await fetch(`/api/productos?termino=${encodeURIComponent(linea)}`);
  if (!response.ok) throw new Error('No se pudo buscar el producto');
  const productos = await response.json();
  if (!productos.length) return null;

  const objetivo = normalizar(linea);
  return productos.find(p => normalizar(`${p.brands?.name || ''} ${p.name}`) === objetivo)
    || productos[0];
}

function renderResultados(items) {
  if (!items.length) {
    resultados.innerHTML = '<p class="empty">Todavía no hay precios cargados para esos productos.</p>';
    return;
  }

  const completos = items.filter(item => item.completo);
  const base = completos.length ? completos : items;
  const menor = base[0].total;

  resultados.innerHTML = items.map(item => `
    <article class="card ${item.completo && item.total === menor ? 'best' : ''}">
      ${item.completo && item.total === menor ? '<span class="badge">MEJOR PRECIO</span>' : ''}
      <div class="store">${item.nombre}</div>
      <div class="total">${dinero.format(item.total)}</div>
      <div class="save">${item.completo ? (item.total === menor ? 'Es la canasta completa más barata.' : `${dinero.format(item.total - menor)} más que la opción más barata.`) : `Faltan ${item.productos} de ${window.__MI_CANASTA_TOTAL__} productos con precio cargado.`}</div>
      ${item.delivery_url ? `<a class="buy" href="${item.delivery_url}" target="_blank" rel="noopener">COMPRAR AQUÍ</a>` : ''}
      ${item.website ? `<a class="secondary" href="${item.website}" target="_blank" rel="noopener">📍 VER UBICACIÓN / WEB</a>` : ''}
    </article>
  `).join('');
}

async function compararCanasta() {
  const lineas = lista.value.split(/\n|,/).map(s => s.trim()).filter(Boolean);
  if (!lineas.length) {
    lista.focus();
    lista.setAttribute('aria-invalid', 'true');
    return;
  }

  lista.removeAttribute('aria-invalid');
  comparar.disabled = true;
  resultados.innerHTML = '<p class="loading">Buscando productos y comparando precios…</p>';

  try {
    const productos = [];
    const noEncontrados = [];
    for (const linea of lineas) {
      const producto = await buscarProducto(linea);
      if (producto) productos.push(producto);
      else noEncontrados.push(linea);
    }

    const ids = [...new Set(productos.map(p => p.id))];
    if (!ids.length) throw new Error('No encontramos productos conocidos en la lista.');

    window.__MI_CANASTA_TOTAL__ = ids.length;
    const response = await fetch(`/api/comparar?product_ids=${ids.join(',')}`);
    if (!response.ok) throw new Error('No se pudieron consultar los precios.');

    const data = await response.json();
    renderResultados(data.resultados || []);

    if (noEncontrados.length) {
      resultados.insertAdjacentHTML('afterbegin', `<p class="notice">No encontramos todavía: ${noEncontrados.join(', ')}.</p>`);
    }
  } catch (error) {
    resultados.innerHTML = `<p class="error">${error.message}</p>`;
  } finally {
    comparar.disabled = false;
  }
}

comparar.addEventListener('click', compararCanasta);
ahorrar?.addEventListener('click', () => {
  lista.focus();
});
