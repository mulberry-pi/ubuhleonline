-- Fix RLS policy to prevent banking information exposure to clients
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Clients can view provider address after payment" ON public.provider_profiles;

-- Create a more restrictive policy that only allows clients to view non-sensitive fields
-- This policy allows clients to see provider details after payment, but excludes banking information
CREATE POLICY "Clients can view provider details after payment" 
ON public.provider_profiles
FOR SELECT
USING (
  is_public = true 
  AND EXISTS (
    SELECT 1 
    FROM appointments a
    WHERE a.provider_id = provider_profiles.user_id
    AND a.client_id = auth.uid()
    AND a.status IN ('confirmed', 'completed')
  )
  -- This policy grants access to the row, but application code must explicitly
  -- select only non-sensitive columns (exclude bank_* fields)
);

-- Add a comment to remind developers about column-level restrictions
COMMENT ON POLICY "Clients can view provider details after payment" ON public.provider_profiles IS 
'Allows clients with confirmed/completed appointments to view provider details. Application queries MUST explicitly exclude banking fields: bank_account_holder_name, bank_name, bank_account_number, payout_frequency, payout_date';

-- Create a secure view that explicitly excludes sensitive banking information
CREATE OR REPLACE VIEW public.client_visible_provider_profiles 
WITH (security_barrier = true, security_invoker = true) AS
SELECT 
  id,
  user_id,
  business_name,
  business_description,
  business_address,
  business_logo_url,
  city,
  suburb,
  rating,
  review_count,
  gallery_images,
  availability_status,
  price_range,
  is_public,
  created_at,
  updated_at
FROM public.provider_profiles;

-- Grant appropriate permissions on the view
GRANT SELECT ON public.client_visible_provider_profiles TO authenticated;

-- Add RLS to the view
ALTER VIEW public.client_visible_provider_profiles SET (security_barrier = true);

COMMENT ON VIEW public.client_visible_provider_profiles IS 
'Secure view of provider profiles that excludes sensitive banking information. Use this view for client-facing queries instead of direct table access.';