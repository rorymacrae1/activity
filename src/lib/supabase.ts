import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Supabase client instance.
 *
 * Environment variables are loaded via Expo's EXPO_PUBLIC_ prefix.
 * Set these in .env.local (see .env.example for template).
 */

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True if Supabase credentials are configured */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Typed Supabase client.
 * Will be null if credentials are not configured (check isSupabaseConfigured first).
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Persist auth state — uses AsyncStorage on native, localStorage on web
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
