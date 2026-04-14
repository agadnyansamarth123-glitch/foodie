-- =============================================================================
-- FoodGuard: posts table + view + RLS policies
-- Run this in Supabase: SQL Editor → New query → paste → Run
-- =============================================================================

-- Required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1) Table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text,
  image_url text,
  created_at timestamptz not null default now(),
  constraint posts_content_or_image_check
    check (
      (content is not null and length(btrim(content)) > 0)
      or
      (image_url is not null and length(btrim(image_url)) > 0)
    )
);

create index if not exists posts_user_id_idx on public.posts (user_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- 2) Row Level Security
alter table public.posts enable row level security;

-- 3) Policies (drop first if you re-run this script during development)
drop policy if exists "Users can insert own posts" on public.posts;
drop policy if exists "Posts are readable by everyone" on public.posts;
drop policy if exists "Users can delete own posts" on public.posts;

create policy "Users can insert own posts"
  on public.posts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Posts are readable by everyone"
  on public.posts
  for select
  using (true);

create policy "Users can delete own posts"
  on public.posts
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 4) View for easy fetching with usernames
-- This keeps posts.user_id referencing auth.users as requested,
-- while still letting the frontend read username via a simple select.
create or replace view public.posts_with_profiles as
select
  p.id,
  p.user_id,
  p.content,
  p.image_url,
  p.created_at,
  pr.username,
  pr.avatar_url
from public.posts p
left join public.profiles pr on pr.id = p.user_id;

