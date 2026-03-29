-- 1) Drop old RLS policies that rely on employer_id
DROP POLICY IF EXISTS "Employer can view submissions for their jobs" ON public.submissions;
DROP POLICY IF EXISTS "Employer can update submission status" ON public.submissions;

-- 2) Re-create with company_id logic
CREATE POLICY "Company Employer can view submissions"
  ON public.submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = submissions.job_id
        AND j.company_id IN (
          SELECT company_id 
          FROM public.company_members 
          WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Company Employer can update submissions"
  ON public.submissions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      WHERE j.id = submissions.job_id
        AND j.company_id IN (
          SELECT company_id 
          FROM public.company_members 
          WHERE user_id = auth.uid()
        )
    )
  );

-- 3) Do the same for Feedback
DROP POLICY IF EXISTS "Employers can view feedback on their jobs" ON public.feedback;
DROP POLICY IF EXISTS "Employers can create feedback" ON public.feedback;

CREATE POLICY "Company Employer can view feedback"
  ON public.feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.submissions s ON s.job_id = j.id
      WHERE s.id = feedback.submission_id
        AND j.company_id IN (
          SELECT company_id 
          FROM public.company_members 
          WHERE user_id = auth.uid()
        )
    )
  );

CREATE POLICY "Company Employer can create feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.jobs j
      JOIN public.submissions s ON s.job_id = j.id
      WHERE s.id = feedback.submission_id
        AND j.company_id IN (
          SELECT company_id 
          FROM public.company_members 
          WHERE user_id = auth.uid()
        )
    )
  );
