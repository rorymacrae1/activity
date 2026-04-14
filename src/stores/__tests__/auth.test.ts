import { act } from "react";
import { AuthError } from "@supabase/supabase-js";

// ─── Supabase auth mock ──────────────────────────────────────────────────────

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockSignOut = jest.fn();
const mockResetPasswordForEmail = jest.fn();

const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();

jest.mock("@/lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) =>
        mockSignInWithPassword(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      resetPasswordForEmail: (...args: unknown[]) =>
        mockResetPasswordForEmail(...args),
    },
    from: (...args: unknown[]) => mockFrom(...args),
  },
}));

// Chain helpers for from().select().eq().single()
function setupProfileQuery(profile: Record<string, unknown> | null) {
  mockSingle.mockResolvedValue({ data: profile, error: null });
  mockEq.mockReturnValue({ single: mockSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockFrom.mockReturnValue({
    select: mockSelect,
    update: mockUpdate,
  });
}

function setupProfileUpdate(error: { message: string } | null = null) {
  const updateEq = jest
    .fn()
    .mockResolvedValue({ error: error ? { message: error.message } : null });
  mockUpdate.mockReturnValue({ eq: updateEq });
  mockFrom.mockReturnValue({
    select: mockSelect,
    update: mockUpdate,
  });
}

// ─── Import after mock is set up ────────────────────────────────────────────

import {
  useAuthStore,
  useIsAuthenticated,
  useUser,
  useProfile,
  useAuthLoading,
} from "@stores/auth";

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_USER = {
  id: "user-123",
  email: "test@example.com",
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: { display_name: "Test User" },
  created_at: "2025-01-01T00:00:00Z",
};

const MOCK_SESSION = {
  access_token: "access-token",
  refresh_token: "refresh-token",
  expires_in: 3600,
  token_type: "bearer",
  user: MOCK_USER,
};

const MOCK_PROFILE = {
  id: "user-123",
  email: "test@example.com",
  display_name: "Test User",
  avatar_url: null,
  home_airport: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  act(() =>
    useAuthStore.setState({
      user: null,
      session: null,
      profile: null,
      isLoading: true,
      isInitialized: false,
    }),
  );

  // Default: no existing session, no-op listener
  mockGetSession.mockResolvedValue({ data: { session: null } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });

  setupProfileQuery(MOCK_PROFILE);
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("useAuthStore", () => {
  describe("initial state", () => {
    it("starts with no user, loading true, not initialized", () => {
      const s = useAuthStore.getState();
      expect(s.user).toBeNull();
      expect(s.session).toBeNull();
      expect(s.profile).toBeNull();
      expect(s.isLoading).toBe(true);
      expect(s.isInitialized).toBe(false);
    });
  });

  // ── initialize ──────────────────────────────────────────────────────────

  describe("initialize", () => {
    it("sets isInitialized and stops loading when no session exists", async () => {
      await act(() => useAuthStore.getState().initialize());

      const s = useAuthStore.getState();
      expect(s.isInitialized).toBe(true);
      expect(s.isLoading).toBe(false);
      expect(s.user).toBeNull();
      expect(s.session).toBeNull();
    });

    it("restores user and session from existing session", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: MOCK_SESSION },
      });

      await act(() => useAuthStore.getState().initialize());

      const s = useAuthStore.getState();
      expect(s.user).toEqual(MOCK_USER);
      expect(s.session).toEqual(MOCK_SESSION);
      expect(s.isInitialized).toBe(true);
      expect(s.isLoading).toBe(false);
    });

    it("fetches profile when session exists", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: MOCK_SESSION },
      });

      await act(() => useAuthStore.getState().initialize());

      expect(mockFrom).toHaveBeenCalledWith("profiles");
      expect(useAuthStore.getState().profile).toEqual(MOCK_PROFILE);
    });

    it("sets up auth state change listener", async () => {
      await act(() => useAuthStore.getState().initialize());
      expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
    });

    it("does not crash when profile fetch fails during init", async () => {
      mockGetSession.mockResolvedValue({
        data: { session: MOCK_SESSION },
      });
      mockSingle.mockRejectedValue(new Error("Network error"));

      await act(() => useAuthStore.getState().initialize());

      const s = useAuthStore.getState();
      expect(s.user).toEqual(MOCK_USER);
      expect(s.isInitialized).toBe(true);
      expect(s.isLoading).toBe(false);
    });

    it("handles auth state change to signed-in", async () => {
      let capturedCallback: (
        event: string,
        session: typeof MOCK_SESSION | null,
      ) => void;
      mockOnAuthStateChange.mockImplementation((cb: typeof capturedCallback) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      await act(() => useAuthStore.getState().initialize());

      // Re-setup profile mock for the callback
      setupProfileQuery(MOCK_PROFILE);

      await act(async () => {
        capturedCallback("SIGNED_IN", MOCK_SESSION);
        // Give async refreshProfile time to resolve
        await Promise.resolve();
      });

      const s = useAuthStore.getState();
      expect(s.user).toEqual(MOCK_USER);
      expect(s.session).toEqual(MOCK_SESSION);
    });

    it("clears profile on auth state change to signed-out", async () => {
      let capturedCallback: (
        event: string,
        session: typeof MOCK_SESSION | null,
      ) => void;
      mockOnAuthStateChange.mockImplementation((cb: typeof capturedCallback) => {
        capturedCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      // Start signed in
      mockGetSession.mockResolvedValue({
        data: { session: MOCK_SESSION },
      });
      await act(() => useAuthStore.getState().initialize());

      // Simulate sign out event
      await act(async () => {
        capturedCallback("SIGNED_OUT", null);
        await Promise.resolve();
      });

      const s = useAuthStore.getState();
      expect(s.user).toBeNull();
      expect(s.session).toBeNull();
      expect(s.profile).toBeNull();
    });
  });

  // ── signUp ──────────────────────────────────────────────────────────────

  describe("signUp", () => {
    it("returns session on success and sets user", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: MOCK_USER, session: MOCK_SESSION },
        error: null,
      });

      let result: { error: AuthError | null; session: unknown };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .signUp("test@example.com", "password123", "Test User");
      });

      expect(result!.error).toBeNull();
      expect(result!.session).toEqual(MOCK_SESSION);
      expect(useAuthStore.getState().user).toEqual(MOCK_USER);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("passes display name in options", async () => {
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      await act(() =>
        useAuthStore
          .getState()
          .signUp("test@example.com", "password123", "My Name"),
      );

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        options: { data: { display_name: "My Name" } },
      });
    });

    it("returns error on failure without setting user", async () => {
      const authError = new AuthError("Email already registered");
      mockSignUp.mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      let result: { error: AuthError | null; session: unknown };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .signUp("test@example.com", "password123");
      });

      expect(result!.error).toBe(authError);
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  // ── signIn ──────────────────────────────────────────────────────────────

  describe("signIn", () => {
    it("sets user and session on success", async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: MOCK_USER, session: MOCK_SESSION },
        error: null,
      });

      let result: { error: AuthError | null };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .signIn("test@example.com", "password123");
      });

      expect(result!.error).toBeNull();
      expect(useAuthStore.getState().user).toEqual(MOCK_USER);
      expect(useAuthStore.getState().session).toEqual(MOCK_SESSION);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("returns error on failure", async () => {
      const authError = new AuthError("Invalid credentials");
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      let result: { error: AuthError | null };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .signIn("test@example.com", "wrong");
      });

      expect(result!.error).toBe(authError);
      expect(useAuthStore.getState().user).toBeNull();
    });
  });

  // ── signInWithGoogle ────────────────────────────────────────────────────

  describe("signInWithGoogle", () => {
    it("calls signInWithOAuth with google provider", async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      let result: { error: AuthError | null };
      await act(async () => {
        result = await useAuthStore.getState().signInWithGoogle();
      });

      expect(result!.error).toBeNull();
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: { redirectTo: "peakwise://auth/callback" },
      });
    });

    it("returns error on failure", async () => {
      const authError = new AuthError("OAuth error");
      mockSignInWithOAuth.mockResolvedValue({ error: authError });

      let result: { error: AuthError | null };
      await act(async () => {
        result = await useAuthStore.getState().signInWithGoogle();
      });

      expect(result!.error).toBe(authError);
    });
  });

  // ── signInWithApple ─────────────────────────────────────────────────────

  describe("signInWithApple", () => {
    it("calls signInWithOAuth with apple provider", async () => {
      mockSignInWithOAuth.mockResolvedValue({ error: null });

      await act(() => useAuthStore.getState().signInWithApple());

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "apple",
        options: { redirectTo: "peakwise://auth/callback" },
      });
    });
  });

  // ── signOut ─────────────────────────────────────────────────────────────

  describe("signOut", () => {
    it("clears user, session, and profile", async () => {
      // Start signed in
      act(() =>
        useAuthStore.setState({
          user: MOCK_USER as never,
          session: MOCK_SESSION as never,
          profile: MOCK_PROFILE as never,
        }),
      );

      mockSignOut.mockResolvedValue({ error: null });

      await act(() => useAuthStore.getState().signOut());

      const s = useAuthStore.getState();
      expect(s.user).toBeNull();
      expect(s.session).toBeNull();
      expect(s.profile).toBeNull();
      expect(s.isLoading).toBe(false);
    });

    it("calls supabase.auth.signOut", async () => {
      mockSignOut.mockResolvedValue({ error: null });

      await act(() => useAuthStore.getState().signOut());

      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  // ── resetPassword ───────────────────────────────────────────────────────

  describe("resetPassword", () => {
    it("calls resetPasswordForEmail with redirect", async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null });

      let result: { error: AuthError | null };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .resetPassword("test@example.com");
      });

      expect(result!.error).toBeNull();
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith(
        "test@example.com",
        { redirectTo: "peakwise://auth/reset-password" },
      );
    });

    it("returns error on failure", async () => {
      const authError = new AuthError("Rate limit exceeded");
      mockResetPasswordForEmail.mockResolvedValue({ error: authError });

      let result: { error: AuthError | null };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .resetPassword("test@example.com");
      });

      expect(result!.error).toBe(authError);
    });
  });

  // ── refreshProfile ──────────────────────────────────────────────────────

  describe("refreshProfile", () => {
    it("fetches profile from supabase for current user", async () => {
      act(() => useAuthStore.setState({ user: MOCK_USER as never }));

      setupProfileQuery(MOCK_PROFILE);

      await act(() => useAuthStore.getState().refreshProfile());

      expect(mockFrom).toHaveBeenCalledWith("profiles");
      expect(useAuthStore.getState().profile).toEqual(MOCK_PROFILE);
    });

    it("no-ops when user is null", async () => {
      act(() => useAuthStore.setState({ user: null }));

      await act(() => useAuthStore.getState().refreshProfile());

      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("does not set profile when query returns null", async () => {
      act(() => useAuthStore.setState({ user: MOCK_USER as never }));
      setupProfileQuery(null);

      await act(() => useAuthStore.getState().refreshProfile());

      expect(useAuthStore.getState().profile).toBeNull();
    });
  });

  // ── updateProfile ───────────────────────────────────────────────────────

  describe("updateProfile", () => {
    it("updates profile and refreshes", async () => {
      act(() =>
        useAuthStore.setState({
          user: MOCK_USER as never,
          profile: MOCK_PROFILE as never,
        }),
      );

      setupProfileUpdate(null);
      setupProfileQuery({
        ...MOCK_PROFILE,
        display_name: "New Name",
      });

      let result: { error: Error | null };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .updateProfile({ display_name: "New Name" });
      });

      expect(result!.error).toBeNull();
      expect(mockFrom).toHaveBeenCalledWith("profiles");
    });

    it("returns error when not authenticated", async () => {
      act(() => useAuthStore.setState({ user: null }));

      let result: { error: Error | null };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .updateProfile({ display_name: "Name" });
      });

      expect(result!.error).toEqual(new Error("Not authenticated"));
    });

    it("returns error when update fails", async () => {
      act(() => useAuthStore.setState({ user: MOCK_USER as never }));

      setupProfileUpdate({ message: "Update failed" });

      let result: { error: Error | null };
      await act(async () => {
        result = await useAuthStore
          .getState()
          .updateProfile({ display_name: "Name" });
      });

      expect(result!.error).toEqual(new Error("Update failed"));
    });
  });

  // ── Selector logic (convenience hooks use getState selectors) ─────────

  describe("selector logic", () => {
    it("user is null when not authenticated", () => {
      expect(useAuthStore.getState().user).toBeNull();
    });

    it("user is set when authenticated", () => {
      act(() => useAuthStore.setState({ user: MOCK_USER as never }));
      expect(useAuthStore.getState().user).toEqual(MOCK_USER);
    });

    it("profile is null when not loaded", () => {
      expect(useAuthStore.getState().profile).toBeNull();
    });

    it("profile is set when loaded", () => {
      act(() => useAuthStore.setState({ profile: MOCK_PROFILE as never }));
      expect(useAuthStore.getState().profile).toEqual(MOCK_PROFILE);
    });

    it("isLoading reflects loading state", () => {
      act(() => useAuthStore.setState({ isLoading: true }));
      expect(useAuthStore.getState().isLoading).toBe(true);

      act(() => useAuthStore.setState({ isLoading: false }));
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it("convenience selectors are exported", () => {
      expect(typeof useIsAuthenticated).toBe("function");
      expect(typeof useUser).toBe("function");
      expect(typeof useProfile).toBe("function");
      expect(typeof useAuthLoading).toBe("function");
    });
  });
});

