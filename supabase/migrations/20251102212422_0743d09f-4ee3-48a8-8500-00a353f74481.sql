-- Add banner image URL column to provider profiles
ALTER TABLE public.provider_profiles
ADD COLUMN IF NOT EXISTS banner_image_url text;

COMMENT ON COLUMN public.provider_profiles.banner_image_url IS 'URL of the provider profile banner image';