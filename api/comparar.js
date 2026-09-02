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

  const [priceResponse, offerResponse] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/prices?${priceParams}`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/cucher_offers?${offerParams}`, { headers })
  ]);

  if (!priceResponse.ok || !offerResponse.ok) {
    return res.status(502).json({ error: 'No se pudieron consultar los precios' });
  }

  const [precios, ofertas] = await Promise.all([priceResponse.json(), offerResponse.json()]);
  const filas = combinarPreciosYOfertas(precios, ofertas);
  return res.status(200).json({ product_ids: ids, resultados: agruparPrecios(filas, ids) });
}
