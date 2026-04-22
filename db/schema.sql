PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  question TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'web',
  status TEXT NOT NULL DEFAULT 'received',
  stored_in TEXT NOT NULL DEFAULT 'db'
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  problem_type TEXT NOT NULL,
  problem_type_label TEXT NOT NULL,
  curriculum TEXT,
  curriculum_label TEXT,
  subject TEXT NOT NULL,
  subject_key TEXT,
  subject_other TEXT,
  incident_date TEXT NOT NULL,
  description TEXT NOT NULL,
  follow_up INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'web',
  status TEXT NOT NULL DEFAULT 'received',
  stored_in TEXT NOT NULL DEFAULT 'db'
);

CREATE TABLE IF NOT EXISTS report_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  stored INTEGER NOT NULL DEFAULT 0,
  stored_path TEXT,
  reason TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_evidence_report_id ON report_evidence(report_id);
