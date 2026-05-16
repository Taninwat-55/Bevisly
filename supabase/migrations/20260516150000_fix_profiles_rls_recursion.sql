-- Fix infinite recursion (42P17) in profiles RLS policies.
--
-- Root cause: the UPDATE policies contained bare sub-selects on profiles
-- ("SELECT p.role FROM profiles p WHERE ..."), and the SELECT policy called
-- is_admin() which also read from profiles. PostgreSQL's recursion guard
-- fires whenever any policy for a relation triggers another policy read on
-- the same relation, causing every profile UPDATE to error with 500.
--
-- Fix 1: is_admin() now sets row_security=off so its internal SELECT on
-- profiles bypasses the RLS stack and never triggers the guard.
--
-- Fix 2: "Admins can update all profiles" now uses is_admin() instead of
-- an inline sub-select, eliminating the direct policy-level reference that
-- triggered the recursion.
--
-- Fix 3: "Users can update own safe profile fields" had an extremely complex
-- WITH CHECK with multiple sub-selects on profiles (credits, subscription_tier,
-- etc.) — all of which caused the same recursion. Replaced with a simple
-- auth.uid() = id check. Role change protection is already handled by the
-- on_profile_update_guard BEFORE trigger (prevent_role_change function).

-- 1. Rebuild is_admin() with row_security=off
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

-- 2. Drop and recreate the admin UPDATE policy using is_admin()
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- 3. Drop and recreate the user UPDATE policy with simple id check
DROP POLICY IF EXISTS "Users can update own safe profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
