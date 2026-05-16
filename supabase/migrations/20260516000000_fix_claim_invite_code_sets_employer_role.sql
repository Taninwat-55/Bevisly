-- Fix: claim_invite_code now promotes the claiming user's profile to 'employer'.
-- Previously it only marked the code as used, leaving the profile as 'candidate'
-- (the hardcoded default from handle_new_user). This caused all employer signups
-- to land on the candidate dashboard regardless of the role they selected.

create or replace function public.claim_invite_code(invite_code text)
returns void
language plpgsql
security definer
as $$
begin
  if not exists(
    select 1 from public.invitations
    where code = invite_code and is_used = false
  ) then
    raise exception 'Invalid or used invitation code';
  end if;

  update public.invitations
  set is_used = true,
      used_at = now(),
      used_by = auth.uid()
  where code = invite_code;

  update public.profiles
  set role = 'employer'
  where id = auth.uid();
end;
$$;
