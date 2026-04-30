ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS rejection_email_sent boolean NOT NULL DEFAULT false;
