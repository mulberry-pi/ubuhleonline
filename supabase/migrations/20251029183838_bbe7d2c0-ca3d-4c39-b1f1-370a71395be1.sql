-- Add calendar sync preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN google_calendar_enabled boolean DEFAULT false,
ADD COLUMN google_calendar_refresh_token text,
ADD COLUMN phone_calendar_enabled boolean DEFAULT false;

-- Create calendar sync settings table
CREATE TABLE public.calendar_sync_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL CHECK (provider IN ('google', 'apple', 'outlook')),
  access_token text,
  refresh_token text,
  token_expiry timestamp with time zone,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
ALTER TABLE public.calendar_sync_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_sync_settings
CREATE POLICY "Users can view own calendar settings"
  ON public.calendar_sync_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar settings"
  ON public.calendar_sync_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calendar settings"
  ON public.calendar_sync_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar settings"
  ON public.calendar_sync_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for portfolio images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for portfolio images
CREATE POLICY "Anyone can view portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

CREATE POLICY "Authenticated users can upload portfolio images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own portfolio images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own portfolio images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'portfolio-images' AND auth.uid()::text = (storage.foldername(name))[1]);