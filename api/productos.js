export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' });

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Faltan las variables de Supabase en Vercel' });
  }

  const termino = String(req.query.termino || '').trim();
  const params = new URLSearchParams({
    select: 'id,name,category,unit,barcode,brands!inner(id,name)',
    active: 'eq.true',
    'brands.active': 'eq.true',
    order: 'name.asc'
  });
  if (termino) params.set('name', `ilike.*${termino.replace(/[*,]/g, ' ')}*`);

  const response = await fetch(`${supabaseUrl}/rest/v1/products?${params}`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` }
  });

  if (!response.ok) return res.status(502).json({ error: 'No se pudieron consultar los productos' });
  return res.status(200).json(await response.json());
}
