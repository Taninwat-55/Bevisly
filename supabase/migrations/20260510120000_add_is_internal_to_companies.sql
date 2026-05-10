ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;

UPDATE public.companies
SET is_internal = true
WHERE slug IN ('bevisly', 'demo-tester-s-company');
