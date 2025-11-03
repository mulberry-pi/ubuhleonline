-- Add service location type to provider profiles
ALTER TABLE public.provider_profiles
ADD COLUMN service_location_type text[] DEFAULT ARRAY['salon']::text[];