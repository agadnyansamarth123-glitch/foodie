# Comments Setup

## IMPORTANT: Run Updated SQL Script + Fix

**The comments setup has been updated! Please re-run the SQL script in Supabase:**

1. Go to Supabase → SQL Editor
2. Copy and paste the **updated** contents of `supabase/comments_setup.sql`
3. Click "Run" to execute the script

**Key Changes:**
- The `user_id` now references `public.profiles(id)` instead of `auth.users(id)`
- RLS policies are properly configured for read access

### If Comments Still Don't Show (RLS Fix):

If comments are being added but not visible, run this additional SQL:

```sql
-- Drop and recreate the SELECT policy to ensure it works
drop policy if exists "Comments are readable by everyone" on public.comments;

create policy "Comments are readable by everyone"
on public.comments
for select
using (true);
```

This ensures the Row Level Security allows everyone to read comments
- RLS policies are properly configured for read access

### If Comments Still Don't Show (RLS Fix):

If comments are being added but not visible, run this additional SQL:

```sql
-- Drop and recreate the SELECT policy to ensure it works
drop policy if exists "Comments are readable by everyone" on public.comments;

create policy "Comments are readable by everyone"
on public.comments
for select
using (true);
```

This ensures the Row Level Security allows everyone to read comments.

## Features Added

- **Comment Button**: 💬 button in post actions shows comment count and focuses input
- **Instagram/Twitter-style Display**:
  - Shows first 2 comments initially
  - "View all X comments" button if there are more than 2
  - "Show less" button to collapse comments back
- **Comment Input**: Authenticated users can add comments with Enter key or Post button
- **Comment Management**: Users can delete their own comments (✕ button)
- **Real-time Updates**: Comments reload after adding new ones

## UI Flow

1. **Post Actions**: Like (❤️/🤍) and Comment (💬) buttons with counts
2. **Comments Section**: Below post content, shows 2 comments initially
3. **Expand/Collapse**: "View all X comments" / "Show less" buttons
4. **Add Comment**: Input field at bottom (authenticated users only)
5. **Delete Comments**: Small ✕ button on user's own comments

## API Endpoints

The comments functionality uses:
- `INSERT` into `comments` table (authenticated users)
- `SELECT` from `comments` with profile join (public read)
- `DELETE` from `comments` (comment owner only)

## Database Schema

```sql
comments:
- id: uuid (primary key)
- user_id: uuid → profiles.id (foreign key)
- post_id: uuid → posts.id (foreign key)
- content: text (not null)
- created_at: timestamptz
```

This ensures proper relationships and enables efficient joins for displaying comments with user profiles.