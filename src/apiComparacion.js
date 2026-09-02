export function combinarPreciosYOfertas(precios, ofertas) {
  const porClave = new Map(
    precios.map((fila) => [`${fila.supermarket_id}:${fila.product_id}`, fila])
  );

  const hoy = new Date().toISOString().slice(0, 10);
  for (const oferta of ofertas) {
    if (oferta.supermarket_id == null || oferta.product_id == null) continue;
    if (oferta.valid_until && oferta.valid_until < hoy) continue;

    const key = `${oferta.supermarket_id}:${oferta.product_id}`;
    const actual = porClave.get(key);
    porClave.set(key, {
      ...(actual || {}),
      supermarket_id: oferta.supermarket_id,
      product_id: oferta.product_id,
      price: Number(oferta.price),
      supermarkets: actual?.supermarkets || { active: true }
    });
  }

  return [...porClave.values()];
}

export function agruparPrecios(filas, productIds) {
  const ids = new Set(productIds.map(Number));
  const grouped = new Map();

  for (const row of filas) {
    const supermarket = row.supermarkets;
    if (!supermarket?.active || !ids.has(Number(row.product_id))) continue;

    if (!grouped.has(row.supermarket_id)) {
      grouped.set(row.supermarket_id, {
        id: supermarket.id,
        nombre: supermarket.name,
        slug: supermarket.slug,
        ciudad: supermarket.city,
        website: supermarket.website,
        delivery_url: supermarket.delivery_url,
        total: 0,
        productos: 0,
        completo: false
      });
    }

    const item = grouped.get(row.supermarket_id);
    item.total += Number(row.price);
    item.productos += 1;
  }

  return [...grouped.values()]
    .map(item => ({ ...item, completo: item.productos === ids.size }))
    .sort((a, b) => {
      if (a.completo !== b.completo) return a.completo ? -1 : 1;
      return a.total - b.total;
    });
}
