-- ai_usage_logs is an IP-based rate-limit table written only by SECURITY DEFINER
-- functions via service role. No direct client access is needed.
-- Adding an explicit admin-read policy to satisfy the rls_enabled_no_policy advisor.

CREATE POLICY "Admins can read ai_usage_logs"
  ON public.ai_usage_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );
