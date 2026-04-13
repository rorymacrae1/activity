import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { UserPreferences } from "@/types/supabase";
import type { SkillLevel, BudgetLevel, TripType } from "@/types/preferences";
import type { Database } from "@/types/supabase";

type PreferencesInsert =
  Database["public"]["Tables"]["user_preferences"]["Insert"];
type FavoritesInsert = Database["public"]["Tables"]["user_favorites"]["Insert"];

// ─────────────────────────────────────────────────────────────────────────────
// Preferences Sync
// ─────────────────────────────────────────────────────────────────────────────

export interface LocalPreferences {
  hasCompletedOnboarding: boolean;
  tripType: TripType | null;
  groupAbilities: SkillLevel[];
  budgetLevel: BudgetLevel | null;
  regions: string[];
  crowdPreference: number;
  familyVsNightlife: number;
  snowImportance: number;
  language: string;
}

/**
 * Fetch user preferences from Supabase.
 */
export async function fetchCloudPreferences(
  userId: string,
): Promise<UserPreferences | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to fetch cloud preferences:", error.message);
    return null;
  }

  return data as UserPreferences | null;
}

/**
 * Save local preferences to Supabase.
 */
export async function saveCloudPreferences(
  userId: string,
  prefs: LocalPreferences,
): Promise<{ error: Error | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { error: new Error("Supabase not configured") };
  }

  const payload: PreferencesInsert = {
    user_id: userId,
    has_completed_onboarding: prefs.hasCompletedOnboarding,
    trip_type: prefs.tripType,
    group_abilities: prefs.groupAbilities,
    budget_level: prefs.budgetLevel,
    regions: prefs.regions,
    crowd_preference: prefs.crowdPreference,
    family_vs_nightlife: prefs.familyVsNightlife,
    snow_importance: prefs.snowImportance,
    language: prefs.language,
  };

  const { error } = await supabase
    .from("user_preferences")
    .upsert(payload as never, { onConflict: "user_id" });

  return { error: error ? new Error(error.message) : null };
}

/**
 * Convert cloud preferences to local format.
 */
export function cloudToLocalPreferences(
  cloud: UserPreferences,
): LocalPreferences {
  return {
    hasCompletedOnboarding: cloud.has_completed_onboarding,
    tripType: cloud.trip_type as TripType | null,
    groupAbilities: cloud.group_abilities as SkillLevel[],
    budgetLevel: cloud.budget_level as BudgetLevel | null,
    regions: cloud.regions,
    crowdPreference: cloud.crowd_preference,
    familyVsNightlife: cloud.family_vs_nightlife,
    snowImportance: cloud.snow_importance,
    language: cloud.language,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Favorites Sync
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch user's favorite resort IDs from Supabase.
 */
export async function fetchCloudFavorites(
  userId: string,
): Promise<string[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  const { data, error } = await supabase
    .from("user_favorites")
    .select("resort_id")
    .eq("user_id", userId);

  if (error) {
    // eslint-disable-next-line no-console
    console.warn("Failed to fetch cloud favorites:", error.message);
    return null;
  }

  // Type assertion for the select result
  const favorites = data as { resort_id: string }[] | null;
  return favorites?.map((f) => f.resort_id) ?? [];
}

/**
 * Add a favorite resort to Supabase.
 */
export async function addCloudFavorite(
  userId: string,
  resortId: string,
): Promise<{ error: Error | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { error: new Error("Supabase not configured") };
  }

  const payload: FavoritesInsert = { user_id: userId, resort_id: resortId };
  const { error } = await supabase
    .from("user_favorites")
    .upsert(payload as never, { onConflict: "user_id,resort_id" });

  return { error: error ? new Error(error.message) : null };
}

/**
 * Remove a favorite resort from Supabase.
 */
export async function removeCloudFavorite(
  userId: string,
  resortId: string,
): Promise<{ error: Error | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { error: new Error("Supabase not configured") };
  }

  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("resort_id", resortId);

  return { error: error ? new Error(error.message) : null };
}

/**
 * Sync all local favorites to Supabase (replaces cloud state).
 */
export async function syncAllFavoritesToCloud(
  userId: string,
  localFavorites: string[],
): Promise<{ error: Error | null }> {
  if (!supabase || !isSupabaseConfigured) {
    return { error: new Error("Supabase not configured") };
  }

  // Delete all existing favorites for this user
  const { error: deleteError } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId);

  if (deleteError) {
    return { error: new Error(deleteError.message) };
  }

  // Insert all local favorites
  if (localFavorites.length > 0) {
    const payloads: FavoritesInsert[] = localFavorites.map((resortId) => ({
      user_id: userId,
      resort_id: resortId,
    }));

    const { error: insertError } = await supabase
      .from("user_favorites")
      .insert(payloads as never);

    if (insertError) {
      return { error: new Error(insertError.message) };
    }
  }

  return { error: null };
}

// ─────────────────────────────────────────────────────────────────────────────
// Merge Strategy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merge local and cloud favorites (union of both).
 */
export function mergeFavorites(local: string[], cloud: string[]): string[] {
  return [...new Set([...local, ...cloud])];
}

/**
 * Determine which preferences to use.
 * Strategy: If cloud has completed onboarding, use cloud. Otherwise use local.
 */
export function mergePreferences(
  local: LocalPreferences,
  cloud: UserPreferences,
): LocalPreferences {
  // If cloud has completed onboarding, prefer cloud
  if (cloud.has_completed_onboarding) {
    return cloudToLocalPreferences(cloud);
  }
  // Otherwise keep local
  return local;
}
