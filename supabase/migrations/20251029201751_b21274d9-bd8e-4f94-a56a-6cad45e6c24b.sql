-- Update RLS policy to hide business address from public view
-- Only show address to the provider themselves or to clients who have paid deposits

DROP POLICY IF EXISTS "Public can view non-sensitive provider data" ON public.provider_profiles;

CREATE POLICY "Public can view basic provider data" 
ON public.provider_profiles
FOR SELECT 
USING (
  is_public = true 
  AND (
    auth.uid() = user_id  -- Provider can see their own full profile
    OR (
      -- Public can see everything except sensitive financial and address data
      business_address IS NULL 
      OR business_address = ''
    )
  )
);

-- Allow clients to see provider address only if they have a confirmed paid appointment
CREATE POLICY "Clients can view provider address after payment" 
ON public.provider_profiles
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM public.appointments a
    WHERE a.provider_id = provider_profiles.user_id
      AND a.client_id = auth.uid()
      AND a.status IN ('confirmed', 'completed')
  )
);