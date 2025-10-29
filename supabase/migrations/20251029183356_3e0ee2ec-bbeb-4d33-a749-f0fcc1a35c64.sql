-- Add bank account and payout preference fields to provider_profiles table
ALTER TABLE public.provider_profiles 
ADD COLUMN bank_account_holder_name text,
ADD COLUMN bank_name text,
ADD COLUMN bank_account_number text,
ADD COLUMN payout_frequency text CHECK (payout_frequency IN ('weekly', 'bi-weekly', 'monthly')),
ADD COLUMN payout_date integer CHECK (payout_date IN (15, 25, 30));