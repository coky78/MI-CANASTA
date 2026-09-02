import { agruparPrecios } from '../src/apiComparacion.js';

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

  const params = new URLSearchParams({
    select: 'price,supermarket_id,product_id,supermarkets!inner(id,name,slug,city,website,delivery_url,active)',
    product_id: `in.(${ids.join(',')})`,
    order: 'supermarket_id'
  });

  const response = await fetch(`${supabaseUrl}/rest/v1/prices?${params}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  });

  if (!response.ok) return res.status(502).json({ error: 'No se pudieron consultar los precios' });

  const filas = await response.json();
  return res.status(200).json({ product_ids: ids, resultados: agruparPrecios(filas, ids) });
}
