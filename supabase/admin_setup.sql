-- ============================================================
--  Run this in SQL Editor AFTER the schema.sql has been run
--  This creates an admin_users table and locks down access to ONLY you
-- ============================================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write admin_users table
CREATE POLICY "admin_users_read" ON admin_users FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- Insert YOUR user ID as admin
INSERT INTO admin_users (user_id) VALUES ('57c2c87e-bfb3-4fa2-aa0e-d50045af8c60');

-- ─── Drop old policies and replace with admin-only ones ───

-- Branches
DROP POLICY IF EXISTS "branches_admin" ON branches;
CREATE POLICY "branches_admin" ON branches FOR ALL TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Semesters
DROP POLICY IF EXISTS "semesters_admin" ON semesters;
CREATE POLICY "semesters_admin" ON semesters FOR ALL TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Subjects
DROP POLICY IF EXISTS "subjects_admin" ON subjects;
CREATE POLICY "subjects_admin" ON subjects FOR ALL TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Submissions
DROP POLICY IF EXISTS "submissions_read" ON submissions;
CREATE POLICY "submissions_read" ON submissions FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() IN (SELECT user_id FROM admin_users)
  );

DROP POLICY IF EXISTS "submissions_update" ON submissions;
CREATE POLICY "submissions_update" ON submissions FOR UPDATE TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

DROP POLICY IF EXISTS "submissions_delete" ON submissions;
CREATE POLICY "submissions_delete" ON submissions FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));

-- submissions_insert stays the same (anyone can submit pending)
