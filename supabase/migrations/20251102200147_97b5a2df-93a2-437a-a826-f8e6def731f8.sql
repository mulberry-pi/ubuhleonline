-- Add service_categories column to provider_profiles for market trend filtering
ALTER TABLE public.provider_profiles
ADD COLUMN service_categories TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN public.provider_profiles.service_categories IS 'Categories of services offered: Hair Styling, Lash Extensions, or both. Used for filtering market trends.';