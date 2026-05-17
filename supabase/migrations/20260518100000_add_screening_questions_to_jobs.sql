alter table public.jobs
  add column if not exists screening_questions jsonb default null;
