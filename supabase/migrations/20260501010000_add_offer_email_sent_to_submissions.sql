ALTER TABLE submissions
ADD COLUMN IF NOT EXISTS offer_email_sent boolean NOT NULL DEFAULT false;
