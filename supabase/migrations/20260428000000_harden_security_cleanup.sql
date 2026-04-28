-- Harden Security and Cleanup Legacy Functions
-- 1. Remove the dangerous promotion function
drop function if exists public.promote_to_admin();

-- 2. Harden the new user handler
-- We should NOT trust the user's role metadata on signup.
-- This ensures everyone starts as a 'candidate' regardless of what they send.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    'candidate', -- Hardcoded default. Do not trust metadata for roles.
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 3. Cleanup duplicate or legacy is_admin functions
drop function if exists public.is_admin(uuid);

-- 4. Ensure prevent_role_change is strictly enforced
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.role is distinct from old.role then
    -- Only the service_role (Admin API) can bypass this.
    -- auth.role() returns 'authenticated' for users, 'service_role' for the dashboard/admin.
    if auth.role() = 'authenticated' then
      raise exception 'Security Violation: Role changes are restricted to administrators.';
    end if;
  end if;
  return new;
end;
$$;
