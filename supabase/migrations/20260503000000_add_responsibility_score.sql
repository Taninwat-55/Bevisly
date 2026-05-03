-- ============================================================
-- Sprint #2: Responsibility Score + Candidate Reliability Score
-- Migration: 20260503000000_add_responsibility_score.sql
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. ADD MISSING COMPANY PROFILE COLUMNS
-- (Exist in TypeScript types + UserSettings UI but never migrated)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS mission     text,
  ADD COLUMN IF NOT EXISTS culture     text,
  ADD COLUMN IF NOT EXISTS website_url text;

-- ──────────────────────────────────────────────────────────────
-- 2. ADD SCORE COLUMNS
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS responsibility_score INTEGER;
-- NULL = "New" (no eligible submissions yet)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS reliability_score INTEGER;
-- NULL = never started any proof

CREATE INDEX IF NOT EXISTS idx_companies_responsibility_score
  ON public.companies (responsibility_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_profiles_reliability_score
  ON public.profiles (reliability_score DESC NULLS LAST);

-- ──────────────────────────────────────────────────────────────
-- 3. EMPLOYER RESPONSIBILITY SCORE FUNCTION
--
-- Three components (max 100 pts):
--   Response rate (50): reviewed / eligible × 50
--   Speed         (30): avg review days; ≤2d=30, ≤5d=22, ≤10d=12, >10d=0
--   Quality       (20): % of reviewed with stars + written feedback × 20
--
-- "Eligible" = reviewed OR (submitted AND completed_at ≤ NOW() - 7 days)
-- Returns NULL when eligible = 0 (brand new employer)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_responsibility_score(p_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_eligible_count   integer := 0;
  v_reviewed_count   integer := 0;
  v_response_pts     numeric := 0;
  v_speed_pts        numeric := 0;
  v_quality_pts      numeric := 0;
  v_avg_days         numeric;
  v_quality_count    integer := 0;
BEGIN
  -- Count eligible and reviewed submissions for this company
  SELECT
    COUNT(*) FILTER (
      WHERE s.status = 'reviewed'
         OR (s.status = 'submitted' AND s.completed_at <= NOW() - INTERVAL '7 days')
    ),
    COUNT(*) FILTER (WHERE s.status = 'reviewed')
  INTO v_eligible_count, v_reviewed_count
  FROM public.submissions s
  INNER JOIN public.jobs j ON j.id = s.job_id
  WHERE j.company_id = p_company_id;

  -- No eligible submissions → brand new employer, return NULL
  IF v_eligible_count = 0 THEN
    RETURN NULL;
  END IF;

  -- Response rate component (50 pts max)
  v_response_pts := (v_reviewed_count::numeric / v_eligible_count) * 50;

  -- Speed component (30 pts max): avg days from completed_at → feedback.created_at
  IF v_reviewed_count > 0 THEN
    SELECT AVG(
      EXTRACT(EPOCH FROM (f.created_at - s.completed_at)) / 86400.0
    )
    INTO v_avg_days
    FROM public.submissions s
    INNER JOIN public.jobs j ON j.id = s.job_id
    INNER JOIN public.feedback f ON f.submission_id = s.id
    WHERE j.company_id = p_company_id
      AND s.status = 'reviewed'
      AND s.completed_at IS NOT NULL
      AND f.created_at IS NOT NULL;

    IF v_avg_days IS NULL THEN
      v_speed_pts := 0;
    ELSIF v_avg_days <= 2 THEN
      v_speed_pts := 30;
    ELSIF v_avg_days <= 5 THEN
      v_speed_pts := 22;
    ELSIF v_avg_days <= 10 THEN
      v_speed_pts := 12;
    ELSE
      v_speed_pts := 0;
    END IF;
  END IF;

  -- Quality component (20 pts max): % of reviewed with written feedback
  IF v_reviewed_count > 0 THEN
    SELECT COUNT(*) FILTER (
      WHERE f.stars IS NOT NULL
        AND (f.strengths IS NOT NULL OR f.comments IS NOT NULL)
    )
    INTO v_quality_count
    FROM public.submissions s
    INNER JOIN public.jobs j ON j.id = s.job_id
    LEFT JOIN public.feedback f ON f.submission_id = s.id
    WHERE j.company_id = p_company_id
      AND s.status = 'reviewed';

    v_quality_pts := (v_quality_count::numeric / v_reviewed_count) * 20;
  END IF;

  RETURN LEAST(100, ROUND(v_response_pts + v_speed_pts + v_quality_pts)::integer);
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 4. CANDIDATE RELIABILITY SCORE FUNCTION
--
-- Two components (max 100 pts):
--   Completion rate (70): (submitted + reviewed) / total_started × 70
--   Profile completeness (30): full_name(10) + avatar_url(10) + username(10)
--
-- Returns NULL if never started any proof
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_reliability_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_total_started    integer := 0;
  v_completed_count  integer := 0;
  v_completion_pts   numeric := 0;
  v_profile_pts      integer := 0;
  v_full_name        text;
  v_avatar_url       text;
  v_username         text;
BEGIN
  SELECT COUNT(*) INTO v_total_started
  FROM public.submissions
  WHERE user_id = p_user_id;

  -- Never started any proof → return NULL
  IF v_total_started = 0 THEN
    RETURN NULL;
  END IF;

  SELECT COUNT(*) INTO v_completed_count
  FROM public.submissions
  WHERE user_id = p_user_id
    AND status IN ('submitted', 'reviewed');

  v_completion_pts := (v_completed_count::numeric / v_total_started) * 70;

  -- Profile completeness (30 pts)
  SELECT full_name, avatar_url, username
  INTO v_full_name, v_avatar_url, v_username
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_full_name IS NOT NULL AND v_full_name <> '' THEN
    v_profile_pts := v_profile_pts + 10;
  END IF;
  IF v_avatar_url IS NOT NULL THEN
    v_profile_pts := v_profile_pts + 10;
  END IF;
  IF v_username IS NOT NULL THEN
    v_profile_pts := v_profile_pts + 10;
  END IF;

  RETURN LEAST(100, ROUND(v_completion_pts)::integer + v_profile_pts);
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 5. TRIGGER FUNCTION: RESPONSIBILITY SCORE
-- Resolves company via submission → job → company_id
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_fn_update_responsibility_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'feedback' THEN
    SELECT j.company_id INTO v_company_id
    FROM public.submissions s
    INNER JOIN public.jobs j ON j.id = s.job_id
    WHERE s.id = NEW.submission_id;
  ELSIF TG_TABLE_NAME = 'submissions' THEN
    SELECT j.company_id INTO v_company_id
    FROM public.jobs j
    WHERE j.id = NEW.job_id;
  END IF;

  IF v_company_id IS NOT NULL THEN
    UPDATE public.companies
    SET responsibility_score = public.compute_responsibility_score(v_company_id)
    WHERE id = v_company_id;
  END IF;

  RETURN NEW;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 6. TRIGGER FUNCTION: RELIABILITY SCORE
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_fn_update_reliability_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_candidate_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'submissions' THEN
    v_candidate_id := NEW.user_id;
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    v_candidate_id := NEW.id;
  END IF;

  IF v_candidate_id IS NOT NULL THEN
    UPDATE public.profiles
    SET reliability_score = public.compute_reliability_score(v_candidate_id)
    WHERE id = v_candidate_id;
  END IF;

  RETURN NEW;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 7. TRIGGERS
-- ──────────────────────────────────────────────────────────────

-- Responsibility: feedback given (quality + speed)
DROP TRIGGER IF EXISTS trg_responsibility_score_on_feedback ON public.feedback;
CREATE TRIGGER trg_responsibility_score_on_feedback
  AFTER INSERT OR UPDATE OF stars, strengths, comments
  ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_update_responsibility_score();

-- Responsibility: submission status changes (ghosting detection)
DROP TRIGGER IF EXISTS trg_responsibility_score_on_submissions ON public.submissions;
CREATE TRIGGER trg_responsibility_score_on_submissions
  AFTER INSERT OR UPDATE OF status
  ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_update_responsibility_score();

-- Reliability: submission status changes
DROP TRIGGER IF EXISTS trg_reliability_score_on_submissions ON public.submissions;
CREATE TRIGGER trg_reliability_score_on_submissions
  AFTER INSERT OR UPDATE OF status
  ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_update_reliability_score();

-- Reliability: profile completeness fields change
-- Safe: trigger body only updates reliability_score (not in this trigger's column list)
DROP TRIGGER IF EXISTS trg_reliability_score_on_profiles ON public.profiles;
CREATE TRIGGER trg_reliability_score_on_profiles
  AFTER UPDATE OF full_name, avatar_url, username
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_update_reliability_score();

-- ──────────────────────────────────────────────────────────────
-- 8. RLS: MAKE COMPANIES PUBLICLY READABLE
-- Required for the public Employer Brand Page (/company/:slug)
-- Safe: companies table contains no PII or billing data
-- ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Companies viewable by members" ON public.companies;

CREATE POLICY "Companies publicly readable"
  ON public.companies FOR SELECT
  USING (true);

-- ──────────────────────────────────────────────────────────────
-- 9. ONE-TIME BACKFILL
-- ──────────────────────────────────────────────────────────────

-- Responsibility scores for companies that have submissions
UPDATE public.companies c
SET responsibility_score = public.compute_responsibility_score(c.id)
WHERE EXISTS (
  SELECT 1
  FROM public.jobs j
  INNER JOIN public.submissions s ON s.job_id = j.id
  WHERE j.company_id = c.id
);
-- Companies with no submissions stay NULL ("New")

-- Reliability scores for all candidates
UPDATE public.profiles
SET reliability_score = public.compute_reliability_score(id)
WHERE role = 'candidate' OR role IS NULL;
