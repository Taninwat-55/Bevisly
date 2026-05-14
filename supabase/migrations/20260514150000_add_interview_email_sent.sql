ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS interview_email_sent boolean NOT NULL DEFAULT false;
