-- Migration 005: Add hero_image column to resort table
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xhfjeoynmcwaslzjxhdt/sql
--
-- After running this migration, populate the column using:
--   UNSPLASH_ACCESS_KEY=your-key SUPABASE_SERVICE_KEY=your-key node scripts/update-resort-images.mjs

ALTER TABLE public.resort
  ADD COLUMN IF NOT EXISTS hero_image TEXT;
