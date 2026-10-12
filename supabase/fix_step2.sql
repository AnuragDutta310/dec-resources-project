-- STEP 2: Run this AFTER step 1 succeeds
-- Fixes admin access + submission policies

DELETE FROM admin_users;
INSERT INTO admin_users (user_id) SELECT id FROM auth.users LIMIT 1;

DROP POLICY IF EXISTS "admin_users_read" ON admin_users;
CREATE POLICY "admin_users_read" ON admin_users FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "submissions_read" ON submissions;
CREATE POLICY "submissions_read" ON submissions FOR SELECT
  USING (
    status = 'approved'
    OR auth.uid() IN (SELECT user_id FROM admin_users)
    OR (auth.uid() IS NOT NULL AND auth.uid() = submissions.user_id)
  );
