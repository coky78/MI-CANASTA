const PRODUCTOS_CORTOS = ['leche', 'yerba', 'azucar', 'cafe'];

function normalizar(texto) {
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function separarConocidosSinEspacios(texto) {
  const entrada = normalizar(texto).replace(/\s+/g, '');
  const encontrados = [];
  let posicion = 0;

  while (posicion < entrada.length) {
    const producto = PRODUCTOS_CORTOS.find(nombre => entrada.startsWith(nombre, posicion));
    if (!producto) return null;
    encontrados.push(producto);
    posicion += producto.length;
  }

  return encontrados.length ? encontrados : null;
}

export function parseLista(texto) {
  const original = String(texto ?? '').trim();
  if (!original) return [];

  const normalizada = normalizar(original);
  const partes = normalizada.split(/[,\n]+|\s+/).map(parte => parte.trim()).filter(Boolean);

  if (partes.length > 1 && partes.every(parte => PRODUCTOS_CORTOS.includes(parte))) {
    return partes;
  }

  const sinSeparadores = separarConocidosSinEspacios(original);
  if (sinSeparadores) return sinSeparadores;

  return original.split(/\n|,/).map(parte => parte.trim()).filter(Boolean);
}
