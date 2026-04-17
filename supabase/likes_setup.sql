-- =============================================================================
-- FoodGuard: likes table + Row Level Security
-- Run this in Supabase: SQL Editor → New query → paste → Run
-- =============================================================================

-- Required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) Table
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

create index if not exists likes_user_id_idx on public.likes (user_id);
create index if not exists likes_post_id_idx on public.likes (post_id);
create index if not exists likes_created_at_idx on public.likes (created_at desc);

-- 2) Row Level Security
alter table public.likes enable row level security;

-- 3) Policies (drop first if you re-run this script during development)
drop policy if exists "Users can insert own likes" on public.likes;
drop policy if exists "Likes are readable by everyone" on public.likes;
drop policy if exists "Users can delete own likes" on public.likes;

create policy "Users can insert own likes"
  on public.likes
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Likes are readable by everyone"
  on public.likes
  for select
  using (true);

create policy "Users can delete own likes"
  on public.likes
  for delete
  to authenticated
  using (auth.uid() = user_id);