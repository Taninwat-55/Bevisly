-- ============================================================
-- Multi-Tenant Architecture: Data Migration
-- Migration: 20260122_migrate_jobs_to_companies.sql
-- ============================================================

-- 1. CREATE COMPANIES FOR EXISTING EMPLOYERS
-- Each employer with existing jobs gets a company named after their profile
insert into public.companies (id, name, owner_id, created_at)
select 
  gen_random_uuid(),
  coalesce(p.company_name, p.full_name || '''s Company', 'My Company'),
  p.id,
  now()
from public.profiles p
where p.role = 'employer'
and not exists (
  select 1 from public.companies c where c.owner_id = p.id
);

-- 2. ADD OWNERS TO COMPANY_MEMBERS AS 'OWNER' ROLE
insert into public.company_members (company_id, user_id, role, created_at)
select c.id, c.owner_id, 'owner', now()
from public.companies c
where c.owner_id is not null
and not exists (
  select 1 from public.company_members cm 
  where cm.company_id = c.id and cm.user_id = c.owner_id
);

-- 3. MIGRATE EXISTING JOBS TO THEIR EMPLOYER'S COMPANY
update public.jobs j
set company_id = c.id
from public.companies c
where c.owner_id = j.employer_id
and j.company_id is null;

-- 4. MAKE COMPANY_ID NOT NULL (After Migration)
-- Note: Do this in a separate migration after verifying data
-- alter table public.jobs alter column company_id set not null;
