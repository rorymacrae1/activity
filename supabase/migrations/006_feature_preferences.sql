-- Migration 006: Add feature_preferences column to user_preferences
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xhfjeoynmcwaslzjxhdt/sql
--
-- Stores the user's optional "must-have" feature selections from the
-- review quiz screen (e.g. ski-in/out, snow park, train access, off-piste).

ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS feature_preferences TEXT[] DEFAULT '{}';

-- Index for potential future filtering
CREATE INDEX IF NOT EXISTS idx_user_preferences_feature_preferences
  ON public.user_preferences USING GIN (feature_preferences);
