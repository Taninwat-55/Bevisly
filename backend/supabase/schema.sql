-- ============================================================
-- Bevis MVP Database Schema
-- Version: v0.2 (Consolidated)
-- Description: Core tables, Views, and Security Policies
-- ============================================================

-- 1. PROFILES (Linked to auth.users) -------------------------
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  role text check (role in ('candidate', 'employer', 'admin')) default 'candidate',
  full_name text,
  company_name text,
  credits int default 0,
  resume_url text,
  resume_updated_at timestamptz,
  created_at timestamptz default now()
);
alter table profiles enable row level security;

-- 2. JOBS ----------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  requirements text,
  company text,
  location text,
  
  -- Metadata
  job_type text,
  department text,
  work_mode text,
  
  -- Payment & Salary
  paid boolean default false,
  payment_amount numeric,
  payment_currency text default 'EUR',
  show_salary_range boolean default false,
  salary_min numeric,
  salary_max numeric,
  pay_period text, -- 'hourly', 'monthly', 'yearly'

  -- Status
  status text default 'active', -- 'active', 'closed'
  featured boolean default false,
  is_public boolean default true,
  
  expires_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz
);
alter table jobs enable row level security;

-- 3. PROOF TASKS ---------------------------------------------
create table public.proof_tasks (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete cascade,
  title text not null,
  description text,
  instructions text,
  
  -- Task Metadata
  expected_time text,
  duration_minutes int,
  submission_format text,
  submission_type text default 'link', -- 'link', 'file', 'text'
  recommended_platform text,
  ai_tools_allowed boolean default false,
  ai_generated boolean default false,
  attachments text[], -- Array of URLs
  
  created_at timestamptz default now()
);
alter table proof_tasks enable row level security;

-- 4. SUBMISSIONS ---------------------------------------------
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete cascade,
  proof_task_id uuid references public.proof_tasks(id),
  
  -- Content
  submission_link text,
  reflection text,
  resume_url text, -- Snapshot of CV at submission time
  resume_metadata jsonb,
  
  -- Status
  status text default 'not_started', -- 'in_progress', 'submitted', 'reviewed'
  score numeric,
  
  -- Employer Pipeline
  hiring_stage text default 'new', -- 'new', 'shortlisted', 'interview', 'hired', 'rejected'
  employer_notes text,
  
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz
);
alter table submissions enable row level security;

-- 5. FEEDBACK ------------------------------------------------
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.submissions(id) on delete cascade,
  employer_id uuid references public.profiles(id) on delete cascade,
  
  -- Review Data
  stars numeric,
  rating numeric, -- Legacy/Duplicate field support
  strengths text,
  improvements text,
  comments text,
  ai_summary text,
  
  created_at timestamptz default now()
);
alter table feedback enable row level security;

-- 6. FEEDBACK MESSAGES (Platform Feedback) -------------------
create table public.feedback_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  email text,
  category text, -- 'bug', 'suggestion', 'question', 'general'
  message text not null,
  page text,
  created_at timestamptz default now()
);
alter table feedback_messages enable row level security;

-- ============================================================
-- VIEWS
-- ============================================================

-- View 1: Proof Cards (Public Profile)
create or replace view proof_cards as
select
  s.id as submission_id,
  s.id as id, -- Alias for frontend compatibility
  p.full_name as candidate_name,
  j.title as job_title,
  pt.title as task_title,
  f.stars as rating,
  f.comments,
  f.created_at as reviewed_at,
  'https://bevis.app/proof/' || s.id as share_url
from submissions s
join profiles p on s.user_id = p.id
join jobs j on s.job_id = j.id
left join proof_tasks pt on s.proof_task_id = pt.id
left join feedback f on f.submission_id = s.id
where s.status = 'reviewed';

-- View 2: Employer Job Summary (Dashboard)
create or replace view employer_job_summary as
select
  j.id as job_id,
  j.employer_id,
  j.title,
  count(s.id) as submissions_count,
  avg(f.stars) as avg_score
from jobs j
left join submissions s on j.id = s.job_id
left join feedback f on s.id = f.submission_id
group by j.id;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Helper: Check Admin Status (Securely)
create or replace function is_admin()
returns boolean
language sql
security definer
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- Helper: Promote Self to Admin (Dev Utility)
create or replace function promote_to_admin()
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles
  set role = 'admin'
  where id = auth.uid();
end;
$$;

-- Helper: Auto-create Profile on Auth Signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'candidate'),
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- Trigger for New User
-- (Uncomment if not already created in your instance)
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- PROFILES
create policy "Public profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can view all profiles"
  on profiles for select using (is_admin());

-- JOBS
create policy "Jobs are viewable by everyone"
  on jobs for select using (true);

create policy "Employers can insert jobs"
  on jobs for insert with check (auth.uid() = employer_id);

create policy "Employers can update own jobs"
  on jobs for update using (auth.uid() = employer_id);

create policy "Employers can delete own jobs"
  on jobs for delete using (auth.uid() = employer_id);

create policy "Admins can view all jobs"
  on jobs for select using (is_admin());

-- PROOF TASKS
create policy "Proof tasks are viewable by everyone"
  on proof_tasks for select using (true);

create policy "Employers can manage proof tasks via jobs"
  on proof_tasks for all
  using (exists (
    select 1 from jobs where jobs.id = proof_tasks.job_id and jobs.employer_id = auth.uid()
  ));

-- SUBMISSIONS
create policy "Candidates can view own submissions"
  on submissions for select using (auth.uid() = user_id);

create policy "Candidates can insert submissions"
  on submissions for insert with check (auth.uid() = user_id);

create policy "Candidates can update own submissions"
  on submissions for update using (auth.uid() = user_id);

create policy "Employers can view submissions for their jobs"
  on submissions for select
  using (exists (
    select 1 from jobs where jobs.id = submissions.job_id and jobs.employer_id = auth.uid()
  ));

create policy "Employers can update submissions (status/stage)"
  on submissions for update
  using (exists (
    select 1 from jobs where jobs.id = submissions.job_id and jobs.employer_id = auth.uid()
  ));

create policy "Admins can view all submissions"
  on submissions for select using (is_admin());

-- FEEDBACK
create policy "Feedback viewable by candidate and employer"
  on feedback for select
  using (
    auth.uid() = employer_id or 
    exists (select 1 from submissions s where s.id = feedback.submission_id and s.user_id = auth.uid())
  );

create policy "Employers can insert feedback"
  on feedback for insert with check (auth.uid() = employer_id);

create policy "Admins can view all feedback"
  on feedback for select using (is_admin());

-- FEEDBACK MESSAGES
create policy "Users can insert feedback messages"
  on feedback_messages for insert with check (auth.uid() = user_id or user_id is null);

create policy "Admins can view all feedback messages"
  on feedback_messages for select using (is_admin());