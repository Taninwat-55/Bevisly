-- Revoke anonymous execute access from SECURITY DEFINER functions that should
-- only be called by authenticated users or internal triggers.
-- Functions intentionally public (get_public_jobs, check_invite_code, claim_invite_code,
-- compute_avg_review_days, get_platform_stats) are left untouched.

REVOKE EXECUTE ON FUNCTION public.deduct_credits(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.delete_user_account() FROM anon;
REVOKE EXECUTE ON FUNCTION public.distribute_credits(uuid, integer, text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_credit_balance(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_recent_activity(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_demo_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_company_member(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_company_admin_or_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_job() FROM anon;
REVOKE EXECUTE ON FUNCTION public.prevent_role_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.lock_rubric_on_first_submission() FROM anon;
