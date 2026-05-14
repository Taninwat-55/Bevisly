-- Add missing INSERT and SELECT policies for the resumes bucket.
-- UPDATE and DELETE already exist (20260428000001) but INSERT was never added,
-- so every upload attempt fails RLS silently.

create policy "Candidates can upload own resume"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'resumes' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Authenticated users can read resumes"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'resumes');
