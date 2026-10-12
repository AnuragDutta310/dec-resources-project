-- ============================================================
--  COMPLETE FIX — Run this once in SQL Editor
--  Supabase project: zuswrlcjcesjkeofrtrj
-- ============================================================

-- ─── 1. Fix admin_users: clear old data + add YOUR user ID ───

-- First, find your user ID from auth.users
DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users LIMIT 1;
  IF v_uid IS NOT NULL THEN
    DELETE FROM admin_users;
    INSERT INTO admin_users (user_id) VALUES (v_uid);
    RAISE NOTICE 'Admin user set: %', v_uid;
  ELSE
    RAISE NOTICE 'No users found in auth.users! Create one first.';
  END IF;
END $$;

-- ─── 2. Fix admin_users RLS (circular policy bug) ───

DROP POLICY IF EXISTS "admin_users_read" ON admin_users;
CREATE POLICY "admin_users_read" ON admin_users FOR SELECT
  TO authenticated USING (true);

-- ─── 3. Create profiles table (for student accounts) ───

CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_own_insert" ON profiles;
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── 4. Add user_id column to submissions (for tracking) ───

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- ─── 5. Fix submissions read policy (users see their own) ───

DROP POLICY IF EXISTS "submissions_read" ON submissions;
CREATE POLICY "submissions_read" ON submissions FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() IN (SELECT user_id FROM admin_users)
    OR (auth.uid() IS NOT NULL AND auth.uid() = submissions.user_id)
  );

-- ─── DONE. Verify: ───
SELECT 'admin_users' AS tbl, count(*) FROM admin_users
UNION ALL
SELECT 'profiles', count(*) FROM profiles
UNION ALL
SELECT 'branches', count(*) FROM branches
UNION ALL
SELECT 'semesters', count(*) FROM semesters;
