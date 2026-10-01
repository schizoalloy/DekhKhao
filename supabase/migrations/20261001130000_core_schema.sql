-- DekhKhao core schema: restaurants, menus, uploaded files, membership and published snapshots.
--
-- Security model
--   * Working tables (everything except published_menus) are never visible to anonymous visitors:
--     anon has no privileges on them and no RLS policies.
--   * Customers read public.published_menus only. A row appears there only when an editor runs
--     publish_menu(), which validates the menu and freezes it as a JSON snapshot.
--   * Signed-in users act through RLS. Platform admins can do everything; restaurant members
--     (for future restaurant accounts) are limited to their own restaurants by role.
--   * Helper functions live in the `private` schema, which the Data API does not expose.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------------------------

-- Who administers the whole platform. Rows are added by hand (SQL editor), never by the app,
-- so nobody can promote themselves.
create table public.platform_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.restaurants (
  id uuid primary key default gen_random_uuid(),
  -- /r/<slug>. Treat as permanent once QR codes are printed.
  slug text not null unique
    constraint restaurants_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 60)
    -- "demo" is served from the JSON registry in the repo (src/catalog/restaurants/demo.json).
    constraint restaurants_slug_reserved check (slug not in ('demo')),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  catalog_title text not null default 'Menu' check (char_length(btrim(catalog_title)) between 1 and 60),
  accent text check (accent ~ '^#[0-9a-fA-F]{6}$'),
  logo_asset_id uuid,
  indexable boolean not null default false,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Future restaurant accounts. Unused while there is a single platform admin.
create table public.restaurant_members (
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (restaurant_id, user_id)
);
create index restaurant_members_user_id_idx on public.restaurant_members (user_id);

-- Every uploaded file. The bytes live in Cloudflare R2; this row is the record of them.
create table public.assets (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  kind text not null check (kind in ('glb', 'usdz', 'image')),
  content_type text not null,
  -- Object key in the private bucket (R2_PRIVATE_BUCKET).
  storage_key text not null unique,
  byte_size bigint check (byte_size between 1 and 104857600),
  original_filename text check (char_length(original_filename) <= 255),
  -- pending: upload URL issued; ready: file checked on the server; failed: rejected.
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  -- Object key in the public bucket while a published menu uses this file; null otherwise.
  public_key text unique,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, restaurant_id),
  constraint assets_kind_content_type check (
    (kind = 'glb' and content_type = 'model/gltf-binary')
    or (kind = 'usdz' and content_type = 'model/vnd.usdz+zip')
    or (kind = 'image' and content_type in ('image/webp', 'image/png', 'image/jpeg'))
  ),
  constraint assets_ready_has_size check (status <> 'ready' or byte_size is not null),
  constraint assets_public_only_when_ready check (public_key is null or status = 'ready')
);
create index assets_restaurant_id_idx on public.assets (restaurant_id);

alter table public.restaurants
  add constraint restaurants_logo_asset_fk
  foreign key (logo_asset_id, id) references public.assets (id, restaurant_id);

create table public.menu_categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, restaurant_id)
);
create index menu_categories_restaurant_idx on public.menu_categories (restaurant_id, position);

create table public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid not null,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 1 and 80),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text not null default '' check (char_length(description) <= 1000),
  -- Shown only when set.
  price numeric(10, 2) check (price >= 0),
  currency text not null default 'PKR' check (currency ~ '^[A-Z]{3}$'),
  position integer not null default 0,
  -- Hidden items stay in the admin but are left out of the next published snapshot.
  is_visible boolean not null default true,
  is_test_item boolean not null default false,
  glb_asset_id uuid,
  usdz_asset_id uuid,
  poster_asset_id uuid,
  thumbnail_asset_id uuid,
  -- model-viewer camera-orbit syntax, e.g. "20deg 78deg auto".
  camera_orbit text check (char_length(camera_orbit) <= 60),
  -- Bounding box of the model as served, in centimetres (ModelScale in src/catalog/types.ts).
  width_cm numeric(7, 2) check (width_cm > 0),
  height_cm numeric(7, 2) check (height_cm > 0),
  depth_cm numeric(7, 2) check (depth_cm > 0),
  scale_source text not null default 'file' check (scale_source in ('file', 'measured')),
  scale_verified boolean not null default false,
  lock_scale_in_ar boolean not null default true,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (restaurant_id, slug),
  constraint menu_items_verified_needs_measured check (not scale_verified or scale_source = 'measured'),
  -- Composite keys keep every reference inside the same restaurant.
  constraint menu_items_category_fk foreign key (category_id, restaurant_id) references public.menu_categories (id, restaurant_id),
  constraint menu_items_glb_fk foreign key (glb_asset_id, restaurant_id) references public.assets (id, restaurant_id),
  constraint menu_items_usdz_fk foreign key (usdz_asset_id, restaurant_id) references public.assets (id, restaurant_id),
  constraint menu_items_poster_fk foreign key (poster_asset_id, restaurant_id) references public.assets (id, restaurant_id),
  constraint menu_items_thumbnail_fk foreign key (thumbnail_asset_id, restaurant_id) references public.assets (id, restaurant_id)
);
create index menu_items_restaurant_idx on public.menu_items (restaurant_id, category_id, position);
create index menu_items_category_idx on public.menu_items (category_id);
create index menu_items_glb_asset_idx on public.menu_items (glb_asset_id) where glb_asset_id is not null;
create index menu_items_usdz_asset_idx on public.menu_items (usdz_asset_id) where usdz_asset_id is not null;
create index menu_items_poster_asset_idx on public.menu_items (poster_asset_id) where poster_asset_id is not null;
create index menu_items_thumbnail_asset_idx on public.menu_items (thumbnail_asset_id) where thumbnail_asset_id is not null;

