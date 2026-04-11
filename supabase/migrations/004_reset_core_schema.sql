-- Migration 004: Reset core schema with correct UUID types
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/xhfjeoynmcwaslzjxhdt/sql
--
-- This migration drops and recreates profiles, user_preferences, and user_favorites
-- with the correct UUID primary key schema, then backfills existing auth users.
-- visited_resorts is left untouched (already created correctly in 003).

-- =============================================================================
-- 1. DROP EXISTING TABLES (CASCADE removes dependent policies/triggers)
-- =============================================================================
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.user_preferences CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =============================================================================
-- 2. USER PROFILES
-- =============================================================================
CREATE TABLE public.profiles (
  id           UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT,
  display_name TEXT,
  avatar_url   TEXT,
  home_airport TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =============================================================================
-- 3. USER PREFERENCES
-- =============================================================================
CREATE TABLE public.user_preferences (
  id                      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  trip_type               TEXT    CHECK (trip_type IN ('solo', 'couple', 'family', 'friends')),
  group_abilities         TEXT[]  DEFAULT '{}',
  budget_level            TEXT    CHECK (budget_level IN ('budget', 'mid', 'premium', 'luxury')),
  regions                 TEXT[]  DEFAULT '{}',
  crowd_preference        INTEGER DEFAULT 3 CHECK (crowd_preference BETWEEN 1 AND 5),
  family_vs_nightlife     INTEGER DEFAULT 3 CHECK (family_vs_nightlife BETWEEN 1 AND 5),
  snow_importance         INTEGER DEFAULT 3 CHECK (snow_importance BETWEEN 1 AND 5),
  language                TEXT    DEFAULT 'en',
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 4. USER FAVORITES
-- =============================================================================
CREATE TABLE public.user_favorites (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resort_id  TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resort_id)
);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- 5. FUNCTIONS & TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 6. INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id   ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_resort_id ON public.user_favorites(resort_id);

-- =============================================================================
-- 7. BACKFILL EXISTING AUTH USERS
-- Creates profile + preferences rows for users who signed up before the trigger
-- =============================================================================
INSERT INTO public.profiles (id, email, display_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
