-- Drop the problematic function and its dependent triggers
DROP FUNCTION IF EXISTS public.sync_user_role_on_profile_insert() CASCADE;

-- Now insert the profile
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
VALUES (
  '8b11c08a-8729-4ecd-9330-57a8d15072e7',
  'a_mshumpela@icloud.com',
  'Aisha Mshumpela',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  updated_at = now();