-- prevent_role_change currently checks auth.role() which returns 'authenticated'
-- even inside security definer functions (it reads from the JWT, not the PG role).
-- This means claim_invite_code() can never promote a user to 'employer' — the
-- trigger raises a security violation and the update is silently rolled back.
--
-- Fix: also check current_user. Security definer functions run as their owner
-- (postgres), not as 'authenticated', so this exempts them while still blocking
-- direct role escalation from the client.

create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.role is distinct from old.role then
    -- Allow: service_role calls (Supabase dashboard / admin API)
    -- Allow: security definer functions (current_user = 'postgres' or owner, not 'authenticated')
    -- Block: direct client-side role changes (auth.role() = 'authenticated' AND current_user = 'authenticated')
    if auth.role() = 'authenticated' and current_user = 'authenticated' then
      raise exception 'Security Violation: Role changes are restricted to administrators.';
    end if;
  end if;
  return new;
end;
$$;