-- Every publish, kept so a menu can be rolled back. Written only by publish_menu().
create table public.menu_versions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  version integer not null check (version > 0),
  snapshot jsonb not null,
  published_by uuid default auth.uid() references auth.users (id) on delete set null,
  published_at timestamptz not null default now(),
  unique (restaurant_id, version)
);

-- What customers see: one row per live restaurant. Deleting the row takes the menu offline.
create table public.published_menus (
  restaurant_id uuid primary key references public.restaurants (id) on delete cascade,
  slug text not null unique,
  version_id uuid not null references public.menu_versions (id),
  snapshot jsonb not null,
  published_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------
-- Authorization helpers (security definer so they can read the membership tables under RLS)
-- ---------------------------------------------------------------------------------------------

create function private.is_platform_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;

create function private.can_view_restaurant(p_restaurant_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select private.is_platform_admin() or exists (
    select 1 from public.restaurant_members
    where restaurant_id = p_restaurant_id and user_id = (select auth.uid())
  );
$$;

create function private.can_edit_restaurant(p_restaurant_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select private.is_platform_admin() or exists (
    select 1 from public.restaurant_members
    where restaurant_id = p_restaurant_id and user_id = (select auth.uid()) and role in ('owner', 'editor')
  );
$$;

-- ---------------------------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------------------------

create function private.touch_updated_at()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger restaurants_touch before update on public.restaurants
  for each row execute function private.touch_updated_at();
create trigger menu_categories_touch before update on public.menu_categories
  for each row execute function private.touch_updated_at();
create trigger menu_items_touch before update on public.menu_items
  for each row execute function private.touch_updated_at();
create trigger assets_touch before update on public.assets
  for each row execute function private.touch_updated_at();

-- Each asset slot only accepts the right kind of file (e.g. no image in the GLB slot).
create function private.asset_has_kind(p_asset_id uuid, p_kind text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_asset_id is null or exists (select 1 from public.assets where id = p_asset_id and kind = p_kind);
$$;

create function private.check_menu_item_asset_kinds()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if not private.asset_has_kind(new.glb_asset_id, 'glb') then
    raise exception 'glb_asset_id must point to a GLB file' using errcode = '23514';
  end if;
  if not private.asset_has_kind(new.usdz_asset_id, 'usdz') then
    raise exception 'usdz_asset_id must point to a USDZ file' using errcode = '23514';
  end if;
  if not private.asset_has_kind(new.poster_asset_id, 'image') then
    raise exception 'poster_asset_id must point to an image' using errcode = '23514';
  end if;
  if not private.asset_has_kind(new.thumbnail_asset_id, 'image') then
    raise exception 'thumbnail_asset_id must point to an image' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger menu_items_asset_kinds before insert or update on public.menu_items
  for each row execute function private.check_menu_item_asset_kinds();

create function private.check_restaurant_logo_kind()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if not private.asset_has_kind(new.logo_asset_id, 'image') then
    raise exception 'logo_asset_id must point to an image' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger restaurants_logo_kind before insert or update of logo_asset_id on public.restaurants
  for each row execute function private.check_restaurant_logo_kind();

-- ---------------------------------------------------------------------------------------------
-- Publishing
-- ---------------------------------------------------------------------------------------------

-- Validates a restaurant's draft menu and makes it live as a frozen snapshot. The app copies the
-- needed files to the public bucket (setting assets.public_key) before calling this.
-- Security definer so snapshots can only be written through here, never directly.
create function public.publish_menu(p_restaurant_id uuid)
returns public.published_menus
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.restaurants;
  problems text[];
  snap jsonb;
  next_version integer;
  new_version_id uuid;
  result public.published_menus;
begin
  if not private.can_edit_restaurant(p_restaurant_id) then
    raise exception 'Not allowed to publish this restaurant' using errcode = '42501';
  end if;

  -- Lock the restaurant row so two publishes can't interleave.
  select * into r from public.restaurants where id = p_restaurant_id for update;
  if not found then
    raise exception 'Restaurant not found' using errcode = 'P0002';
  end if;

  -- What would go live: visible items in visible categories, and every file they use.
  with live as (
    select i.*
    from public.menu_items i
    join public.menu_categories c on c.id = i.category_id
    where i.restaurant_id = r.id and i.is_visible and c.is_visible
  ),
  refs (label, slot, asset_id) as (
    select format('item "%s"', l.slug), x.slot, x.asset_id
    from live l
    cross join lateral (values
      ('GLB', l.glb_asset_id), ('USDZ', l.usdz_asset_id),
      ('poster', l.poster_asset_id), ('thumbnail', l.thumbnail_asset_id)
    ) as x (slot, asset_id)
    where x.asset_id is not null
    union all
    select 'restaurant', 'logo', r.logo_asset_id where r.logo_asset_id is not null
  )
  select array_agg(problem order by problem) into problems
  from (
    select format('item "%s": needs a GLB or USDZ model', slug) as problem
    from live where glb_asset_id is null and usdz_asset_id is null
    union all
    select format('item "%s": needs width, height and depth in cm', slug)
    from live where width_cm is null or height_cm is null or depth_cm is null
    union all
    select format('%s: %s file has not been uploaded and checked', refs.label, refs.slot)
    from refs join public.assets a on a.id = refs.asset_id where a.status <> 'ready'
    union all
    select format('%s: %s file has not been copied to the public bucket', refs.label, refs.slot)
    from refs join public.assets a on a.id = refs.asset_id where a.status = 'ready' and a.public_key is null
  ) p;

  if problems is not null then
    raise exception 'This menu can''t be published yet'
      using errcode = 'P0001', detail = array_to_string(problems, E'\n');
  end if;

  -- Same shape as the Restaurant type in src/catalog/types.ts. File fields hold public-bucket
  -- keys, not URLs, so the asset domain can change without republishing.
  snap := jsonb_strip_nulls(jsonb_build_object(
    'schemaVersion', 1,
    'slug', r.slug,
    'name', r.name,
    'catalogTitle', r.catalog_title,
    'accent', r.accent,
    'indexable', r.indexable,
    'logo', (select a.public_key from public.assets a where a.id = r.logo_asset_id),
    'categories', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name) order by c.position, c.created_at)
      from public.menu_categories c
      where c.restaurant_id = r.id and c.is_visible
    ), '[]'::jsonb),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
          'slug', i.slug,
          'name', i.name,
          'description', i.description,
          'category', i.category_id,
          'price', case when i.price is not null then jsonb_build_object('amount', i.price, 'currency', i.currency) end,
          'isTestItem', i.is_test_item,
          'thumbnail', th.public_key,
          'model', jsonb_build_object('glb', glb.public_key, 'usdz', usdz.public_key, 'poster', po.public_key, 'cameraOrbit', i.camera_orbit),
          'scale', jsonb_build_object(
            'dimensionsCm', jsonb_build_object('width', i.width_cm, 'height', i.height_cm, 'depth', i.depth_cm),
            'source', i.scale_source,
            'verified', i.scale_verified,
            'lockScaleInAR', i.lock_scale_in_ar
          )
        ) order by c.position, c.created_at, i.position, i.created_at)
      from public.menu_items i
      join public.menu_categories c on c.id = i.category_id
      left join public.assets glb on glb.id = i.glb_asset_id
      left join public.assets usdz on usdz.id = i.usdz_asset_id
      left join public.assets po on po.id = i.poster_asset_id
      left join public.assets th on th.id = i.thumbnail_asset_id
      where i.restaurant_id = r.id and i.is_visible and c.is_visible
    ), '[]'::jsonb)
  ));

  select coalesce(max(v.version), 0) + 1 into next_version
  from public.menu_versions v where v.restaurant_id = r.id;
  snap := snap || jsonb_build_object('version', next_version);

  insert into public.menu_versions (restaurant_id, version, snapshot)
  values (r.id, next_version, snap)
  returning id into new_version_id;

  insert into public.published_menus (restaurant_id, slug, version_id, snapshot, published_at)
  values (r.id, r.slug, new_version_id, snap, now())
  on conflict (restaurant_id) do update
    set slug = excluded.slug,
        version_id = excluded.version_id,
        snapshot = excluded.snapshot,
        published_at = excluded.published_at
  returning * into result;

  return result;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Privileges. Supabase grants everything on public tables to anon and authenticated by default;
