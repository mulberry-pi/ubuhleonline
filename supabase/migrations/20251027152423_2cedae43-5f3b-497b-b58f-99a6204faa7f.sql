-- Drop the policy that depends on role column first
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Now we can safely drop the role column
ALTER TABLE public.profiles DROP COLUMN role;

-- Add missing DELETE policies for appointments
CREATE POLICY "Users can delete own appointments"
ON public.appointments FOR DELETE
USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- Add missing DELETE policies for messages
CREATE POLICY "Users can delete sent messages"
ON public.messages FOR DELETE
USING (auth.uid() = sender_id);

-- Add missing DELETE policies for profiles
CREATE POLICY "Users can delete own profile"
ON public.profiles FOR DELETE
USING (auth.uid() = id);

-- Add missing DELETE policies for provider_profiles
CREATE POLICY "Providers can delete own profile"
ON public.provider_profiles FOR DELETE
USING (auth.uid() = user_id);

-- Recreate profiles UPDATE policy without role check
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Update user_roles table to allow service role to insert roles
CREATE POLICY "Service role can manage user roles"
ON public.user_roles FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Add INSERT/UPDATE policies for trends table (for service operations)
CREATE POLICY "Service role can manage trends"
ON public.trends FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');