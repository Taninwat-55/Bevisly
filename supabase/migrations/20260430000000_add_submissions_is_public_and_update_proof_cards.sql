-- Migration: Add is_public to submissions + expand proof_cards view

-- 1. Add is_public column to submissions (fixes the public/private toggle in the vault)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- 2. Drop and recreate proof_cards view with expanded columns
DROP VIEW IF EXISTS proof_cards;

CREATE VIEW proof_cards AS
SELECT
  s.id AS submission_id,
  s.id AS id,
  s.user_id,
  p.full_name AS candidate_name,
  p.username,
  j.title AS job_title,
  COALESCE(c.name, p.company_name) AS company_name,
  pt.title AS task_title,
  f.stars AS rating,
  f.comments,
  f.strengths,
  f.improvements,
  f.created_at AS reviewed_at,
  COALESCE(s.is_public, false) AS is_public,
  'https://bevisly.app/proof/' || s.id AS share_url
FROM submissions s
JOIN profiles p ON s.user_id = p.id
JOIN jobs j ON s.job_id = j.id
LEFT JOIN companies c ON j.company_id = c.id
LEFT JOIN proof_tasks pt ON s.proof_task_id = pt.id
LEFT JOIN feedback f ON f.submission_id = s.id
WHERE s.status = 'reviewed';
