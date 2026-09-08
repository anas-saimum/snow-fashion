-- ===========================================================================
-- Snow Fashion — catalogue schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New
-- query → paste → Run). It is idempotent, so re-running is safe.
--
-- Design notes:
--  * Money is stored as integer minor units (cents), matching lib/pricing.ts.
--    Never introduce numeric/float here — the app does integer arithmetic and
--    a float column would reintroduce rounding drift at the boundary.
--  * Colours, sizes, images and variants are separate tables rather than
--    JSON, so the admin can reorder and edit them individually and the
--    storefront can filter on them in SQL.
--  * Inventory lives on the variant, which is the thing actually sold.
--  * RLS is on for every table: the public may read active products only;
--    writes require an authenticated user listed in `admins`.
-- ===========================================================================

-- ------------------------------------------------------------------ admins --
-- Membership of this table is what grants write access. A Supabase auth user
-- with no row here can sign in but cannot change anything.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- -------------------------------------------------------------- categories --
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  image_url   text,
  image_alt   text,
  parent_slug text references public.categories (slug) on delete set null,
  featured    boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- products --
do $$ begin
  create type public.product_status as enum ('active', 'draft', 'archived');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  name               text not null,
  short_description  text not null default '',
  description        text not null default '',
  -- Integer minor units. 14800 = $148.00
  price              integer not null check (price >= 0),
  compare_at_price   integer check (compare_at_price is null or compare_at_price >= 0),
  currency           text not null default 'USD',
  materials          text[] not null default '{}',
  care_instructions  text[] not null default '{}',
  size_guide_id      text,
  -- Review data. Left null until a reviews provider is connected; the
  -- storefront renders nothing when absent rather than showing empty stars.
  rating             numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  review_count       integer check (review_count is null or review_count >= 0),
  featured           boolean not null default false,
  bestseller         boolean not null default false,
  new_arrival        boolean not null default false,
  status             public.product_status not null default 'draft',
  published_at       timestamptz not null default now(),
  seo_title          text,
  seo_description    text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- A discount must actually be a discount.
  constraint compare_at_above_price
    check (compare_at_price is null or compare_at_price > price)
);

create index if not exists products_status_idx      on public.products (status);
create index if not exists products_published_idx   on public.products (published_at desc);
create index if not exists products_price_idx       on public.products (price);

-- --------------------------------------------------- product ↔ categories --
create table if not exists public.product_categories (
  product_id    uuid not null references public.products (id) on delete cascade,
  category_slug text not null references public.categories (slug) on delete cascade,
  primary key (product_id, category_slug)
);

create index if not exists product_categories_slug_idx
  on public.product_categories (category_slug);

-- ------------------------------------------------------------------ colours --
create table if not exists public.product_colors (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name       text not null,
  slug       text not null,
  hex        text not null check (hex ~* '^#[0-9a-f]{6}$'),
  sort_order integer not null default 0,
  unique (product_id, slug)
);

-- -------------------------------------------------------------------- sizes --
create table if not exists public.product_sizes (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label      text not null,
  slug       text not null,
  sort_order integer not null default 0,
  unique (product_id, slug)
);

-- ------------------------------------------------------------------- images --
create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  -- Not nullable: alt text is an accessibility contract, not an extra.
  alt        text not null,
  width      integer not null default 1200,
  height     integer not null default 1600,
  color_slug text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx
  on public.product_images (product_id, sort_order);

-- ----------------------------------------------------------------- variants --
create table if not exists public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku        text not null unique,
  color_slug text,
  size_slug  text,
  -- Optional per-variant override; falls back to products.price.
  price      integer check (price is null or price >= 0),
  inventory  integer not null default 0 check (inventory >= 0),
  unique (product_id, color_slug, size_slug)
);

create index if not exists product_variants_product_idx
  on public.product_variants (product_id);

-- ------------------------------------------------------------- site settings --
-- Single-row table for brand-level values the admin can edit (logo, contact).
create table if not exists public.site_settings (
  id         boolean primary key default true check (id),
  logo_url   text,
  settings   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (true) on conflict (id) do nothing;

-- ----------------------------------------------------------------- updated_at --
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists categories_touch on public.categories;
create trigger categories_touch before update on public.categories
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ===========================================================================
-- Row level security
--
-- Public (anon) may read active products and everything hanging off them.
-- Draft and archived products are invisible to the storefront.
-- Only an authenticated user present in `admins` may write.
-- ===========================================================================

alter table public.admins             enable row level security;
alter table public.categories         enable row level security;
alter table public.products           enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_colors     enable row level security;
alter table public.product_sizes      enable row level security;
alter table public.product_images     enable row level security;
alter table public.product_variants   enable row level security;
alter table public.site_settings      enable row level security;

-- admins: you may see your own row; nobody may self-promote from the client.
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins
  for select using (user_id = auth.uid());

-- categories: readable by all, writable by admins.
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (true);

drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- products: the public sees active only.
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (status = 'active' or public.is_admin());

drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

-- Child tables: visible when their parent product is visible.
do $$
declare
  child text;
begin
  foreach child in array array[
    'product_categories', 'product_colors', 'product_sizes',
    'product_images', 'product_variants'
  ]
  loop
    execute format('drop policy if exists %I_public_read on public.%I', child, child);
    execute format($f$
      create policy %I_public_read on public.%I
        for select using (
          exists (
            select 1 from public.products p
            where p.id = %I.product_id
              and (p.status = 'active' or public.is_admin())
          )
        )
    $f$, child, child, child);

    execute format('drop policy if exists %I_admin_write on public.%I', child, child);
    execute format($f$
      create policy %I_admin_write on public.%I
        for all using (public.is_admin()) with check (public.is_admin())
    $f$, child, child);
  end loop;
end $$;

-- site_settings: readable by all (the storefront reads the logo), admin-writable.
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select using (true);

drop policy if exists site_settings_admin_write on public.site_settings;
create policy site_settings_admin_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ===========================================================================
-- Storage bucket for product photography and the logo.
-- Public read (images are served to shoppers), admin-only write.
-- ===========================================================================

insert into storage.buckets (id, name, public)
values ('product-media', 'product-media', true)
on conflict (id) do nothing;

drop policy if exists product_media_public_read on storage.objects;
create policy product_media_public_read on storage.objects
  for select using (bucket_id = 'product-media');

drop policy if exists product_media_admin_write on storage.objects;
create policy product_media_admin_write on storage.objects
  for all
  using (bucket_id = 'product-media' and public.is_admin())
  with check (bucket_id = 'product-media' and public.is_admin());
