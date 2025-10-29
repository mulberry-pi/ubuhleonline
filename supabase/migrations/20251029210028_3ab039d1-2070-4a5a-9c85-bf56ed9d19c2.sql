-- Add calendar event tracking to appointments
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS client_calendar_event_id TEXT,
ADD COLUMN IF NOT EXISTS provider_calendar_event_id TEXT;

-- Drop existing problematic storage policies
DROP POLICY IF EXISTS "Anyone can view style previews" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view inspiration images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own style previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own inspiration images" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert own style previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can insert own inspiration images" ON storage.objects;

-- Style Previews: Owner and matched provider can view
CREATE POLICY "Clients can view own style previews"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'style-previews' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can view client style previews for their appointments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'style-previews'
  AND EXISTS (
    SELECT 1 FROM public.appointments
    WHERE provider_id = auth.uid()
    AND preview_image_url LIKE '%' || name || '%'
  )
);

CREATE POLICY "Clients can upload own style previews"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'style-previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clients can update own style previews"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'style-previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clients can delete own style previews"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'style-previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Inspiration Images: Owner and matched provider can view
CREATE POLICY "Clients can view own inspiration images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspiration-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can view client inspiration images for their appointments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspiration-images'
  AND EXISTS (
    SELECT 1 FROM public.appointments
    WHERE provider_id = auth.uid()
    AND inspiration_image_url LIKE '%' || name || '%'
  )
);

CREATE POLICY "Clients can upload own inspiration images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspiration-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clients can update own inspiration images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'inspiration-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Clients can delete own inspiration images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inspiration-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);