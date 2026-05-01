-- Allow company employers to delete submissions for jobs they own
-- Required for the "Delete Job" flow: submissions must be removed before the job can be deleted
CREATE POLICY "Company Employer can delete submissions"
  ON public.submissions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = submissions.job_id
        AND j.employer_id = auth.uid()
    )
  );
