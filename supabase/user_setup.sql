-- ============================================================
--  Student Accounts Setup
--  Run this in SQL Editor AFTER schema.sql and admin_setup.sql
-- ============================================================

-- Profiles table (stores username for each auth user)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles (to show usernames publicly)
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (true);

-- Users can insert their own profile on signup
CREATE POLICY "profiles_own_insert" ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "profiles_own_update" ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add user_id column to submissions (nullable — guests can still submit)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update submissions read policy: users can also see their OWN submissions (any status)
DROP POLICY IF EXISTS "submissions_read" ON submissions;
CREATE POLICY "submissions_read" ON submissions FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() IN (SELECT user_id FROM admin_users)
    OR (auth.uid() IS NOT NULL AND auth.uid() = submissions.user_id)
  );
