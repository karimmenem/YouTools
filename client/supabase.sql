-- Supabase SQL schema for YouTools
-- Run this in Supabase SQL editor.

-- BRANDS
create table if not exists public.brands (
  id bigserial primary key,
  name text not null,
  slug text unique,
  logo text, -- data URL or remote URL
  position int default 0,
  created_at timestamptz default now()
);
create index if not exists brands_position_idx on public.brands(position);

-- POSTERS
create table if not exists public.posters (
  id bigserial primary key,
  title text,
  image text, -- data URL or remote URL
  active boolean default true,
  position int default 0,
  created_at timestamptz default now()
);
create index if not exists posters_position_idx on public.posters(position);

-- PRODUCTS
create table if not exists public.products (
  id bigserial primary key,
  name text not null,
  brand text, -- could later FK to brands.slug
  price numeric(12,2) default 0,
  category text,
  description text,
  image text, -- data or remote URL
  position int default 0,
  created_at timestamptz default now()
);
create index if not exists products_position_idx on public.products(position);
create index if not exists products_brand_idx on public.products(brand);
create index if not exists products_category_idx on public.products(category);

-- CATEGORIES (optional simple lookup)
create table if not exists public.categories (
  id bigserial primary key,
  name text unique not null,
  created_at timestamptz default now()
);

-- RLS (Row Level Security)
alter table public.brands enable row level security;
alter table public.posters enable row level security;
alter table public.products enable row level security;
alter table public.categories enable row level security;

-- Public read, authenticated full access policy examples
create policy "Public read brands" on public.brands for select using (true);
create policy "Anon insert brands" on public.brands for insert with check (true);
create policy "Anon update brands" on public.brands for update using (true) with check (true);
create policy "Anon delete brands" on public.brands for delete using (true);

create policy "Public read posters" on public.posters for select using (true);
create policy "Anon full posters" on public.posters for all using (true) with check (true);

create policy "Public read products" on public.products for select using (true);
create policy "Anon full products" on public.products for all using (true) with check (true);

create policy "Public read categories" on public.categories for select using (true);
create policy "Anon full categories" on public.categories for all using (true) with check (true);

-- Seed sample categories
insert into public.categories(name) values ('Power Tools') on conflict do nothing;
insert into public.categories(name) values ('Hand Tools') on conflict do nothing;
insert into public.categories(name) values ('Accessories') on conflict do nothing;

-- MIGRATION: Add images field to products table for multiple images support
-- Run this migration to add support for multiple images (up to 5)
alter table public.products add column if not exists images jsonb;
-- Note: The 'image' field is kept for backward compatibility
-- Products can have either 'image' (single) or 'images' (array) or both
