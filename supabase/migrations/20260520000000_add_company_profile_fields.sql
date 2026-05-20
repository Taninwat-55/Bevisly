ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS industry       text,
  ADD COLUMN IF NOT EXISTS company_size   text,
  ADD COLUMN IF NOT EXISTS stage          text,
  ADD COLUMN IF NOT EXISTS founded_year   integer,
  ADD COLUMN IF NOT EXISTS business_model text[],
  ADD COLUMN IF NOT EXISTS perks          text[] DEFAULT '{}';
