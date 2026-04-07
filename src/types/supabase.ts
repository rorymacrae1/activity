/**
 * Auto-generated types for Supabase database.
 * Regenerate with: npx supabase gen types typescript --project-id xhfjeoynmcwaslzjxhdt > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      resorts: {
        Row: {
          id: string;
          name: string;
          country: string;
          region: string;
          sub_region: string | null;
          location: Json;
          terrain: Json;
          stats: Json;
          attributes: Json;
          content: Json;
          assets: Json;
          season: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          country: string;
          region: string;
          sub_region?: string | null;
          location: Json;
          terrain: Json;
          stats: Json;
          attributes: Json;
          content: Json;
          assets: Json;
          season: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          country?: string;
          region?: string;
          sub_region?: string | null;
          location?: Json;
          terrain?: Json;
          stats?: Json;
          attributes?: Json;
          content?: Json;
          assets?: Json;
          season?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          has_completed_onboarding: boolean;
          trip_type: "solo" | "couple" | "family" | "friends" | null;
          group_abilities: string[];
          budget_level: "budget" | "mid" | "premium" | "luxury" | null;
          regions: string[];
          crowd_preference: number;
          family_vs_nightlife: number;
          snow_importance: number;
          language: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          has_completed_onboarding?: boolean;
          trip_type?: "solo" | "couple" | "family" | "friends" | null;
          group_abilities?: string[];
          budget_level?: "budget" | "mid" | "premium" | "luxury" | null;
          regions?: string[];
          crowd_preference?: number;
          family_vs_nightlife?: number;
          snow_importance?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          has_completed_onboarding?: boolean;
          trip_type?: "solo" | "couple" | "family" | "friends" | null;
          group_abilities?: string[];
          budget_level?: "budget" | "mid" | "premium" | "luxury" | null;
          regions?: string[];
          crowd_preference?: number;
          family_vs_nightlife?: number;
          snow_importance?: number;
          language?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_favorites: {
        Row: {
          id: string;
          user_id: string;
          resort_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resort_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resort_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience types
export type SupabaseResort = Database["public"]["Tables"]["resorts"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserPreferences =
  Database["public"]["Tables"]["user_preferences"]["Row"];
export type UserFavorite =
  Database["public"]["Tables"]["user_favorites"]["Row"];
