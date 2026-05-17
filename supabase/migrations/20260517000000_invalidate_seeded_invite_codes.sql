-- Invalidate the three codes that were seeded in the initial migration and are
-- visible in git history. Anyone who has read the repo could use these to
-- self-register as an employer without a real invite.
UPDATE public.invitations
SET is_used = true, used_at = now()
WHERE code IN ('BEVIS-BETA-2026', 'EARLY-ACCESS-VIP', 'FOUNDER-INVITE')
  AND is_used = false;
