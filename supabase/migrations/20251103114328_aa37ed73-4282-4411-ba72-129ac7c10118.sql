-- Make subscription fields nullable and set defaults to NULL for clients
-- These fields are only used for service providers

-- First, make the columns nullable
ALTER TABLE public.user_roles
ALTER COLUMN previews_used DROP NOT NULL,
ALTER COLUMN max_previews DROP NOT NULL,
ALTER COLUMN subscription_status DROP NOT NULL;

-- Set default values to NULL (no subscription) for all users
ALTER TABLE public.user_roles
ALTER COLUMN previews_used SET DEFAULT NULL,
ALTER COLUMN max_previews SET DEFAULT NULL,
ALTER COLUMN subscription_status SET DEFAULT NULL;

-- Update existing client records to have NULL subscription fields
UPDATE public.user_roles
SET 
  previews_used = NULL,
  max_previews = NULL,
  subscription_status = NULL
WHERE role = 'client';

-- Add comment to document that these are provider-only fields
COMMENT ON COLUMN public.user_roles.previews_used IS 'Provider only - tracks style previews used';
COMMENT ON COLUMN public.user_roles.max_previews IS 'Provider only - maximum style previews allowed';
COMMENT ON COLUMN public.user_roles.subscription_status IS 'Provider only - subscription tier (free, premium, etc.)';