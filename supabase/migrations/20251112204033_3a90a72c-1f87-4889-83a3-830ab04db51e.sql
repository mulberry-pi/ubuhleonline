-- Create function to allow users to delete their own account
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requesting_user_id uuid;
BEGIN
  -- Get the user ID from the current session
  requesting_user_id := auth.uid();
  
  IF requesting_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete the user from auth.users (will cascade to all related tables)
  DELETE FROM auth.users WHERE id = requesting_user_id;
END;
$$;