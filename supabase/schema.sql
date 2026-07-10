-- ============================================================
-- A Vet From Persia — database schema
-- Run this in your Supabase project: SQL Editor -> New query
-- -> paste this whole file -> Run.
--
-- Safe to run multiple times: existing tables/policies are
-- kept or recreated cleanly.
-- ============================================================

-- ---------- Tables ----------

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  slug text not null unique,
  body text not null default '',
  cover_image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Anonymous' check (char_length(author_name) <= 80),
  question_text text not null check (char_length(question_text) between 1 and 2000),
  answer_text text,
  status text not null default 'pending' check (status in ('pending', 'answered', 'hidden')),
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  storage_path text,
  label text not null default '' check (char_length(label) <= 80),
  caption text not null default '' check (char_length(caption) <= 300),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Who is allowed to manage content. Only rows in this table can
-- write to the site, even if someone else creates an account.
create table if not exists public.admins (
  email text primary key
);

-- ---------- Helper: is the current user an admin? ----------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Keep posts.updated_at fresh on edit.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_touch_updated_at on public.posts;
create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function public.touch_updated_at();

-- ---------- Row Level Security ----------

alter table public.posts enable row level security;
alter table public.questions enable row level security;
alter table public.photos enable row level security;
alter table public.admins enable row level security;
-- No policies on admins: it is invisible/untouchable through the API.

-- Posts: everyone can read published; only the admin can manage.
drop policy if exists "public reads published posts" on public.posts;
create policy "public reads published posts"
  on public.posts for select
  using (published = true or public.is_admin());

drop policy if exists "admin inserts posts" on public.posts;
create policy "admin inserts posts"
  on public.posts for insert to authenticated
  with check (public.is_admin());

drop policy if exists "admin updates posts" on public.posts;
create policy "admin updates posts"
  on public.posts for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin deletes posts" on public.posts;
create policy "admin deletes posts"
  on public.posts for delete to authenticated
  using (public.is_admin());

-- Questions: anyone may submit a pending question with no answer.
-- Everyone can read answered ones; the admin sees and manages all.
drop policy if exists "anyone submits pending questions" on public.questions;
create policy "anyone submits pending questions"
  on public.questions for insert
  with check (
    status = 'pending'
    and answer_text is null
    and answered_at is null
  );

drop policy if exists "public reads answered questions" on public.questions;
create policy "public reads answered questions"
  on public.questions for select
  using (status = 'answered' or public.is_admin());

drop policy if exists "admin updates questions" on public.questions;
create policy "admin updates questions"
  on public.questions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin deletes questions" on public.questions;
create policy "admin deletes questions"
  on public.questions for delete to authenticated
  using (public.is_admin());

-- Photos: everyone can view; only the admin can manage.
drop policy if exists "public reads photos" on public.photos;
create policy "public reads photos"
  on public.photos for select
  using (true);

drop policy if exists "admin inserts photos" on public.photos;
create policy "admin inserts photos"
  on public.photos for insert to authenticated
  with check (public.is_admin());

drop policy if exists "admin updates photos" on public.photos;
create policy "admin updates photos"
  on public.photos for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin deletes photos" on public.photos;
create policy "admin deletes photos"
  on public.photos for delete to authenticated
  using (public.is_admin());

-- ---------- Storage bucket for uploaded images ----------

insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "public reads photo files" on storage.objects;
create policy "public reads photo files"
  on storage.objects for select
  using (bucket_id = 'photos');

drop policy if exists "admin uploads photo files" on storage.objects;
create policy "admin uploads photo files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.is_admin());

drop policy if exists "admin updates photo files" on storage.objects;
create policy "admin updates photo files"
  on storage.objects for update to authenticated
  using (bucket_id = 'photos' and public.is_admin());

drop policy if exists "admin deletes photo files" on storage.objects;
create policy "admin deletes photo files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.is_admin());

-- ---------- Grant admin access ----------

delete from public.admins where email = 'CHANGE_ME@example.com';

insert into public.admins (email)
values ('anaaghili15@gmail.com')
on conflict (email) do nothing;
