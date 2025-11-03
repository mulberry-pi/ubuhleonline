-- Add deposit_percentage and service_policy_url columns to provider_profiles
ALTER TABLE public.provider_profiles 
ADD COLUMN deposit_percentage integer DEFAULT 50 CHECK (deposit_percentage >= 0 AND deposit_percentage <= 100),
ADD COLUMN service_policy_url text;