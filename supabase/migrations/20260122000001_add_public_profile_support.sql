-- Migration: Add public profile support to profiles table
-- Run this in Supabase SQL Editor

-- Add username column for SEO-friendly profile URLs
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Add public/private toggle (default: private for existing users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Create index for fast username lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- Username validation: 3-30 chars, lowercase alphanumeric with underscores/dashes
-- First char must be alphanumeric
ALTER TABLE profiles ADD CONSTRAINT valid_username 
  CHECK (username IS NULL OR username ~ '^[a-z0-9][a-z0-9_-]{2,29}$');

-- Reserved usernames (blocked)
CREATE OR REPLACE FUNCTION check_reserved_username()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IN (
    'admin', 'bevisly', 'support', 'help', 'api', 'www', 
    'mail', 'app', 'candidate', 'employer', 'dashboard',
    'settings', 'profile', 'login', 'signup', 'auth',
    'jobs', 'leaderboard', 'about', 'privacy', 'terms'
  ) THEN
    RAISE EXCEPTION 'Username is reserved';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_reserved_username ON profiles;
CREATE TRIGGER trg_check_reserved_username
  BEFORE INSERT OR UPDATE OF username ON profiles
  FOR EACH ROW
  WHEN (NEW.username IS NOT NULL)
  EXECUTE FUNCTION check_reserved_username();

-- Function to look up user by username (for public profile resolution)
CREATE OR REPLACE FUNCTION get_profile_by_username(p_username TEXT)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  credits INT,
  is_public BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    profiles.id,
    profiles.full_name,
    profiles.credits,
    COALESCE(profiles.is_public, false)
  FROM profiles
  WHERE profiles.username = p_username
    AND profiles.is_public = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_profile_by_username(TEXT) TO anon, authenticated;
