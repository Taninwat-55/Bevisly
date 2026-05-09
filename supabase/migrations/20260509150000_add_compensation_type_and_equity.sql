-- Add structured compensation type and equity percentage range to jobs

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS compensation_type text DEFAULT 'salary';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS equity_min numeric(6,3);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS equity_max numeric(6,3);

-- Backfill from existing paid boolean
UPDATE jobs SET compensation_type = CASE WHEN paid = true THEN 'salary' ELSE 'volunteer' END;

ALTER TABLE jobs ADD CONSTRAINT jobs_compensation_type_check
  CHECK (compensation_type IN ('salary', 'salary_and_equity', 'equity_only', 'volunteer'));
