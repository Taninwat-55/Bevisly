-- Create invitations table
create table if not exists public.invitations (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  is_used boolean default false,
  used_at timestamptz,
  used_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable RLS (though we rely on RPCs with security definer, it's good practice)
alter table public.invitations enable row level security;

-- Function to check if a code is valid (unused)
create or replace function public.check_invite_code(invite_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  valid boolean;
begin
  select exists(
    select 1 from public.invitations
    where code = invite_code
    and is_used = false
  ) into valid;
  return valid;
end;
$$;

-- Function to claim a code (mark as used by current user)
create or replace function public.claim_invite_code(invite_code text)
returns void
language plpgsql
security definer
as $$
begin
  if not exists(select 1 from public.invitations where code = invite_code and is_used = false) then
      raise exception 'Invalid or used invitation code';
  end if;

  update public.invitations
  set is_used = true,
      used_at = now(),
      used_by = auth.uid()
  where code = invite_code;
end;
$$;

-- Grant permissions
grant execute on function public.check_invite_code(text) to anon, authenticated;
grant execute on function public.claim_invite_code(text) to authenticated;

-- Seed some initial codes
insert into public.invitations (code) values 
('BEVIS-BETA-2024'),
('EARLY-ACCESS-VIP'),
('FOUNDER-INVITE')
on conflict (code) do nothing;
