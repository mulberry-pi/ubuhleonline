-- Add thumbnail_url column to services table
ALTER TABLE public.services 
ADD COLUMN thumbnail_url text;

COMMENT ON COLUMN public.services.thumbnail_url IS 'URL to the service thumbnail image stored in Supabase storage';