-- narrow that to exactly what each role needs, then let RLS decide which rows.
-- ---------------------------------------------------------------------------------------------

revoke all on table
  public.platform_admins, public.restaurants, public.restaurant_members, public.assets,
  public.menu_categories, public.menu_items, public.menu_versions, public.published_menus
from anon, authenticated;

grant select on public.platform_admins to authenticated;
grant select, insert, update, delete on
  public.restaurants, public.restaurant_members, public.assets, public.menu_categories, public.menu_items
to authenticated;
grant select on public.menu_versions to authenticated;
grant select on public.published_menus to anon, authenticated;
grant delete on public.published_menus to authenticated;

revoke all on all functions in schema private from public, anon, authenticated;
grant execute on function
  private.is_platform_admin(), private.can_view_restaurant(uuid), private.can_edit_restaurant(uuid),
  private.asset_has_kind(uuid, text)
to authenticated;

revoke all on function public.publish_menu(uuid) from public, anon, authenticated;
grant execute on function public.publish_menu(uuid) to authenticated;

-- ---------------------------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------------------------

alter table public.platform_admins enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_members enable row level security;
alter table public.assets enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.menu_versions enable row level security;
alter table public.published_menus enable row level security;

-- platform_admins: you can see your own row (how the app knows you're an admin). No writes.
create policy "Read own admin row" on public.platform_admins
  for select to authenticated using (user_id = (select auth.uid()));

-- restaurants
create policy "Members read their restaurants" on public.restaurants
  for select to authenticated using (private.can_view_restaurant(id));
create policy "Platform admins create restaurants" on public.restaurants
  for insert to authenticated with check ((select private.is_platform_admin()));
create policy "Editors update their restaurants" on public.restaurants
  for update to authenticated
  using (private.can_edit_restaurant(id)) with check (private.can_edit_restaurant(id));
create policy "Platform admins delete restaurants" on public.restaurants
  for delete to authenticated using ((select private.is_platform_admin()));

-- restaurant_members: visible to members; only platform admins change membership.
create policy "Members read membership" on public.restaurant_members
  for select to authenticated using (private.can_view_restaurant(restaurant_id));
create policy "Platform admins add members" on public.restaurant_members
  for insert to authenticated with check ((select private.is_platform_admin()));
create policy "Platform admins change members" on public.restaurant_members
  for update to authenticated
  using ((select private.is_platform_admin())) with check ((select private.is_platform_admin()));
create policy "Platform admins remove members" on public.restaurant_members
  for delete to authenticated using ((select private.is_platform_admin()));

-- assets, menu_categories, menu_items: members read, editors write.
create policy "Members read assets" on public.assets
  for select to authenticated using (private.can_view_restaurant(restaurant_id));
create policy "Editors add assets" on public.assets
  for insert to authenticated with check (private.can_edit_restaurant(restaurant_id));
create policy "Editors change assets" on public.assets
  for update to authenticated
  using (private.can_edit_restaurant(restaurant_id)) with check (private.can_edit_restaurant(restaurant_id));
create policy "Editors remove assets" on public.assets
  for delete to authenticated using (private.can_edit_restaurant(restaurant_id));

create policy "Members read categories" on public.menu_categories
  for select to authenticated using (private.can_view_restaurant(restaurant_id));
create policy "Editors add categories" on public.menu_categories
  for insert to authenticated with check (private.can_edit_restaurant(restaurant_id));
create policy "Editors change categories" on public.menu_categories
  for update to authenticated
  using (private.can_edit_restaurant(restaurant_id)) with check (private.can_edit_restaurant(restaurant_id));
create policy "Editors remove categories" on public.menu_categories
  for delete to authenticated using (private.can_edit_restaurant(restaurant_id));

create policy "Members read items" on public.menu_items
  for select to authenticated using (private.can_view_restaurant(restaurant_id));
create policy "Editors add items" on public.menu_items
  for insert to authenticated with check (private.can_edit_restaurant(restaurant_id));
create policy "Editors change items" on public.menu_items
  for update to authenticated
  using (private.can_edit_restaurant(restaurant_id)) with check (private.can_edit_restaurant(restaurant_id));
create policy "Editors remove items" on public.menu_items
  for delete to authenticated using (private.can_edit_restaurant(restaurant_id));

-- menu_versions: members read history; rows are written only by publish_menu().
create policy "Members read menu history" on public.menu_versions
  for select to authenticated using (private.can_view_restaurant(restaurant_id));

-- published_menus: anyone can read what's live; editors can take their menu offline.
create policy "Anyone reads published menus" on public.published_menus
  for select to anon, authenticated using (true);
create policy "Editors unpublish their menus" on public.published_menus
  for delete to authenticated using (private.can_edit_restaurant(restaurant_id));
