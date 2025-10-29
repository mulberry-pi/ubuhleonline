-- Fix security definer view by enabling security invoker mode
DROP VIEW IF EXISTS public.public_provider_profiles;

CREATE OR REPLACE VIEW public.public_provider_profiles
WITH (security_invoker=on)
AS
SELECT 
  id,
  user_id,
  business_name,
  business_description,
  business_logo_url,
  business_address,
  city,
  suburb,
  availability_status,
  price_range,
  is_public,
  rating,
  review_count,
  gallery_images,
  created_at,
  updated_at
FROM public.provider_profiles
WHERE is_public = true;

-- Grant access to the view
GRANT SELECT ON public.public_provider_profiles TO authenticated, anon;