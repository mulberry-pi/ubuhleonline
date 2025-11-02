-- Create saved_trends table for providers to save trends
CREATE TABLE public.saved_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  trend_id UUID NOT NULL REFERENCES public.trends(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, trend_id)
);

-- Enable RLS
ALTER TABLE public.saved_trends ENABLE ROW LEVEL SECURITY;

-- Providers can view their own saved trends
CREATE POLICY "Providers can view own saved trends"
ON public.saved_trends
FOR SELECT
USING (auth.uid() = provider_id);

-- Providers can save trends
CREATE POLICY "Providers can save trends"
ON public.saved_trends
FOR INSERT
WITH CHECK (auth.uid() = provider_id);

-- Providers can unsave trends
CREATE POLICY "Providers can unsave trends"
ON public.saved_trends
FOR DELETE
USING (auth.uid() = provider_id);

-- Create index for better query performance
CREATE INDEX idx_saved_trends_provider_id ON public.saved_trends(provider_id);
CREATE INDEX idx_saved_trends_trend_id ON public.saved_trends(trend_id);