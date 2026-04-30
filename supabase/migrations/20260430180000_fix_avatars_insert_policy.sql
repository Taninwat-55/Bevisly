-- Fix avatars INSERT policy: remove metadata->>'size' check.
-- metadata is NULL at INSERT time in Supabase Storage (populated after the row
-- is written), so NULL < 2097152 always evaluates to NULL (falsy), blocking
-- every upload. Client-side validation in EditProfileModal.tsx enforces 2MB.
drop policy if exists "Users can upload own avatar" on storage.objects;

create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    storage.extension(name) = any(array['jpg','jpeg','png','webp','gif'])
  );
