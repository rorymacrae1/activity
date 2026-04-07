-- PeakWise Resorts Table
-- Run this in Supabase SQL Editor after the initial schema migration

-- =============================================================================
-- RESORTS TABLE (ski resort data)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.resorts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT NOT NULL,
  sub_region TEXT,
  location JSONB NOT NULL,
  terrain JSONB NOT NULL,
  stats JSONB NOT NULL,
  attributes JSONB NOT NULL,
  content JSONB NOT NULL,
  assets JSONB NOT NULL,
  season JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (but allow public read access)
ALTER TABLE public.resorts ENABLE ROW LEVEL SECURITY;

-- Anyone can read resorts (public data)
CREATE POLICY "Resorts are publicly readable"
  ON public.resorts FOR SELECT
  USING (true);

-- Only authenticated users with admin role can modify (future)
-- For now, use service role key to insert via scripts

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_resorts_country ON public.resorts(country);
CREATE INDEX IF NOT EXISTS idx_resorts_region ON public.resorts(region);
CREATE INDEX IF NOT EXISTS idx_resorts_name ON public.resorts(name);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS resorts_updated_at ON public.resorts;
CREATE TRIGGER resorts_updated_at
  BEFORE UPDATE ON public.resorts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
