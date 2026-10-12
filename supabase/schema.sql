-- ============================================================
--  DEC Portal – Clean Install
--  Run AFTER manually deleting any old tables in Table Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Tables ───────────────────────────────────────────────

CREATE TABLE branches (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  code       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE semesters (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id  UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  number     INTEGER NOT NULL CHECK (number BETWEEN 1 AND 8),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(branch_id, number)
);

CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  semester_id UUID NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  code        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE submissions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id   UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('notes', 'pyq')),
  title        TEXT NOT NULL,
  gdrive_link  TEXT NOT NULL,
  submitted_by TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Seed Data ─────────────────────────────────────────────

INSERT INTO branches (name, code) VALUES
  ('Computer Science Engineering', 'CSE'),
  ('Civil Engineering',            'CE'),
  ('Mechanical Engineering',       'ME');

INSERT INTO semesters (branch_id, number)
SELECT b.id, g
FROM   branches b
CROSS  JOIN generate_series(1, 8) AS g;

-- ─── Row Level Security ────────────────────────────────────

ALTER TABLE branches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters   ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects    ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Branches: public read, admin full access
CREATE POLICY "branches_read"  ON branches FOR SELECT USING (true);
CREATE POLICY "branches_admin" ON branches FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Semesters: public read, admin full access
CREATE POLICY "semesters_read"  ON semesters FOR SELECT USING (true);
CREATE POLICY "semesters_admin" ON semesters FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Subjects: public read, admin full access
CREATE POLICY "subjects_read"  ON subjects FOR SELECT USING (true);
CREATE POLICY "subjects_admin" ON subjects FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Submissions:
--   Public  → approved only
--   Admin   → all rows
--   Anyone  → insert pending submissions
--   Admin   → update / delete
CREATE POLICY "submissions_read"   ON submissions FOR SELECT
  USING (status = 'approved' OR (SELECT auth.role()) = 'authenticated');

CREATE POLICY "submissions_insert" ON submissions FOR INSERT
  WITH CHECK (status = 'pending');

CREATE POLICY "submissions_update" ON submissions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "submissions_delete" ON submissions FOR DELETE
  TO authenticated USING (true);
