import { agruparPrecios, combinarPreciosYOfertas } from '../src/apiComparacion.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const ids = String(req.query.product_ids || '')
    .split(',')
    .map(Number)
    .filter(Number.isInteger);

  if (!ids.length) return res.status(400).json({ error: 'Seleccioná al menos un producto' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Faltan las variables de Supabase en Vercel' });
  }

  const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
  const priceParams = new URLSearchParams({
    select: 'price,supermarket_id,product_id,supermarkets!inner(id,name,slug,city,website,delivery_url,active)',
    product_id: `in.(${ids.join(',')})`,
    order: 'supermarket_id'
  });
  const offerParams = new URLSearchParams({
    select: 'supermarket_id,product_id,price,valid_until',
    product_id: `in.(${ids.join(',')})`,
    valid_until: `gte.${new Date().toISOString().slice(0, 10)}`
  });
  const supermarketParams = new URLSearchParams({
    select: 'id,name,slug,city,website,delivery_url,active',
    active: 'eq.true',
    order: 'id.asc'
  });

  const [priceResponse, offerResponse, supermarketResponse] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/prices?${priceParams}`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/cucher_offers?${offerParams}`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/supermarkets?${supermarketParams}`, { headers })
  ]);

  if (!priceResponse.ok || !offerResponse.ok || !supermarketResponse.ok) {
    return res.status(502).json({ error: 'No se pudieron consultar los precios y supermercados' });
  }

  const [precios, ofertas, supermercados] = await Promise.all([
    priceResponse.json(),
    offerResponse.json(),
    supermarketResponse.json()
  ]);

  const filas = combinarPreciosYOfertas(precios, ofertas);
  const resultadosConPrecios = agruparPrecios(filas, ids);
  const idsConPrecios = new Set(resultadosConPrecios.map(item => Number(item.id)));

  // Mostramos también los supermercados activos que todavía no tienen
  // precios cargados para esta canasta, para que puedan incorporarse a la base.
  const resultados = [
    ...resultadosConPrecios,
    ...supermercados
      .filter(supermarket => !idsConPrecios.has(Number(supermarket.id)))
      .map(supermarket => ({
        id: supermarket.id,
        nombre: supermarket.name,
        slug: supermarket.slug,
        ciudad: supermarket.city,
        website: supermarket.website,
        delivery_url: supermarket.delivery_url,
        total: 0,
        productos: 0,
        completo: false,
        sin_precios: true
      }))
  ];

  return res.status(200).json({ product_ids: ids, resultados });
}
