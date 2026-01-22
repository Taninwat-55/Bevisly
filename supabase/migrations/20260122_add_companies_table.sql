-- ============================================================
-- Multi-Tenant Architecture: Companies & Team Access
-- Migration: 20260122_add_companies_table.sql
-- ============================================================

-- 1. COMPANIES TABLE
-- Each employer organization. Enables team-based collaboration.
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique, -- For company URLs like /company/acme
  logo_url text,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table companies enable row level security;

-- 2. COMPANY MEMBERS (Junction Table for Team Access)
-- Links users to companies with roles.
create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  invited_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  unique(company_id, user_id)
);

alter table company_members enable row level security;

-- 3. HELPER FUNCTION: Check Company Membership
create or replace function is_company_member(p_company_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.company_members 
    where company_id = p_company_id 
    and user_id = auth.uid()
  );
$$;

-- 4. ADD COMPANY_ID TO JOBS
alter table public.jobs
  add column company_id uuid references public.companies(id) on delete cascade;

-- Create index for faster lookups
create index idx_jobs_company_id on public.jobs(company_id);
create index idx_company_members_user_id on public.company_members(user_id);
create index idx_company_members_company_id on public.company_members(company_id);

-- ============================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================

-- COMPANIES: Viewable by members, manageable by owners/admins
create policy "Companies viewable by members"
  on public.companies for select
  using (is_company_member(id) or is_admin());

create policy "Company owners can update"
  on public.companies for update
  using (owner_id = auth.uid() or is_admin());

create policy "Authenticated users can create companies"
  on public.companies for insert
  with check (auth.uid() is not null);

-- COMPANY MEMBERS: Viewable by company members
create policy "Company members viewable by same company"
  on public.company_members for select
  using (is_company_member(company_id) or is_admin());

create policy "Owners/admins can manage members"
  on public.company_members for all
  using (
    exists (
      select 1 from public.company_members cm
      where cm.company_id = company_members.company_id
      and cm.user_id = auth.uid()
      and cm.role in ('owner', 'admin')
    )
    or is_admin()
  );

create policy "Users can join companies (via invite)"
  on public.company_members for insert
  with check (user_id = auth.uid());
