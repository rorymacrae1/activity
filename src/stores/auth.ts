import { create } from "zustand";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Profile } from "@/types/supabase";

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<{ error: AuthError | null; session: Session | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithApple: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (
    updates: Partial<
      Pick<Profile, "display_name" | "avatar_url" | "home_airport">
    >,
  ) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

/**
 * Zustand store for authentication state.
 * Handles sign up, sign in, sign out, and profile management.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  /**
   * Initialize auth state and set up listener.
   * Call this once on app startup.
   */
  initialize: async () => {
    if (!supabase || !isSupabaseConfigured) {
      set({ isLoading: false, isInitialized: true });
      return;
    }

    // Get initial session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      set({ user: session.user, session });
      await get().refreshProfile();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ user: session?.user ?? null, session });

      if (session?.user) {
        await get().refreshProfile();
      } else {
        set({ profile: null });
      }
    });

    set({ isLoading: false, isInitialized: true });
  },

  /**
   * Sign up with email and password.
   */
  signUp: async (email, password, displayName) => {
    if (!supabase)
      return { error: new AuthError("Supabase not configured"), session: null };

    set({ isLoading: true });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    set({ isLoading: false });

    if (!error && data.user) {
      set({ user: data.user, session: data.session });
    }

    return { error, session: data?.session ?? null };
  },

  /**
   * Sign in with email and password.
   */
  signIn: async (email, password) => {
    if (!supabase) return { error: new AuthError("Supabase not configured") };

    set({ isLoading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    set({ isLoading: false });

    if (!error && data.user) {
      set({ user: data.user, session: data.session });
    }

    return { error };
  },

  /**
   * Sign in with Google OAuth.
   */
  signInWithGoogle: async () => {
    if (!supabase) return { error: new AuthError("Supabase not configured") };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "peakwise://auth/callback",
      },
    });

    return { error };
  },

  /**
   * Sign in with Apple.
   */
  signInWithApple: async () => {
    if (!supabase) return { error: new AuthError("Supabase not configured") };

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: "peakwise://auth/callback",
      },
    });

    return { error };
  },

  /**
   * Sign out.
   */
  signOut: async () => {
    if (!supabase) return;

    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null, isLoading: false });
  },

  /**
   * Fetch the user's profile from the database.
   */
  refreshProfile: async () => {
    const { user } = get();
    if (!supabase || !user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      set({ profile: data as Profile });
    }
  },

  /**
   * Update the user's profile.
   */
  updateProfile: async (updates) => {
    const { user } = get();
    if (!supabase || !user) {
      return { error: new Error("Not authenticated") };
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates as never)
      .eq("id", user.id);

    if (!error) {
      await get().refreshProfile();
    }

    return { error: error ? new Error(error.message) : null };
  },
}));

// ─────────────────────────────────────────────────────────────────────────────
// Convenience hooks
// ─────────────────────────────────────────────────────────────────────────────

/** Check if user is authenticated */
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.user !== null);

/** Get current user (or null) */
export const useUser = () => useAuthStore((state) => state.user);

/** Get current profile (or null) */
export const useProfile = () => useAuthStore((state) => state.profile);

/** Check if auth is still loading */
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
