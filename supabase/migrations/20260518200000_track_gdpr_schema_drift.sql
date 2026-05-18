-- Track columns and functions that were added via the Supabase dashboard
-- without corresponding migration files. All statements use IF NOT EXISTS
-- so they are safe to run against a DB that already has these objects.

-- ── profiles: GDPR consent columns ──────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS consented_at     timestamptz,
  ADD COLUMN IF NOT EXISTS tos_version      text,
  ADD COLUMN IF NOT EXISTS email_notif      boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS marketing_emails boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.consented_at     IS 'Timestamp when the user accepted the current ToS (GDPR Article 7)';
COMMENT ON COLUMN public.profiles.tos_version      IS 'Version string of the ToS the user accepted (e.g. "1.0")';
COMMENT ON COLUMN public.profiles.email_notif      IS 'Whether to send transactional email notifications (submission reviewed, etc.)';
COMMENT ON COLUMN public.profiles.marketing_emails IS 'Whether to send marketing/promotional emails (explicit opt-in required)';

-- ── invitations: company_name column ────────────────────────────────────────
-- Used by claim_invite_code to name the company created on signup.
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS company_name text;

-- ── delete_user_account: source-of-truth function body ──────────────────────
-- The function already exists in production but its definition was not tracked
-- in any migration file. Recreating it here with CREATE OR REPLACE is idempotent.
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Nullify invited_by references (NO ACTION FK — must clear before profiles is deleted)
  UPDATE public.company_members SET invited_by = NULL WHERE invited_by = v_user_id;

  -- Nullify invitations.used_by (safety — references auth.users)
  UPDATE public.invitations SET used_by = NULL WHERE used_by = v_user_id;

  -- Delete from auth.users. Cascades to profiles, which cascades to:
  --   submissions (CASCADE), practice_submissions (CASCADE),
  --   company_members.user_id (CASCADE), saved_jobs (CASCADE),
  --   credit_transactions (CASCADE), jobs.employer_id (CASCADE),
  --   feedback.employer_id (CASCADE), candidate_projects (CASCADE).
  -- SET NULL fires for: companies.owner_id, feedback.reviewer_id,
  --   feedback_messages.user_id.
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;

-- Ensure anon role cannot call this (already set, but idempotent to repeat)
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;
GRANT  EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
