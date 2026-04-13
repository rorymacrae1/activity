/**
 * Profile Service
 * Handles user profile data: home airport, visited resorts
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { VisitedResort } from "@/types/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Home Airport
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Update the user's home airport.
 */
export async function setHomeAirport(
  userId: string,
  airport: string,
): Promise<{ error: Error | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { error: new Error("Supabase not configured") };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ home_airport: airport } as never)
    .eq("id", userId);

  return { error: error ? new Error(error.message) : null };
}

/**
 * Get the user's home airport.
 */
export async function getHomeAirport(userId: string): Promise<string | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data } = await supabase
    .from("profiles")
    .select("home_airport")
    .eq("id", userId)
    .single();

  return (data as { home_airport: string | null } | null)?.home_airport ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Visited Resorts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all visited resorts for a user.
 */
export async function getVisitedResorts(
  userId: string,
): Promise<VisitedResort[]> {
  if (!supabase || !isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("visited_resorts")
    .select("*")
    .eq("user_id", userId)
    .order("visited_at", { ascending: false });

  if (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to fetch visited resorts:", error.message);
    return [];
  }

  return data ?? [];
}

/**
 * Add a visited resort.
 */
export async function addVisitedResort(
  userId: string,
  resortId: string,
  options?: {
    visitedAt?: Date;
    notes?: string;
    rating?: number;
  },
): Promise<{ error: Error | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { error: new Error("Supabase not configured") };
  }

  const { error } = await supabase.from("visited_resorts").upsert(
    {
      user_id: userId,
      resort_id: resortId,
      visited_at: options?.visitedAt?.toISOString() ?? null,
      notes: options?.notes ?? null,
      rating: options?.rating ?? null,
    } as never,
    {
      onConflict: "user_id,resort_id",
    },
  );

  return { error: error ? new Error(error.message) : null };
}

/**
 * Remove a visited resort.
 */
export async function removeVisitedResort(
  userId: string,
  resortId: string,
): Promise<{ error: Error | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { error: new Error("Supabase not configured") };
  }

  const { error } = await supabase
    .from("visited_resorts")
    .delete()
    .eq("user_id", userId)
    .eq("resort_id", resortId);

  return { error: error ? new Error(error.message) : null };
}

/**
 * Check if a resort has been visited.
 */
export async function hasVisitedResort(
  userId: string,
  resortId: string,
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  const { data } = await supabase
    .from("visited_resorts")
    .select("id")
    .eq("user_id", userId)
    .eq("resort_id", resortId)
    .single();

  return data !== null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Completion Check
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileCompletionStatus {
  hasHomeAirport: boolean;
  hasVisitedResorts: boolean;
  hasFavorites: boolean;
  isComplete: boolean;
  completionPercentage: number;
}

/**
 * Check profile completion status for personalization features.
 */
export async function getProfileCompletionStatus(
  userId: string,
  favoriteCount: number,
): Promise<ProfileCompletionStatus> {
  const [homeAirport, visitedResorts] = await Promise.all([
    getHomeAirport(userId),
    getVisitedResorts(userId),
  ]);

  const hasHomeAirport = Boolean(homeAirport);
  const hasVisitedResorts = visitedResorts.length > 0;
  const hasFavorites = favoriteCount > 0;

  const completedItems = [
    hasHomeAirport,
    hasVisitedResorts,
    hasFavorites,
  ].filter(Boolean).length;
  const completionPercentage = Math.round((completedItems / 3) * 100);

  return {
    hasHomeAirport,
    hasVisitedResorts,
    hasFavorites,
    isComplete: completedItems === 3,
    completionPercentage,
  };
}
