-- Create provider_working_hours table for recurring weekly schedule
CREATE TABLE public.provider_working_hours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, day_of_week, start_time, end_time)
);

-- Create blocked_time_slots table for specific date/time blocks
CREATE TABLE public.blocked_time_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (end_time > start_time)
);

-- Enable RLS on both tables
ALTER TABLE public.provider_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_time_slots ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_working_hours
CREATE POLICY "Providers can view own working hours"
ON public.provider_working_hours
FOR SELECT
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can manage own working hours"
ON public.provider_working_hours
FOR ALL
USING (auth.uid() = provider_id);

-- RLS policies for blocked_time_slots
CREATE POLICY "Providers can view own blocked slots"
ON public.blocked_time_slots
FOR SELECT
USING (auth.uid() = provider_id);

CREATE POLICY "Providers can manage own blocked slots"
ON public.blocked_time_slots
FOR ALL
USING (auth.uid() = provider_id);

-- Create indexes for better performance
CREATE INDEX idx_working_hours_provider ON public.provider_working_hours(provider_id);
CREATE INDEX idx_working_hours_day ON public.provider_working_hours(day_of_week);
CREATE INDEX idx_blocked_slots_provider ON public.blocked_time_slots(provider_id);
CREATE INDEX idx_blocked_slots_date ON public.blocked_time_slots(blocked_date);