ALTER TABLE profiles ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';
