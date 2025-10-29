-- Add message content length constraint
ALTER TABLE public.messages 
ADD CONSTRAINT messages_content_length_check 
CHECK (char_length(content) >= 1 AND char_length(content) <= 5000);

-- Make style-previews bucket private (user-specific content)
UPDATE storage.buckets 
SET public = false 
WHERE name = 'style-previews';

-- Make inspiration-images bucket private (personal uploads)
UPDATE storage.buckets 
SET public = false 
WHERE name = 'inspiration-images';

-- Drop existing policies for style-previews if they exist
DROP POLICY IF EXISTS "Users can view own style previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own style previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own style previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own style previews" ON storage.objects;

-- Drop existing policies for inspiration-images if they exist
DROP POLICY IF EXISTS "Users can view own inspiration images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own inspiration images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own inspiration images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own inspiration images" ON storage.objects;

-- Add RLS policies for style-previews bucket
CREATE POLICY "Users can view own style previews"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'style-previews' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own style previews"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'style-previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own style previews"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'style-previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own style previews"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'style-previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add RLS policies for inspiration-images bucket
CREATE POLICY "Users can view own inspiration images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'inspiration-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own inspiration images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'inspiration-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own inspiration images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'inspiration-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own inspiration images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'inspiration-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);