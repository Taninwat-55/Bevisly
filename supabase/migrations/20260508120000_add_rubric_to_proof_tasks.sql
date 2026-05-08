-- Locked Rubric Before Submissions Open
-- See PRODUCT_ROADMAP.md pre-launch item #8.

-- 1. Rubric storage on proof_tasks
alter table public.proof_tasks
  add column if not exists rubric_criteria jsonb,
  add column if not exists rubric_locked_at timestamptz;

comment on column public.proof_tasks.rubric_criteria is
  'Array of {name, weight, description}. Weights must sum to 100.';
comment on column public.proof_tasks.rubric_locked_at is
  'Set automatically when the first submission references this task.';

-- 2. Per-criterion scores on feedback
alter table public.feedback
  add column if not exists rubric_scores jsonb;

comment on column public.feedback.rubric_scores is
  'Array of {name, score, note}. name matches a proof_tasks.rubric_criteria entry.';

-- 3. Auto-lock rubric when the first submission is created for a task
create or replace function public.lock_rubric_on_first_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.proof_task_id is not null then
    update public.proof_tasks
       set rubric_locked_at = now()
     where id = new.proof_task_id
       and rubric_locked_at is null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_lock_rubric_on_submission on public.submissions;

create trigger trg_lock_rubric_on_submission
  after insert on public.submissions
  for each row
  execute function public.lock_rubric_on_first_submission();
