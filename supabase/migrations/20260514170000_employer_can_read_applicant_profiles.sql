-- Employers need to read profiles of candidates who applied to their jobs.
-- Without this, pipeline email functions get null for candidate email/name
-- because the existing SELECT policy only allows reading public profiles.
CREATE POLICY "Employers can view profiles of their applicants"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.submissions s
    JOIN public.jobs j ON j.id = s.job_id
    WHERE s.user_id = profiles.id
    AND (
      j.employer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.company_members cm
        WHERE cm.company_id = j.company_id
        AND cm.user_id = auth.uid()
      )
    )
  )
);
