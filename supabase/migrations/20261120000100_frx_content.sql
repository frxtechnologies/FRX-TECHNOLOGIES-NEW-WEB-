-- FRX Technologies — content management migration (ADDITIVE ONLY)
--
-- Run once in the Supabase SQL editor (Project → SQL Editor → New query → paste
-- → Run). It is idempotent: safe to re-run. It never drops or rewrites existing
-- tables (inquiries, assistant_entries, founders) or storage objects.
--
-- What it adds
--   site_settings   key/value JSON for hero, about, contact, social, footer…
--   projects        portfolio items (cover + gallery images, URL, category)
--   technologies    technology list (logo upload or built-in icon key)
--   testimonials    owner-entered testimonials (admin-managed only)
--   reviews         visitor reviews: public may submit PENDING, only APPROVED are public
--   faqs            FAQ questions and answers
--   affiliations    genuine affiliations / certifications (empty until real ones are added)
--   services        optional overrides for the service pages (defaults live in code)
--   storage bucket  `media` — public read, admin-only write
--   throttle        flood guard on public inserts (reviews + inquiries)
--   founders        role correction (only rows still carrying the old roles)
--
-- Security model is unchanged: the app only holds the anon/publishable key. The
-- single trusted admin identity is the JWT email below (same as schema.sql).
-- There is no service-role key anywhere in the project.

-- ============================================================================
-- 0. helpers
-- ============================================================================
create or replace function public.frx_is_admin()
returns boolean
language sql
stable
as $$ select coalesce(auth.jwt() ->> 'email', '') = 'frx.technologies@gmail.com' $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 1. site_settings — one row per editable block (hero, about, contact, …)
-- ============================================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;

drop policy if exists "public can read site settings" on public.site_settings;
create policy "public can read site settings"
  on public.site_settings for select to anon, authenticated using (true);

drop policy if exists "admin can write site settings" on public.site_settings;
create policy "admin can write site settings"
  on public.site_settings for all to authenticated
  using (public.frx_is_admin()) with check (public.frx_is_admin());

-- ============================================================================
-- 2. generic published collections
--    (projects, technologies, testimonials, faqs, affiliations, services)
-- ============================================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  position int not null default 0,
  published boolean not null default false,
  title text not null check (char_length(title) between 1 and 120),
  category text not null default '' check (char_length(category) <= 60),
  description text not null default '' check (char_length(description) <= 1200),
  url text check (url is null or url ~* '^https?://'),
  cover_path text,
  gallery jsonb not null default '[]'::jsonb
);

create table if not exists public.technologies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  position int not null default 0,
  published boolean not null default true,
  name text not null check (char_length(name) between 1 and 60),
  category text not null default '' check (char_length(category) <= 60),
  logo_path text,
  icon_key text,
  url text check (url is null or url ~* '^https?://')
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  position int not null default 0,
  published boolean not null default false,
  name text not null check (char_length(name) between 1 and 80),
  designation text not null default '' check (char_length(designation) <= 80),
  company text not null default '' check (char_length(company) <= 80),
  text text not null check (char_length(text) between 10 and 1200),
  portrait_path text
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  position int not null default 0,
  published boolean not null default true,
  question text not null check (char_length(question) between 3 and 200),
  answer text not null check (char_length(answer) between 3 and 2000)
);

create table if not exists public.affiliations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  position int not null default 0,
  published boolean not null default false,
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '' check (char_length(description) <= 400),
  url text check (url is null or url ~* '^https?://'),
  logo_path text
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  position int not null default 0,
  published boolean not null default true,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 1 and 80),
  tagline text not null default '' check (char_length(tagline) <= 160),
  summary text not null default '' check (char_length(summary) <= 800),
  capabilities jsonb not null default '[]'::jsonb,
  use_cases jsonb not null default '[]'::jsonb
);

do $$
declare t text;
begin
  foreach t in array array['projects','technologies','testimonials','faqs','affiliations','services']
  loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (published = true or public.frx_is_admin())',
      t || '_public_read', t);

    execute format('drop policy if exists %I on public.%I', t || '_admin_write', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.frx_is_admin()) with check (public.frx_is_admin())',
      t || '_admin_write', t);

    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);

    execute format('create index if not exists %I on public.%I (published, position)', t || '_pub_pos_idx', t);
  end loop;
end $$;

-- ============================================================================
-- 3. reviews — visitors submit PENDING; only APPROVED are ever public
-- ============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 80),
  company text not null default '' check (char_length(company) <= 80),
  rating smallint not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 10 and 800),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  client_token uuid unique, -- idempotency: one form submission can never create two rows
  moderated_at timestamptz
);
create index if not exists reviews_status_idx on public.reviews (status, created_at desc);

alter table public.reviews enable row level security;

-- Column-level grants: an anonymous visitor can set ONLY these columns. Status,
-- moderated_at, id and created_at always take their defaults, so a visitor can
-- never publish their own review or read anyone else's.
revoke all on public.reviews from anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert (name, company, rating, text, client_token) on public.reviews to anon;
grant insert, update, delete on public.reviews to authenticated;

drop policy if exists "public can read approved reviews" on public.reviews;
create policy "public can read approved reviews"
  on public.reviews for select to anon, authenticated
  using (status = 'approved' or public.frx_is_admin());

drop policy if exists "visitors can submit pending reviews" on public.reviews;
create policy "visitors can submit pending reviews"
  on public.reviews for insert to anon, authenticated
  with check (status = 'pending');

drop policy if exists "admin can moderate reviews" on public.reviews;
create policy "admin can moderate reviews"
  on public.reviews for all to authenticated
  using (public.frx_is_admin()) with check (public.frx_is_admin());

-- ============================================================================
-- 4. flood guard for public inserts
--    Anyone holding the (public) key can call the REST API directly and skip
--    the website's own limiter; this caps how many rows non-admins can add in a
--    window. Args: max rows, window in minutes.
-- ============================================================================
create or replace function public.throttle_public_inserts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  max_rows integer := tg_argv[0]::integer;
  mins     integer := tg_argv[1]::integer;
  n        integer;
begin
  if public.frx_is_admin() then
    return new;
  end if;
  execute format(
    'select count(*) from %I.%I where created_at > now() - make_interval(mins => $1)',
    tg_table_schema, tg_table_name
  ) into n using mins;
  if n >= max_rows then
    raise exception 'Too many submissions right now. Please try again in a little while.' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists reviews_throttle on public.reviews;
create trigger reviews_throttle before insert on public.reviews
  for each row execute function public.throttle_public_inserts('30', '10');

drop trigger if exists inquiries_throttle on public.inquiries;
create trigger inquiries_throttle before insert on public.inquiries
  for each row execute function public.throttle_public_inserts('40', '10');

-- ============================================================================
-- 5. storage — `media` bucket (projects, technology logos, portraits, hero art)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public can view media" on storage.objects;
create policy "public can view media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "admin can upload media" on storage.objects;
create policy "admin can upload media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.frx_is_admin());

drop policy if exists "admin can update media" on storage.objects;
create policy "admin can update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.frx_is_admin());

drop policy if exists "admin can delete media" on storage.objects;
create policy "admin can delete media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.frx_is_admin());

-- ============================================================================
-- 6. founders — correct the roles (only rows still carrying an old role)
-- ============================================================================
update public.founders
   set role = 'Founder & CEO'
 where name = 'Feroze Mohiuddin' and role in ('Founder', 'CTO', 'Founder & CTO');

update public.founders
   set role = 'Co-Founder & Director'
 where name = 'Raaef Usman' and role in ('Co-Founder', 'CEO', 'Co-founder');
