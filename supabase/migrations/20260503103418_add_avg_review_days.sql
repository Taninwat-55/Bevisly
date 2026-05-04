-- ============================================================
-- Add avg_review_days to companies
-- Surfaces the raw average review turnaround time (in days) on
-- the Employer Brand Page alongside the Responsibility Score.
-- The trigger function is updated to write both columns atomically.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. ADD COLUMN
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS avg_review_days INTEGER;
-- NULL = no reviewed submissions yet

-- ──────────────────────────────────────────────────────────────
-- 2. COMPUTE FUNCTION
-- Returns the average days between submission completion and
-- feedback creation, rounded to nearest integer (min 1).
-- Returns NULL when the employer has no reviewed submissions.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_avg_review_days(p_company_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_avg_days numeric;
BEGIN
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
    RETURN NULL;
  END IF;

  RETURN GREATEST(1, ROUND(v_avg_days)::integer);
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 3. UPDATE TRIGGER FUNCTION
-- Now writes avg_review_days alongside responsibility_score in
-- a single UPDATE so both stay in sync.
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
    SET
      responsibility_score = public.compute_responsibility_score(v_company_id),
      avg_review_days      = public.compute_avg_review_days(v_company_id)
    WHERE id = v_company_id;
  END IF;

  RETURN NEW;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- 4. BACKFILL
-- ──────────────────────────────────────────────────────────────
UPDATE public.companies c
SET avg_review_days = public.compute_avg_review_days(c.id)
WHERE EXISTS (
  SELECT 1
  FROM public.jobs j
  INNER JOIN public.submissions s ON s.job_id = j.id
  INNER JOIN public.feedback f ON f.submission_id = s.id
  WHERE j.company_id = c.id
    AND s.status = 'reviewed'
    AND s.completed_at IS NOT NULL
);
