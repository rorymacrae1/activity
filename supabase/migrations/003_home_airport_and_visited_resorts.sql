-- Migration 003: Home airport column + visited resorts table
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xhfjeoynmcwaslzjxhdt/sql

-- =============================================================================
-- 1. ADD home_airport TO profiles
-- =============================================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS home_airport TEXT;

-- =============================================================================
-- 2. CREATE visited_resorts TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.visited_resorts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resort_id   TEXT        NOT NULL,
  visited_at  TIMESTAMPTZ DEFAULT NOW(),
  notes       TEXT,
  rating      SMALLINT    CHECK (rating BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, resort_id)
);

-- Enable RLS
ALTER TABLE public.visited_resorts ENABLE ROW LEVEL SECURITY;

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
