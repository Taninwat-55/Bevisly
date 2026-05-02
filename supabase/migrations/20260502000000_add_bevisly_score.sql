-- Add bevisly_score column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bevisly_score INTEGER NOT NULL DEFAULT 0;

-- Index for leaderboard ordering
CREATE INDEX IF NOT EXISTS idx_profiles_bevisly_score
  ON public.profiles (bevisly_score DESC);

-- ──────────────────────────────────────────────────────────────
-- Score computation function
-- Employer score:  each feedback row → stars * 20
-- Practice score:  each graded practice_submission →
--   beginner:     FLOOR(ai_score * 0.3)   max 30
--   intermediate: FLOOR(ai_score * 0.5)   max 50
--   advanced:     FLOOR(ai_score * 0.7)   max 70
--   fallback:     FLOOR(ai_score * 0.3)
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.compute_bevisly_score(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_employer_score integer := 0;
  v_practice_score integer := 0;
BEGIN
  -- Employer score: sum stars * 20 across all feedback on this user's submissions
  SELECT COALESCE(SUM(f.stars * 20), 0)
  INTO v_employer_score
  FROM public.feedback f
  INNER JOIN public.submissions s ON s.id = f.submission_id
  WHERE s.user_id = p_user_id
    AND f.stars IS NOT NULL;

  -- Practice score: sum per-submission score weighted by difficulty
  SELECT COALESCE(SUM(
    CASE pt.difficulty
      WHEN 'intermediate' THEN FLOOR(ps.ai_score * 0.5)
      WHEN 'advanced'     THEN FLOOR(ps.ai_score * 0.7)
      ELSE                     FLOOR(ps.ai_score * 0.3)  -- beginner + fallback
    END
  ), 0)
  INTO v_practice_score
  FROM public.practice_submissions ps
  INNER JOIN public.practice_tasks pt ON pt.id = ps.practice_task_id
  WHERE ps.user_id = p_user_id
    AND ps.ai_score IS NOT NULL;

  RETURN v_employer_score + v_practice_score;
END;
$$;

-- ──────────────────────────────────────────────────────────────
-- Trigger function — handles both feedback and practice_submissions
-- The caller sets the search_path; we rely on fully-qualified names.
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.trg_fn_update_bevisly_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_candidate_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'feedback' THEN
    -- Resolve candidate via submission
    SELECT s.user_id INTO v_candidate_id
    FROM public.submissions s
    WHERE s.id = NEW.submission_id;
  ELSIF TG_TABLE_NAME = 'practice_submissions' THEN
    v_candidate_id := NEW.user_id;
  END IF;

  IF v_candidate_id IS NOT NULL THEN
    UPDATE public.profiles
    SET bevisly_score = public.compute_bevisly_score(v_candidate_id)
    WHERE id = v_candidate_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: feedback inserted or stars updated
DROP TRIGGER IF EXISTS trg_bevisly_score_on_feedback ON public.feedback;
CREATE TRIGGER trg_bevisly_score_on_feedback
  AFTER INSERT OR UPDATE OF stars
  ON public.feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_update_bevisly_score();

-- Trigger: practice submission inserted or ai_score updated
DROP TRIGGER IF EXISTS trg_bevisly_score_on_practice ON public.practice_submissions;
CREATE TRIGGER trg_bevisly_score_on_practice
  AFTER INSERT OR UPDATE OF ai_score
  ON public.practice_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_fn_update_bevisly_score();

-- ──────────────────────────────────────────────────────────────
-- One-time backfill for existing candidates
-- ──────────────────────────────────────────────────────────────
UPDATE public.profiles
SET bevisly_score = public.compute_bevisly_score(id)
WHERE role = 'candidate' OR role IS NULL;
