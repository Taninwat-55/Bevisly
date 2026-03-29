-- Allow demo_admin to publish jobs by reverting the strict block on their own items.
-- Jobs Update
DROP POLICY IF EXISTS "Employers can update own jobs" ON public.jobs;
CREATE POLICY "Employers can update own jobs"
  ON public.jobs
  FOR UPDATE
  USING (auth.uid() = employer_id);

-- Proof Tasks Manage (ALL)
DROP POLICY IF EXISTS "Employers can manage tasks for their jobs" ON public.proof_tasks;
CREATE POLICY "Employers can manage tasks for their jobs"
  ON public.proof_tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = proof_tasks.job_id
        AND jobs.employer_id = auth.uid()
    )
  );

-- Keep delete policy blocked for demo admin if desired, but we can also just let them delete their own.
DROP POLICY IF EXISTS "Employers can delete their own jobs" ON public.jobs;
CREATE POLICY "Employers can delete their own jobs"
  ON public.jobs
  FOR DELETE
  USING (auth.uid() = employer_id);
