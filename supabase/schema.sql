-- Mi Canasta: estructura inicial de precios y productos
-- Diseñada para comparar una misma canasta entre supermercados.

create extension if not exists pgcrypto;

create table if not exists public.supermarkets (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  city text not null default 'Corrientes',
  website text,
  delivery_url text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  category text,
  size_text text,
  barcode text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (brand_id, name, size_text)
);

create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),
  supermarket_id uuid not null references public.supermarkets(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  price numeric(12,2) not null check (price >= 0),
  source_url text,
  checked_at timestamptz not null default now(),
  unique (supermarket_id, product_id)
);

create index if not exists products_name_idx on public.products using gin (to_tsvector('simple', name));
create index if not exists prices_product_idx on public.prices(product_id);
create index if not exists prices_supermarket_idx on public.prices(supermarket_id);

alter table public.supermarkets enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.prices enable row level security;

-- La app pública solo necesita leer datos activos. No se habilitan INSERT/UPDATE/DELETE públicos.
drop policy if exists "public read active supermarkets" on public.supermarkets;
create policy "public read active supermarkets"
  on public.supermarkets for select
  using (active = true);

drop policy if exists "public read active brands" on public.brands;
create policy "public read active brands"
  on public.brands for select
  using (active = true);

drop policy if exists "public read active products" on public.products;
create policy "public read active products"
  on public.products for select
  using (active = true);

drop policy if exists "public read prices" on public.prices;
create policy "public read prices"
  on public.prices for select
  using (true);

insert into public.supermarkets (name, slug) values
  ('Día', 'dia'),
  ('ChangoMás', 'changomas'),
  ('Vea', 'vea'),
  ('Impulso', 'impulso'),
  ('Previsora', 'previsora'),
  ('Kucher Mercados', 'kucher-mercados'),
  ('Supermax', 'supermax'),
  ('DePot', 'depot')
on conflict (name) do nothing;