// ── Supabase not configured ────────────────────────────────────────────────

describe("useAuthStore (supabase not configured)", () => {
  beforeEach(() => {
    // Simulate supabase = null by making the mock module re-export null
    // We test this via the guard branches in the store
    jest.clearAllMocks();
    act(() =>
      useAuthStore.setState({
        user: null,
        session: null,
        profile: null,
        isLoading: true,
        isInitialized: false,
      }),
    );
  });

  it("signUp returns error when supabase not configured", async () => {
    // Override the mock to simulate null supabase
    const supabaseMod = jest.requireMock("@/lib/supabase");
    const originalSupabase = supabaseMod.supabase;
    supabaseMod.supabase = null;

    let result: { error: AuthError | null; session: unknown };
    await act(async () => {
      result = await useAuthStore
        .getState()
        .signUp("test@example.com", "pass");
    });

    expect(result!.error).toBeInstanceOf(AuthError);
    expect(result!.error?.message).toBe("Supabase not configured");

    supabaseMod.supabase = originalSupabase;
  });

  it("signIn returns error when supabase not configured", async () => {
    const supabaseMod = jest.requireMock("@/lib/supabase");
    const originalSupabase = supabaseMod.supabase;
    supabaseMod.supabase = null;

    let result: { error: AuthError | null };
    await act(async () => {
      result = await useAuthStore
        .getState()
        .signIn("test@example.com", "pass");
    });

    expect(result!.error).toBeInstanceOf(AuthError);

    supabaseMod.supabase = originalSupabase;
  });

  it("signOut is a no-op when supabase not configured", async () => {
    const supabaseMod = jest.requireMock("@/lib/supabase");
    const originalSupabase = supabaseMod.supabase;
    supabaseMod.supabase = null;

    await act(() => useAuthStore.getState().signOut());

    expect(mockSignOut).not.toHaveBeenCalled();

    supabaseMod.supabase = originalSupabase;
  });

  it("resetPassword returns error when supabase not configured", async () => {
    const supabaseMod = jest.requireMock("@/lib/supabase");
    const originalSupabase = supabaseMod.supabase;
    supabaseMod.supabase = null;

    let result: { error: AuthError | null };
    await act(async () => {
      result = await useAuthStore
        .getState()
        .resetPassword("test@example.com");
    });

    expect(result!.error).toBeInstanceOf(AuthError);

    supabaseMod.supabase = originalSupabase;
  });
});
