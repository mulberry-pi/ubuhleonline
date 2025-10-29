-- Reset preview counter for testing
UPDATE public.user_roles 
SET previews_used = 0 
WHERE user_id = '8b11c08a-8729-4ecd-9330-57a8d15072e7';