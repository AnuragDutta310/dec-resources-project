-- ============================================================
--  Fix: Allow students & guests to add new subjects during submission
--  Run this in Supabase SQL Editor
-- ============================================================

-- Drop old restrictive policy that prevented non-admins from inserting subjects
DROP POLICY IF EXISTS "subjects_admin" ON subjects;
DROP POLICY IF EXISTS "subjects_insert" ON subjects;
DROP POLICY IF EXISTS "subjects_admin_update" ON subjects;
DROP POLICY IF EXISTS "subjects_admin_delete" ON subjects;

-- 1. Anyone can view subjects
DROP POLICY IF EXISTS "subjects_read" ON subjects;
CREATE POLICY "subjects_read" ON subjects FOR SELECT USING (true);

-- 2. Anyone (students, guests, admins) can create a new subject
CREATE POLICY "subjects_insert" ON subjects FOR INSERT WITH CHECK (true);

-- 3. Only admin can update/rename subjects
CREATE POLICY "subjects_admin_update" ON subjects FOR UPDATE TO authenticated
  USING  (auth.uid() IN (SELECT user_id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

-- 4. Only admin can delete subjects
CREATE POLICY "subjects_admin_delete" ON subjects FOR DELETE TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM admin_users));
