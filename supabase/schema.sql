-- FRX Technologies — admin panel schema
--
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query
-- → paste → Run). It is idempotent: safe to re-run if something changed.
--
-- Security model: the app only ever holds the *anon/publishable* key, in the
-- browser, in plain sight. Every table below relies on Row Level Security to
-- do the actual gatekeeping — the anon key can only do what a policy here
-- explicitly allows. There is no service-role key anywhere in this project.

-- ============================================================================
-- 0. One-time setup you must do by hand (this file cannot do it)
-- ============================================================================
-- Create the admin account: Authentication → Users → Add user →
--   email: frx.technologies@gmail.com, set a password, "Auto Confirm User" on.
-- That is the only account every policy below trusts.

-- ============================================================================
-- 1. INQUIRIES — contact form submissions
-- ============================================================================
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  goal text not null,
  project_type text not null,
  message text,
  status text not null default 'new' check (status in ('new', 'read', 'archived')),
  replied_at timestamptz,
  reply_subject text,
  reply_message text
);

-- Additive, so re-running this file against a table created before replies
-- existed doesn't fail.
alter table public.inquiries add column if not exists replied_at timestamptz;
alter table public.inquiries add column if not exists reply_subject text;
alter table public.inquiries add column if not exists reply_message text;

alter table public.inquiries enable row level security;

drop policy if exists "anyone can submit an inquiry" on public.inquiries;
create policy "anyone can submit an inquiry"
  on public.inquiries for insert
  to anon
  with check (true);

drop policy if exists "admin can read inquiries" on public.inquiries;
create policy "admin can read inquiries"
  on public.inquiries for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'frx.technologies@gmail.com');

drop policy if exists "admin can update inquiries" on public.inquiries;
create policy "admin can update inquiries"
  on public.inquiries for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'frx.technologies@gmail.com')
  with check (auth.jwt() ->> 'email' = 'frx.technologies@gmail.com');

drop policy if exists "admin can delete inquiries" on public.inquiries;
create policy "admin can delete inquiries"
  on public.inquiries for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'frx.technologies@gmail.com');

-- ============================================================================
-- 2. ASSISTANT_ENTRIES — the Quick Assistant's questions & answers
-- ============================================================================
create table if not exists public.assistant_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  position int not null default 0,
  question text not null,
  chip text not null,
  answer text not null,
  -- [{ "kind": "route" | "link", "label": "...", "href": "...", "external": bool }]
  actions jsonb not null default '[]'::jsonb,
  published boolean not null default true
);

alter table public.assistant_entries enable row level security;

drop policy if exists "anyone can read published entries" on public.assistant_entries;
create policy "anyone can read published entries"
  on public.assistant_entries for select
  to anon, authenticated
  using (published = true or auth.jwt() ->> 'email' = 'frx.technologies@gmail.com');

drop policy if exists "admin can write entries" on public.assistant_entries;
create policy "admin can write entries"
  on public.assistant_entries for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'frx.technologies@gmail.com')
  with check (auth.jwt() ->> 'email' = 'frx.technologies@gmail.com');

-- ============================================================================
-- 3. FOUNDERS — name, role and portrait, editable from the admin panel
-- ============================================================================
create table if not exists public.founders (
  id uuid primary key default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  position int not null default 0,
  name text not null,
  role text not null,
  image_path text -- storage object path in the `founders` bucket, or null
);

alter table public.founders enable row level security;

drop policy if exists "anyone can read founders" on public.founders;
create policy "anyone can read founders"
  on public.founders for select
  to anon, authenticated
  using (true);

drop policy if exists "admin can write founders" on public.founders;
create policy "admin can write founders"
  on public.founders for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'frx.technologies@gmail.com')
  with check (auth.jwt() ->> 'email' = 'frx.technologies@gmail.com');

-- Seed the two founders if the table is empty, so the admin panel has rows to
-- edit immediately instead of starting blank.
insert into public.founders (position, name, role, image_path)
select * from (values
  (0, 'Feroze Mohiuddin', 'Founder', null::text),
  (1, 'Raaef Usman', 'Co-Founder', null::text)
) as seed(position, name, role, image_path)
where not exists (select 1 from public.founders);

-- ============================================================================
-- 4. STORAGE — founder portraits
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('founders', 'founders', true)
on conflict (id) do nothing;

drop policy if exists "public can view founder portraits" on storage.objects;
create policy "public can view founder portraits"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'founders');

drop policy if exists "admin can upload founder portraits" on storage.objects;
create policy "admin can upload founder portraits"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'founders'
    and auth.jwt() ->> 'email' = 'frx.technologies@gmail.com'
  );

drop policy if exists "admin can update founder portraits" on storage.objects;
create policy "admin can update founder portraits"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'founders'
    and auth.jwt() ->> 'email' = 'frx.technologies@gmail.com'
  );

drop policy if exists "admin can delete founder portraits" on storage.objects;
create policy "admin can delete founder portraits"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'founders'
    and auth.jwt() ->> 'email' = 'frx.technologies@gmail.com'
  );

-- ============================================================================
-- 5. keep updated_at current
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at on public.assistant_entries;
create trigger set_updated_at
  before update on public.assistant_entries
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.founders;
create trigger set_updated_at
  before update on public.founders
  for each row execute function public.set_updated_at();
