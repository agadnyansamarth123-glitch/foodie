# Supabase: posts table + storage bucket (manual setup)

Follow these steps in the [Supabase Dashboard](https://supabase.com/dashboard) for your project.

## Step 1 — Run the SQL (posts table + RLS + view)

1. Select your project.
2. Go to **SQL Editor** → **New query**.
3. Open `supabase/posts_setup.sql` in this repo and copy the full contents.
4. Paste it into the SQL Editor and click **Run**.

This creates:

- `public.posts` table with a **check constraint**: at least one of `content` or `image_url` must exist
- RLS + policies:
  - insert: authenticated users can insert only their own posts
  - select: everyone can read posts
  - delete: users can delete only their own posts
- `public.posts_with_profiles` view to fetch posts with `username` + `avatar_url`

## Step 2 — Create the storage bucket for images

1. Go to **Storage** → **Buckets**.
2. Click **New bucket**.
3. Name it: **`posts`**
4. Toggle **Public bucket**: **ON**
5. Click **Create bucket**.

## Step 3 — Add storage policies (uploads/deletes)

Even with a public bucket, uploads still need policies.

1. Go to **SQL Editor** → **New query**
2. Paste and run this:

```sql
-- Allow public reads from the "posts" bucket
drop policy if exists "Public can read post images" on storage.objects;
create policy "Public can read post images"
  on storage.objects
  for select
  using (bucket_id = 'posts');

-- Allow authenticated users to upload into the "posts" bucket
drop policy if exists "Authenticated can upload post images" on storage.objects;
create policy "Authenticated can upload post images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'posts');

-- Allow users to delete only their own uploaded images
drop policy if exists "Users can delete own post images" on storage.objects;
create policy "Users can delete own post images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'posts' and owner = auth.uid());
```

## Step 4 — Restart the dev server

If you changed any Supabase settings or env vars, restart:

- stop `pnpm dev`
- run `pnpm dev` again

