-- Create ai_reviews table to store AI analysis results
CREATE TABLE public.ai_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  after_service_image_url text NOT NULL,
  comparison_image_url text NOT NULL,
  comparison_type text NOT NULL CHECK (comparison_type IN ('preview', 'inspiration')),
  similarity_score integer NOT NULL CHECK (similarity_score >= 0 AND similarity_score <= 100),
  ai_summary text NOT NULL,
  is_published boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_reviews ENABLE ROW LEVEL SECURITY;

-- Providers can view their own AI reviews
CREATE POLICY "Providers can view own AI reviews"
ON public.ai_reviews
FOR SELECT
USING (auth.uid() = provider_id);

-- Providers can create their own AI reviews
CREATE POLICY "Providers can create own AI reviews"
ON public.ai_reviews
FOR INSERT
WITH CHECK (auth.uid() = provider_id);

-- Providers can update their own AI reviews
CREATE POLICY "Providers can update own AI reviews"
ON public.ai_reviews
FOR UPDATE
USING (auth.uid() = provider_id);

-- Anyone can view published AI reviews
CREATE POLICY "Anyone can view published AI reviews"
ON public.ai_reviews
FOR SELECT
USING (is_published = true);

-- Add trigger for updated_at
CREATE TRIGGER update_ai_reviews_updated_at
BEFORE UPDATE ON public.ai_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();