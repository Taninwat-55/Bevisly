-- ============================================================
-- Multi-Tenant Architecture: Updated RLS Policies
-- Migration: 20260122_update_rls_for_companies.sql
-- ============================================================

-- ============================================================
-- JOBS TABLE POLICIES (Replace employer_id with company_id)
-- ============================================================

-- Drop old employer-based policies
drop policy if exists "Employers can insert jobs" on public.jobs;
drop policy if exists "Employers can update own jobs" on public.jobs;
drop policy if exists "Employers can delete own jobs" on public.jobs;

-- New company-based policies
create policy "Company members can insert jobs"
  on public.jobs for insert 
  with check (is_company_member(company_id));

create policy "Company members can update jobs"
  on public.jobs for update 
  using (is_company_member(company_id));

create policy "Company members can delete jobs"
  on public.jobs for delete 
  using (is_company_member(company_id));

-- ============================================================
-- PROOF_TASKS TABLE POLICIES (Update to use company membership)
-- ============================================================

drop policy if exists "Employers can manage proof tasks via jobs" on public.proof_tasks;

create policy "Company members can manage proof tasks"
  on public.proof_tasks for all
  using (exists (
    select 1 from public.jobs j 
    where j.id = proof_tasks.job_id 
    and is_company_member(j.company_id)
  ));

-- ============================================================
-- SUBMISSIONS TABLE POLICIES (Update to use company membership)
-- ============================================================

drop policy if exists "Employers can view submissions for their jobs" on public.submissions;
drop policy if exists "Employers can update submissions (status/stage)" on public.submissions;

create policy "Company members can view job submissions"
  on public.submissions for select
  using (exists (
    select 1 from public.jobs j 
    where j.id = submissions.job_id 
    and is_company_member(j.company_id)
  ));

create policy "Company members can update submissions"
  on public.submissions for update
  using (exists (
    select 1 from public.jobs j 
    where j.id = submissions.job_id 
    and is_company_member(j.company_id)
  ));

-- ============================================================
-- FEEDBACK TABLE POLICIES (Update to use company membership)
-- ============================================================

drop policy if exists "Feedback viewable by candidate and employer" on public.feedback;
drop policy if exists "Employers can insert feedback" on public.feedback;

create policy "Company members can view feedback for their job submissions"
  on public.feedback for select
  using (
    -- Employer can view feedback they gave
    auth.uid() = employer_id 
    or 
    -- Candidate can view feedback on their submissions
    exists (
      select 1 from public.submissions s 
      where s.id = feedback.submission_id 
      and s.user_id = auth.uid()
    )
    or
    -- Company members can view all feedback for their company's jobs
    exists (
      select 1 from public.submissions s
      join public.jobs j on j.id = s.job_id
      where s.id = feedback.submission_id
      and is_company_member(j.company_id)
    )
  );

create policy "Company members can insert feedback"
  on public.feedback for insert
  with check (
    exists (
      select 1 from public.submissions s
      join public.jobs j on j.id = s.job_id
      where s.id = feedback.submission_id
      and is_company_member(j.company_id)
    )
  );

-- ============================================================
-- EMPLOYER_JOB_SUMMARY VIEW (Add company_id)
-- ============================================================

drop view if exists employer_job_summary;

create or replace view employer_job_summary as
select
  j.id as job_id,
  j.employer_id,
  j.company_id,
  j.title,
  count(s.id) as submissions_count,
  avg(f.stars) as avg_score
from public.jobs j
left join public.submissions s on j.id = s.job_id
left join public.feedback f on s.id = f.submission_id
group by j.id;
