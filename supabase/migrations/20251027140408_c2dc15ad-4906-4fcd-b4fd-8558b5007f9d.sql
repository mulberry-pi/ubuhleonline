-- Add preview tracking columns to user_roles table
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS previews_used integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_previews integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'free';

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Update existing records to set max_previews based on subscription status
UPDATE public.user_roles 
SET max_previews = CASE 
  WHEN subscription_status = 'subscribed' THEN 3 
  ELSE 1 
END
WHERE max_previews = 1;