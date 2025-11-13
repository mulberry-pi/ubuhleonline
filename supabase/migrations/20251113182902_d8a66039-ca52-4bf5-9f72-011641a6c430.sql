-- Add deletion scheduling field to provider profiles
ALTER TABLE public.provider_profiles 
ADD COLUMN deletion_scheduled_date date;

-- Add comment explaining the field
COMMENT ON COLUMN public.provider_profiles.deletion_scheduled_date IS 'Date when the provider account is scheduled for deletion (30 days from request)';
