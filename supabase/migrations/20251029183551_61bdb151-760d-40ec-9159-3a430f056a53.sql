-- Add stylist matching fields to provider_profiles
ALTER TABLE public.provider_profiles 
ADD COLUMN gallery_images text[],
ADD COLUMN city text,
ADD COLUMN suburb text,
ADD COLUMN review_count integer DEFAULT 0,
ADD COLUMN availability_status text DEFAULT 'available',
ADD COLUMN price_range text;

-- Add index for faster matching queries
CREATE INDEX idx_provider_profiles_rating ON public.provider_profiles(rating DESC);

-- Update existing providers to have default values
UPDATE public.provider_profiles 
SET 
  gallery_images = ARRAY[]::text[],
  review_count = 0,
  availability_status = 'available'
WHERE gallery_images IS NULL;