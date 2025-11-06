-- Fix storage RLS policies for business logos
CREATE POLICY "Providers can upload business logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can update own business logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Providers can delete own business logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix the provider visibility policy to allow public access
DROP POLICY IF EXISTS "Public can view basic provider data" ON public.provider_profiles;

CREATE POLICY "Public can view public provider profiles"
ON public.provider_profiles
FOR SELECT
TO authenticated, anon
USING (is_public = true);