-- ============================================================
--  Subject Approval & Creation System
--  Run this in Supabase SQL Editor
-- ============================================================

-- 1. Add is_approved column to subjects table (defaults to false for new ones)
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;

-- Mark any existing subjects as approved
UPDATE subjects SET is_approved = true;

-- 2. Reset policies on subjects table
DROP POLICY IF EXISTS "subjects_read" ON subjects;
DROP POLICY IF EXISTS "subjects_public_read" ON subjects;
DROP POLICY IF EXISTS "subjects_admin" ON subjects;
DROP POLICY IF EXISTS "subjects_insert" ON subjects;
DROP POLICY IF EXISTS "subjects_admin_update" ON subjects;
DROP POLICY IF EXISTS "subjects_admin_delete" ON subjects;

-- Public can ONLY see approved subjects (main page / browse)
-- Admins can see all subjects (including pending ones)
CREATE POLICY "subjects_read" ON subjects FOR SELECT
  USING (is_approved = true OR (SELECT auth.role()) = 'authenticated');

-- Anyone (students, visitors) can create a new subject, but only as unapproved (is_approved = false)
-- Admins can create pre-approved subjects
CREATE POLICY "subjects_insert" ON subjects FOR INSERT
  WITH CHECK (is_approved = false OR auth.uid() IN (SELECT user_id FROM admin_users));

-- Only admins can edit/rename subjects or set is_approved = true
CREATE POLICY "subjects_admin_update" ON subjects FOR UPDATE TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- Only admins can delete subjects
CREATE POLICY "subjects_admin_delete" ON subjects FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));
