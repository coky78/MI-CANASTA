const SUPABASE_URL = 'https://ydywlujaqrvxomuaonsp.supabase.co';

let clientPromise;

async function getClient() {
  if (!clientPromise) {
    clientPromise = import('https://esm.sh/@supabase/supabase-js@2').then(({ createClient }) =>
      createClient(SUPABASE_URL, window.__MI_CANASTA_SUPABASE_KEY__ || '')
    );
  }
  return clientPromise;
}

export async function buscarProductos(termino = '') {
  const client = await getClient();
  const query = client
    .from('products')
    .select('id,name,category,unit,brands(name)')
    .eq('active', true)
    .order('name');

  if (termino.trim()) {
    query.ilike('name', `%${termino.trim()}%`);
  }

  const { data, error } = await query.limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function compararProductos(productIds) {
  const client = await getClient();
  const { data, error } = await client
    .from('prices')
    .select('product_id,price,supermarkets(id,name,active)')
    .in('product_id', productIds);

  if (error) throw error;
  return data ?? [];
}
