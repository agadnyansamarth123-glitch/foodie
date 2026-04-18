-- =============================================================================
-- FoodGuard: comments table + RLS policies
-- Run this in Supabase: SQL Editor → New query → paste → Run
-- =============================================================================

-- Required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) Table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists comments_post_id_idx on public.comments (post_id);
create index if not exists comments_user_id_idx on public.comments (user_id);
create index if not exists comments_created_at_idx on public.comments (created_at desc);

-- 2) Row Level Security
alter table public.comments enable row level security;

-- 3) Policies (drop first if you re-run this script during development)
drop policy if exists "Users can insert own comments" on public.comments;
drop policy if exists "Comments are readable by everyone" on public.comments;
drop policy if exists "Users can delete own comments" on public.comments;

create policy "Users can insert own comments"
  on public.comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Comments are readable by everyone"
  on public.comments
  for select
  using (true);

create policy "Users can delete own comments"
  on public.comments
  for delete
  to authenticated
  using (auth.uid() = user_id);