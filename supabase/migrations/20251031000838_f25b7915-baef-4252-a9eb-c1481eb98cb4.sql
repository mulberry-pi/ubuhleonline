-- Add terms_accepted field to profiles table
ALTER TABLE public.profiles
ADD COLUMN terms_accepted boolean DEFAULT false NOT NULL;

-- Add comment
COMMENT ON COLUMN public.profiles.terms_accepted IS 'User acceptance of Ubuhle Platform User Agreement';