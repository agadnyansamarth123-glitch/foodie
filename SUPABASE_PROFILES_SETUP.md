# Supabase: profiles table (manual setup)

Follow these steps in the [Supabase Dashboard](https://supabase.com/dashboard) for your project.

## Step 1 — Open the SQL Editor

1. Select your project.
2. In the left sidebar, click **SQL Editor**.
3. Click **New query**.

## Step 2 — Run the SQL script

1. Open the file `supabase/profiles_setup.sql` in this repo (or copy its full contents).
2. Paste the SQL into the editor.
3. Click **Run** (or press the shortcut shown in the dashboard).

You should see **Success** with no errors. This creates:

- Table `public.profiles` with columns: `id`, `username`, `avatar_url`, `bio`, `created_at`
- **Row Level Security (RLS)** enabled
- Policies:
  - **Insert:** authenticated users can insert **only** a row where `id = auth.uid()`
  - **Select:** everyone can read all profiles (`using (true)`)
  - **Update:** authenticated users can update **only** their own row

## Step 3 — Confirm the table

1. Go to **Table Editor** in the sidebar.
2. Open the **`profiles`** table.
3. You should see the columns listed above (the table will be empty until users sign up).

## Step 4 — Environment variables (already used by the app)

Ensure your Vite app has (in `.env` or `.env.local`):

- `VITE_SUPABASE_URL` — **Project Settings → API → Project URL**
- `VITE_SUPABASE_KEY` — **Project Settings → API → anon public** key

Restart `pnpm dev` after changing env vars.

## Optional: test insert from the dashboard

With RLS, inserts from the SQL Editor run as a privileged role, not as a user JWT. To test from the app, use **Sign Up** in your React app after this SQL is applied.

## Email confirmation vs profile insert

The app inserts into `profiles` **right after** `signUp`, using the **authenticated session** returned when signup completes.

- If **Confirm email** is enabled (**Authentication → Providers → Email**), Supabase may **not** return a session until the user confirms. Then the insert can fail with an RLS error because there is no JWT yet.
- For local development, you can **disable** “Confirm email” so signup returns a session immediately and the profile insert succeeds.

## Troubleshooting

- **insert violates foreign key** — The `id` must exist in `auth.users` (only insert right after `signUp` with the returned `user.id`).
- **new row violates row-level security policy** — Ensure the user is logged in (`authenticated`) and `id` in the insert equals `auth.uid()`. If email confirmation is on, confirm the email first or disable confirmation for testing.
- **duplicate key username** — `username` is unique; pick another username.
