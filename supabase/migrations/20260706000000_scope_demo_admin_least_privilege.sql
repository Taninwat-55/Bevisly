-- ============================================================================
-- SCOPE demo_admin TO LEAST PRIVILEGE
-- ============================================================================
-- Problem this migration fixes
-- ----------------------------
-- The demo account (role = 'demo_admin') was designed as "a full admin, minus
-- some buttons hidden in the UI". At the DATABASE level it was a full admin,
-- because is_admin() returned TRUE for demo_admin:
--
--     AND role IN ('admin', 'demo_admin')   -- <- the hole
--
-- Every RLS policy that trusts is_admin() therefore granted the demo account
-- the same power as a real admin. The UI "read-only" guards (toasts, disabled
-- buttons) are cosmetic — trivially bypassed via DevTools or a direct API call.
--
-- Confirmed write holes a demo user could reach at the DB level:
--   * UPDATE any user's profile   ("Admins can update all profiles")
--   * UPDATE / DELETE any company  ("Company owners can update")
--   * INSERT/UPDATE/DELETE members of any company ("Owners/admins can manage members")
--   * SELECT every user's credit_transactions (privacy leak)
--
-- Design correction
-- -----------------
-- Invert the model: demo_admin is its OWN least-privilege role. is_admin() is
-- real-admins-only. The demo's *intended* actions (post a job, create proof
-- tasks, apply to a job, review its own applicants) already run through
-- OWNERSHIP / company-membership policies — NOT is_admin() — so tightening
-- is_admin() does not break any of them.
--
-- This migration is idempotent (safe to re-run) and makes NO destructive data
-- changes — it only redefines helper functions and RLS policies.
-- ============================================================================


-- ============================================================================
-- PART A — SECURITY FIX (required)
-- Redefine the privilege helpers so demo_admin is no longer a real admin.
-- ============================================================================

-- A1. is_demo_admin() — TRUE only for the demo account.
-- Version-controls a function that until now existed only in the live DB
-- (it was referenced by a REVOKE but never defined in a migration).
-- row_security = off mirrors is_admin() to avoid the profiles-RLS recursion
-- guard (error 42P17) when this is called from inside a profiles policy.
CREATE OR REPLACE FUNCTION public.is_demo_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'demo_admin'
  );
$$;

-- A2. is_admin() — REAL admins only. demo_admin removed.
-- This single change closes every confirmed write hole above, because those
-- policies gate on is_admin(). Real admins are unaffected.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Lock down execution: never callable by anonymous visitors.
REVOKE EXECUTE ON FUNCTION public.is_demo_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin()      FROM anon;
GRANT  EXECUTE ON FUNCTION public.is_demo_admin() TO authenticated;
GRANT  EXECUTE ON FUNCTION public.is_admin()      TO authenticated;

-- ----------------------------------------------------------------------------
-- After A1–A2 the following policies AUTOMATICALLY exclude the demo account,
-- with NO further change (they already gate on is_admin()):
--   * profiles       — "Admins can update all profiles"        (UPDATE)
--   * companies      — "Company owners can update"              (UPDATE)
--   * company_members— "Owners/admins can manage members"       (ALL)
--   * credit_transactions — "Admins can view all credit transactions" (SELECT)
-- The demo retains full access to rows it OWNS (its own profile, its own
-- company, jobs for its own company) via the ownership/membership branches of
-- those same policies.
--
-- By design (decision: no cross-user demo reads), the admin dashboard's
-- cross-user lists (all users, all companies, all billing) will be limited to
-- what the demo owns rather than showing real users. Populate the demo's admin
-- view with seed data (see supabase/seed-demo.sql) instead of live user data.
-- ----------------------------------------------------------------------------


-- ============================================================================
-- PART C — CLOSE SELF-ESCALATION ON OWN PROFILE (recommended)
-- ============================================================================
-- Separate, broader finding surfaced during the audit (affects ALL users, not
-- just demo): the "Users can update own profile" policy has NO column guard, so
-- any authenticated user can write privileged columns on their OWN row via a
-- direct API call — e.g. self-grant is_verified = true, inflate credits, or set
-- subscription_tier = 'growth'.
--
-- This trigger blocks client-side changes to those columns while EXEMPTING
-- trusted server paths, using the exact pattern already proven by
-- prevent_role_change(): only block when the caller is a plain authenticated
-- client (both auth.role() and current_user = 'authenticated'). SECURITY DEFINER
-- functions (run as owner/postgres) and the service_role (Stripe webhooks,
-- admin API, credit ledger functions) are unaffected.
--
-- If you do NOT want this broader hardening in the same migration, delete Part C.
CREATE OR REPLACE FUNCTION public.prevent_privileged_self_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  IF auth.role() = 'authenticated' AND current_user = 'authenticated' THEN
    IF new.credits           IS DISTINCT FROM old.credits
       OR new.subscription_tier IS DISTINCT FROM old.subscription_tier
       OR new.is_verified     IS DISTINCT FROM old.is_verified THEN
      RAISE EXCEPTION
        'Security Violation: credits, subscription_tier and is_verified cannot be changed directly.';
    END IF;
  END IF;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_privileged_self_update ON public.profiles;
CREATE TRIGGER trg_prevent_privileged_self_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_privileged_self_update();


-- ============================================================================
-- VERIFICATION (run manually AFTER applying — read-only, changes nothing)
-- ============================================================================
-- 1) Confirm the helpers resolve as intended:
--      SELECT proname, prosrc FROM pg_proc
--      WHERE proname IN ('is_admin','is_demo_admin');
--
-- 2) List every policy still trusting is_admin() (should be WRITES + billing reads only):
--      SELECT schemaname, tablename, policyname, cmd, qual, with_check
--      FROM pg_policies
--      WHERE qual  ILIKE '%is_admin%'
--         OR with_check ILIKE '%is_admin%'
--      ORDER BY tablename, cmd;
--
-- 3) Sanity — while logged in as the demo account, these MUST fail (Part A):
--      UPDATE public.profiles  SET is_verified = true WHERE id <> auth.uid();  -- 0 rows / denied
--      UPDATE public.companies SET name = 'hax'       WHERE owner_id <> auth.uid();  -- 0 rows / denied
--    and these MUST still work (intended demo actions):
--      INSERT INTO public.jobs (...) ...   -- for the demo's own company
--      INSERT INTO public.submissions (...) ...  -- applying to a job
-- ============================================================================
