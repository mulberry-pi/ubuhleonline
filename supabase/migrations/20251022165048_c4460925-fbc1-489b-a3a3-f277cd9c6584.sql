-- Fix Security Issue 1: Restrict profiles table to only show own profile
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Fix Security Issue 2: Add foreign key constraints to appointments
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_client_id_fkey,
DROP CONSTRAINT IF EXISTS appointments_provider_id_fkey,
DROP CONSTRAINT IF EXISTS appointments_service_id_fkey;

ALTER TABLE public.appointments
ADD CONSTRAINT appointments_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT appointments_provider_id_fkey 
  FOREIGN KEY (provider_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
ADD CONSTRAINT appointments_service_id_fkey 
  FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;

-- Add check to ensure service belongs to the provider
CREATE OR REPLACE FUNCTION public.validate_appointment_service()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.services 
    WHERE id = NEW.service_id 
    AND provider_id = NEW.provider_id
  ) THEN
    RAISE EXCEPTION 'Service does not belong to the specified provider';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS validate_appointment_service_trigger ON public.appointments;
CREATE TRIGGER validate_appointment_service_trigger
BEFORE INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.validate_appointment_service();

-- Fix Security Issue 3: Restrict message updates to only marking as read
DROP POLICY IF EXISTS "Users can update own sent messages" ON public.messages;

CREATE POLICY "Receivers can mark messages as read" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = receiver_id)
WITH CHECK (
  auth.uid() = receiver_id 
  AND is_read IS DISTINCT FROM (SELECT is_read FROM public.messages WHERE id = messages.id)
);