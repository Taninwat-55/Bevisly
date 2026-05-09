-- Submission Follow-up Questions (Anti-AI Authenticity Layer)
-- See PRODUCT_ROADMAP.md post-launch feature #6.

-- 1. Follow-up questions on proof tasks (employer sets these at task creation)
alter table public.proof_tasks
  add column if not exists follow_up_questions jsonb;

comment on column public.proof_tasks.follow_up_questions is
  'Array of question strings (max 3). Employer writes these when creating the task.';

-- 2. Follow-up answers on submissions (candidate fills these after submitting)
alter table public.submissions
  add column if not exists follow_up_answers jsonb;

comment on column public.submissions.follow_up_answers is
  'Array of {question, answer} objects. Candidate answers after proof submission. 150 words max per answer.';

-- 3. Employer can request a 15-minute Proof Discussion call
alter table public.submissions
  add column if not exists discussion_requested_at timestamptz;

comment on column public.submissions.discussion_requested_at is
  'Set by employer when they request a Proof Discussion call with the candidate.';
