-- ============================================================
--  Seed 'Other' as a subject for every semester
--  Run this in Supabase SQL Editor (optional, or visit /admin)
-- ============================================================

INSERT INTO subjects (semester_id, name)
SELECT s.id, 'Other'
FROM semesters s
WHERE NOT EXISTS (
  SELECT 1 FROM subjects sub WHERE sub.semester_id = s.id AND sub.name = 'Other'
);
