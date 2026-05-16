-- Add optional candidate-facing feedback letter to the feedback table.
-- Nullable — existing rows and reviews submitted without a letter are unaffected.
alter table public.feedback
  add column if not exists feedback_letter text;
