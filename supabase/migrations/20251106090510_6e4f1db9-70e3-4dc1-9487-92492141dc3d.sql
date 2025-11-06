-- Add separate address fields to provider_profiles
ALTER TABLE public.provider_profiles
ADD COLUMN street_address_line1 text,
ADD COLUMN street_address_line2 text,
ADD COLUMN province text;

-- Migrate existing business_address data to new fields if needed
-- (Existing addresses will stay in business_address for now, providers can update them)

-- Add comment for clarity
COMMENT ON COLUMN public.provider_profiles.business_address IS 'Legacy field - use street_address_line1, street_address_line2, suburb, city, province instead';
COMMENT ON COLUMN public.provider_profiles.street_address_line1 IS 'Street address line 1 (e.g., 123 Main Street)';
COMMENT ON COLUMN public.provider_profiles.street_address_line2 IS 'Street address line 2 (e.g., Apartment 4B)';
COMMENT ON COLUMN public.provider_profiles.suburb IS 'Suburb (shown publicly)';
COMMENT ON COLUMN public.provider_profiles.city IS 'City/Town';
COMMENT ON COLUMN public.provider_profiles.province IS 'Province';