-- Add team_photos array column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS team_photos text[] DEFAULT '{}';

-- Create company-photos storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-photos', 'company-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for company-photos bucket
CREATE POLICY "company_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-photos');

CREATE POLICY "company_photos_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "company_photos_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'company-photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
