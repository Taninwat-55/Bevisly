-- Add Storage Policies for UPDATE and DELETE
-- Also fixes the 'avatars' INSERT policy to enforce folder ownership
-- and adds 'task_attachments' bucket policies.

-- 1. Fix Avatars INSERT (enforce folder check)
drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text AND
    (storage.extension(name) = any(array['jpg', 'png', 'jpeg', 'webp'])) AND
    ((metadata->>'size')::bigint < 2097152) -- 2MB limit
  );

-- 2. Task Attachments Policies
drop policy if exists "Employers can upload task assets" on storage.objects;
create policy "Employers can upload task assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'task_attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Anyone can view task assets" on storage.objects;
create policy "Anyone can view task assets"
  on storage.objects for select
  to public
  using ( bucket_id = 'task_attachments' );

-- 3. UPDATE policies (allow users to replace their own files)
drop policy if exists "Candidates can update own proofs" on storage.objects;
create policy "Candidates can update own proofs"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Candidates can update own resumes" on storage.objects;
create policy "Candidates can update own resumes"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Employers can update own task assets" on storage.objects;
create policy "Employers can update own task assets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'task_attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. DELETE policies (allow users to remove their own files)
drop policy if exists "Candidates can delete own proofs" on storage.objects;
create policy "Candidates can delete own proofs"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Candidates can delete own resumes" on storage.objects;
create policy "Candidates can delete own resumes"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete own avatar" on storage.objects;
create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Employers can delete own task assets" on storage.objects;
create policy "Employers can delete own task assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'task_attachments' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
