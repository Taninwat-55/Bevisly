-- When an employer claims their invite code, also create a real company row
-- and owner membership for them. Previously claim_invite_code only promoted
-- the profile to 'employer', leaving no companies/company_members entry.
-- This caused updateCompanyProfile to silently write nothing (profile ID ≠
-- any real company ID), making settings fields appear to save but reset on refresh.

create or replace function public.claim_invite_code(invite_code text)
returns void
language plpgsql
security definer
as $$
declare
  v_company_name text;
  v_new_company_id uuid;
begin
  select company_name into v_company_name
  from public.invitations
  where code = invite_code and is_used = false;

  if not found then
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

  -- Create company + owner membership if user has no company yet
  if not exists (select 1 from public.company_members where user_id = auth.uid()) then
    insert into public.companies (name, owner_id)
    values (coalesce(nullif(trim(v_company_name), ''), 'My Company'), auth.uid())
    returning id into v_new_company_id;

    insert into public.company_members (company_id, user_id, role)
    values (v_new_company_id, auth.uid(), 'owner');
  end if;
end;
$$;
