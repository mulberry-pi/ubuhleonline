-- Fix provider_profiles RLS to exclude sensitive bank data from public access
DROP POLICY IF EXISTS "Anyone can view public provider profiles" ON public.provider_profiles;

CREATE POLICY "Public can view non-sensitive provider data"
ON public.provider_profiles
FOR SELECT
USING (
  is_public = true 
  AND (
    -- Only allow viewing these specific non-sensitive columns when not the owner
    CASE 
      WHEN auth.uid() = user_id THEN true
      ELSE (
        -- For public access, we'll handle column filtering in the application layer
        -- But we ensure bank details are never exposed via the policy
        bank_account_number IS NULL OR bank_account_number = ''
      )
    END
    OR auth.uid() = user_id
  )
);

CREATE POLICY "Providers can view own full profile"
ON public.provider_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Create a secure view for public provider profiles without sensitive data
CREATE OR REPLACE VIEW public.public_provider_profiles AS
SELECT 
  id,
  user_id,
  business_name,
  business_description,
  business_logo_url,
  business_address,
  city,
  suburb,
  availability_status,
  price_range,
  is_public,
  rating,
  review_count,
  gallery_images,
  created_at,
  updated_at
FROM public.provider_profiles
WHERE is_public = true;

-- Grant access to the view
GRANT SELECT ON public.public_provider_profiles TO authenticated, anon;

-- Fix calendar_sync_settings to prevent token exposure
DROP POLICY IF EXISTS "Users can view own calendar settings" ON public.calendar_sync_settings;

-- Create security definer function to get calendar sync status (without tokens)
CREATE OR REPLACE FUNCTION public.get_calendar_sync_status(_user_id uuid)
RETURNS TABLE(
  id uuid,
  provider text,
  is_enabled boolean,
  token_expiry timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    provider,
    is_enabled,
    token_expiry,
    created_at,
    updated_at
  FROM public.calendar_sync_settings
  WHERE user_id = _user_id;
$$;

-- Create security definer function to update calendar tokens (server-side only)
CREATE OR REPLACE FUNCTION public.update_calendar_tokens(
  _user_id uuid,
  _provider text,
  _access_token text,
  _refresh_token text,
  _token_expiry timestamp with time zone
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _setting_id uuid;
BEGIN
  -- Only allow users to update their own settings
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  INSERT INTO public.calendar_sync_settings (
    user_id,
    provider,
    access_token,
    refresh_token,
    token_expiry,
    is_enabled
  )
  VALUES (
    _user_id,
    _provider,
    _access_token,
    _refresh_token,
    _token_expiry,
    true
  )
  ON CONFLICT (user_id, provider) 
  DO UPDATE SET
    access_token = _access_token,
    refresh_token = _refresh_token,
    token_expiry = _token_expiry,
    is_enabled = true,
    updated_at = now()
  RETURNING id INTO _setting_id;

  RETURN _setting_id;
END;
$$;

-- Remove all SELECT policies on calendar_sync_settings
-- Users can only access via security definer functions
CREATE POLICY "No direct client access to calendar tokens"
ON public.calendar_sync_settings
FOR SELECT
USING (false);

-- Allow users to update non-token fields only
CREATE POLICY "Users can update calendar sync status"
ON public.calendar_sync_settings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND access_token IS NULL 
  AND refresh_token IS NULL
);

-- Keep insert and delete policies for edge function use
-- (Edge functions run with service role, bypassing RLS)