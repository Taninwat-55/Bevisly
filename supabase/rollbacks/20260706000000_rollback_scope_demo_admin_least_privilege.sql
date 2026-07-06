-- ============================================================================
-- ROLLBACK for 20260706000000_scope_demo_admin_least_privilege.sql
-- ============================================================================
-- One-paste undo. Run this in Supabase Dashboard → SQL Editor to fully revert
-- the "scope demo_admin to least privilege" migration and restore the exact
-- prior security state.
--
-- ⚠️ Running this REOPENS the security holes that migration closed:
--    demo_admin becomes a full admin again (can edit any profile/company),
--    and any user can self-grant credits / is_verified again. Only run it if
--    the forward migration caused a real problem you need to back out of.
--
-- This is pure DDL — it changes no table data. Idempotent and safe to re-run.
-- ============================================================================


-- ── Undo PART A2 ────────────────────────────────────────────────────────────
-- Restore is_admin() to its pre-migration definition (demo_admin counts as an
-- admin again). This is byte-for-byte the body from
-- 20260516150000_fix_profiles_rls_recursion.sql, so every policy that gates on
-- is_admin() reverts to its original behaviour automatically.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
SET row_security = off
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'demo_admin')
  );
$function$;


-- ── Undo PART C ─────────────────────────────────────────────────────────────
-- Remove the self-escalation guard trigger and its function.
DROP TRIGGER IF EXISTS trg_prevent_privileged_self_update ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_privileged_self_update();


-- ── PART A1 (is_demo_admin) — intentionally NOT dropped ─────────────────────
-- is_demo_admin() is left in place. It existed before the forward migration
-- (referenced by 20260516161000_revoke_anon_dangerous_rpcs.sql), its definition
-- is unchanged in behaviour, and dropping it would break that REVOKE. Leaving
-- it is correct and harmless.


-- ============================================================================
-- VERIFICATION (read-only — run after rolling back)
-- ============================================================================
--   SELECT proname, prosrc FROM pg_proc WHERE proname = 'is_admin';
--     -> body should again contain: role IN ('admin', 'demo_admin')
--   SELECT tgname FROM pg_trigger WHERE tgname = 'trg_prevent_privileged_self_update';
--     -> should return 0 rows
-- ============================================================================
