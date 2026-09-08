-- ===========================================================================
-- Atomic product save
--
-- Saving a product touches six tables. Doing that from the client library
-- means six round trips with no transaction: a failure after deleting the old
-- variants but before inserting the new ones would leave a live product with
-- no stock rows — i.e. unbuyable, silently.
--
-- This function does the whole save in one transaction. Called via
-- supabase.rpc('upsert_product', { payload }).
--
-- Security: `security invoker` (the default) so the caller's RLS applies —
-- a non-admin calling this still gets rejected by the table policies.
-- ===========================================================================

create or replace function public.upsert_product(payload jsonb)
returns uuid
language plpgsql
as $$
declare
  target_id uuid;
  item      jsonb;
  idx  integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;

  target_id := nullif(payload->>'id', '')::uuid;

  if target_id is null then
    insert into public.products (
      slug, name, short_description, description, price, compare_at_price,
      currency, materials, care_instructions, size_guide_id, featured,
      bestseller, new_arrival, status, published_at, seo_title, seo_description
    )
    values (
      payload->>'slug',
      payload->>'name',
      coalesce(payload->>'short_description', ''),
      coalesce(payload->>'description', ''),
      (payload->>'price')::integer,
      nullif(payload->>'compare_at_price', '')::integer,
      coalesce(payload->>'currency', 'USD'),
      coalesce(
        (select array_agg(value::text) from jsonb_array_elements_text(payload->'materials') as value),
        '{}'
      ),
      coalesce(
        (select array_agg(value::text) from jsonb_array_elements_text(payload->'care_instructions') as value),
        '{}'
      ),
      nullif(payload->>'size_guide_id', ''),
      coalesce((payload->>'featured')::boolean, false),
      coalesce((payload->>'bestseller')::boolean, false),
      coalesce((payload->>'new_arrival')::boolean, false),
      coalesce(payload->>'status', 'draft')::public.product_status,
      coalesce(nullif(payload->>'published_at', '')::timestamptz, now()),
      nullif(payload->>'seo_title', ''),
      nullif(payload->>'seo_description', '')
    )
    returning id into target_id;
  else
    update public.products set
      slug              = payload->>'slug',
      name              = payload->>'name',
      short_description = coalesce(payload->>'short_description', ''),
      description       = coalesce(payload->>'description', ''),
      price             = (payload->>'price')::integer,
      compare_at_price  = nullif(payload->>'compare_at_price', '')::integer,
      currency          = coalesce(payload->>'currency', 'USD'),
      materials         = coalesce(
        (select array_agg(value::text) from jsonb_array_elements_text(payload->'materials') as value),
        '{}'
      ),
      care_instructions = coalesce(
        (select array_agg(value::text) from jsonb_array_elements_text(payload->'care_instructions') as value),
        '{}'
      ),
      size_guide_id     = nullif(payload->>'size_guide_id', ''),
      featured          = coalesce((payload->>'featured')::boolean, false),
      bestseller        = coalesce((payload->>'bestseller')::boolean, false),
      new_arrival       = coalesce((payload->>'new_arrival')::boolean, false),
      status            = coalesce(payload->>'status', 'draft')::public.product_status,
      published_at      = coalesce(nullif(payload->>'published_at', '')::timestamptz, published_at),
      seo_title         = nullif(payload->>'seo_title', ''),
      seo_description   = nullif(payload->>'seo_description', '')
    where id = target_id;

    if not found then
      raise exception 'Product % not found', target_id;
    end if;
  end if;

  -- Children are replaced wholesale. Simpler and safer than diffing, and the
  -- whole thing is one transaction so there is no window where a product has
  -- no variants.
  delete from public.product_categories where product_id = target_id;
  delete from public.product_colors     where product_id = target_id;
  delete from public.product_sizes      where product_id = target_id;
  delete from public.product_images     where product_id = target_id;
  delete from public.product_variants   where product_id = target_id;

  insert into public.product_categories (product_id, category_slug)
  select target_id, value::text
  from jsonb_array_elements_text(coalesce(payload->'category_slugs', '[]'::jsonb)) as value;

  idx := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'colors', '[]'::jsonb))
  loop
    insert into public.product_colors (product_id, name, slug, hex, sort_order)
    values (target_id, item->>'name', item->>'slug', item->>'hex', idx);
    idx := idx + 1;
  end loop;

  idx := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'sizes', '[]'::jsonb))
  loop
    insert into public.product_sizes (product_id, label, slug, sort_order)
    values (target_id, item->>'label', item->>'slug', idx);
    idx := idx + 1;
  end loop;

  idx := 0;
  for item in select * from jsonb_array_elements(coalesce(payload->'images', '[]'::jsonb))
  loop
    insert into public.product_images
      (product_id, url, alt, width, height, color_slug, sort_order)
    values (
      target_id,
      item->>'url',
      coalesce(item->>'alt', ''),
      coalesce((item->>'width')::integer, 1200),
      coalesce((item->>'height')::integer, 1600),
      nullif(item->>'color_slug', ''),
      idx
    );
    idx := idx + 1;
  end loop;

  for item in select * from jsonb_array_elements(coalesce(payload->'variants', '[]'::jsonb))
  loop
    insert into public.product_variants
      (product_id, sku, color_slug, size_slug, price, inventory)
    values (
      target_id,
      item->>'sku',
      nullif(item->>'color_slug', ''),
      nullif(item->>'size_slug', ''),
      nullif(item->>'price', '')::integer,
      coalesce((item->>'inventory')::integer, 0)
    );
  end loop;

  return target_id;
end;
$$;
