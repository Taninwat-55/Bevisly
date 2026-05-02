-- Fix security advisors flagged in Supabase dashboard

-- 1. Enable RLS on ai_usage_logs
-- Edge functions access via service_role key which bypasses RLS, so no policies needed.
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- 2. Recreate proof_cards with security_invoker = true
-- All underlying tables have correct anon/auth policies, so this is safe:
--   submissions: "Public can view public submissions" (is_public = true)
--   profiles: "Public profiles are viewable by everyone"
--   jobs / proof_tasks: viewable by everyone
--   feedback: "Public can view feedback for public submissions"
DROP VIEW IF EXISTS public.proof_cards;
CREATE VIEW public.proof_cards WITH (security_invoker = true) AS
SELECT
  s.id AS submission_id,
  s.id,
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
  COALESCE(s.is_featured, false) AS is_featured,
  'https://bevisly.app/proof/' || s.id AS share_url
FROM submissions s
  JOIN profiles p ON s.user_id = p.id
  JOIN jobs j ON s.job_id = j.id
  LEFT JOIN companies c ON j.company_id = c.id
  LEFT JOIN proof_tasks pt ON s.proof_task_id = pt.id
  LEFT JOIN feedback f ON f.submission_id = s.id
WHERE s.status = 'reviewed';

-- 3. Recreate employer_job_summary with security_invoker = true
DROP VIEW IF EXISTS public.employer_job_summary;
CREATE VIEW public.employer_job_summary WITH (security_invoker = true) AS
SELECT
  j.id AS job_id,
  j.employer_id,
  j.company_id,
  j.title,
  count(s.id) AS submissions_count,
  avg(f.stars) AS avg_score
FROM jobs j
  LEFT JOIN submissions s ON j.id = s.job_id
  LEFT JOIN feedback f ON s.id = f.submission_id
GROUP BY j.id;
