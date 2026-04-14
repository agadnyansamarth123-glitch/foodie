-- =============================================================================
-- FoodGuard: profiles table + Row Level Security
-- Run this in Supabase: SQL Editor → New query → paste → Run
-- =============================================================================

-- 1) Table
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'App user profiles linked to auth.users';

-- 2) Row Level Security
alter table public.profiles enable row level security;

-- 3) Policies (drop first if you re-run this script during development)
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Profiles are readable by everyone" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Signed-in users can create exactly their own row (id must match auth.uid())
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Anyone (including anonymous) can read profiles — adjust if you want login-only reads
create policy "Profiles are readable by everyone"
  on public.profiles
  for select
  using (true);

-- Users can only change their own profile
create policy "Users can update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
