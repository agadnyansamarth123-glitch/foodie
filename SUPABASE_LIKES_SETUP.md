# Supabase: likes table (manual setup)

Follow these steps in the [Supabase Dashboard](https://supabase.com/dashboard) for your project.

## Step 1 — Run the SQL (likes table + RLS)

1. Select your project.
2. Go to **SQL Editor** → **New query**.
3. Open `supabase/likes_setup.sql` in this repo and copy the full contents.
4. Paste it into the SQL Editor and click **Run**.

This creates:

- `public.likes` table with columns: `id`, `user_id`, `post_id`, `created_at`
- **Unique constraint** on `(user_id, post_id)` — one like per user per post
- RLS + policies:
  - insert: authenticated users can insert only their own likes
  - select: everyone can read likes
  - delete: users can delete only their own likes
- Indexes for performance on `user_id`, `post_id`, `created_at`

## Step 2 — Confirm the table

1. Go to **Table Editor** in the sidebar.
2. Open the **`likes`** table.
3. You should see the columns listed above (the table will be empty initially).