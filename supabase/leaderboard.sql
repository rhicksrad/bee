-- ============================================================
-- Flying Clinic Cat leaderboard
-- Run this once in Supabase: SQL Editor -> New query -> Run.
-- (Also included in schema.sql for fresh installs.)
-- ============================================================

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  initials text not null check (initials ~ '^[A-Z0-9]{3}$'),
  score int not null check (score between 1 and 999),
  created_at timestamptz not null default now()
);

create index if not exists scores_rank_idx on public.scores (score desc, created_at asc);

alter table public.scores enable row level security;

drop policy if exists "public reads scores" on public.scores;
create policy "public reads scores"
  on public.scores for select
  using (true);

drop policy if exists "anyone submits scores" on public.scores;
create policy "anyone submits scores"
  on public.scores for insert
  with check (true);

drop policy if exists "admin deletes scores" on public.scores;
create policy "admin deletes scores"
  on public.scores for delete to authenticated
  using (public.is_admin());
