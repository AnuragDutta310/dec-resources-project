-- ============================================================
--  FIX: Admin access broken due to circular RLS policy
--  Run this in SQL Editor on your NEW Supabase project
-- ============================================================

-- Fix the circular policy: allow any authenticated user to READ admin_users
-- (It only contains UUIDs — no sensitive data. The app checks membership.)
DROP POLICY IF EXISTS "admin_users_read" ON admin_users;
CREATE POLICY "admin_users_read" ON admin_users FOR SELECT
  TO authenticated USING (true);

-- Show your current user ID so we can verify it's in the table
-- Check the "Results" tab after running this:
SELECT id, email, created_at FROM auth.users;

-- Show what's currently in admin_users:
SELECT * FROM admin_users;
