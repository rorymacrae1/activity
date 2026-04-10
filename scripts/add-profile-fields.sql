-- Add home_airport to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS home_airport text DEFAULT NULL;

-- Create visited_resorts table
CREATE TABLE IF NOT EXISTS public.visited_resorts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resort_id text NOT NULL,
  visited_at timestamptz DEFAULT now(),
  notes text,
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, resort_id)
);

-- Enable RLS
ALTER TABLE public.visited_resorts ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own visited resorts
CREATE POLICY "Users can view own visited resorts"
  ON public.visited_resorts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visited resorts"
  ON public.visited_resorts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visited resorts"
  ON public.visited_resorts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own visited resorts"
  ON public.visited_resorts FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_visited_resorts_user_id ON public.visited_resorts(user_id);
