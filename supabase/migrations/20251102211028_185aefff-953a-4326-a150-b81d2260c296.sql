-- Add branch_code and payout_start_date fields to provider_profiles
ALTER TABLE public.provider_profiles 
ADD COLUMN IF NOT EXISTS branch_code text,
ADD COLUMN IF NOT EXISTS payout_start_date date;