-- Attach handle_new_user() to auth.users so every signup (email or OAuth)
-- gets a profiles row with role='candidate' atomically. The function was
-- defined in 20260428000000_harden_security_cleanup.sql but no migration in
-- this repo attaches it as a trigger. Without this, OAuth users can land
-- without a profile row, leaving session.role null until the client-side
-- fallback in AuthProvider auto-creates one.

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
