# Copilot Engineering Notes

Patterns, gotchas, and implementation details discovered while working on this codebase. Intended as a reference for AI-assisted development sessions.

---

## Animation System

### `AnimatedQuizContent` + `StaggeredItem`

Located at `src/components/onboarding/AnimatedQuizContent.tsx`.

```tsx
import { AnimatedQuizContent, StaggeredItem } from "@components/onboarding/AnimatedQuizContent";
```

**Presets:**
- `parallax` — slides in from right (30→0 translateX, 0.6→1 opacity). Used on all quiz screens.
- `crossfade` — fade + lift (translateY 20→0). Airbnb-style.
- `staggered` — Apple-style sequence entrance.
- `softScale` — Stripe-style scale + fade (0.96→1).

**All presets use `useFocusEffect`** so the animation replays every time the screen is focused — navigating back and forward re-triggers the entrance.

**`StaggeredItem`** drives per-option spring entrance:
- `opacity 0→1`, `translateY 16→0`, `scale 0.98→1`
- `delay = index * baseDelay`
- Common `baseDelay` values: 80ms (4-item lists), 60ms (region grid with ~10 items), 100ms (vibes sliders with 3 rows)

**Critical: `StaggeredItem` as a flex child**

`StaggeredItem` renders an `Animated.View`. When the parent uses `flexDirection: "row"` + `flexWrap: "wrap"`, the `Animated.View` is the direct flex item — any `width: "48%"` style **must be on the `StaggeredItem`**, not the inner card. The `style` prop passes through to the wrapper.

```tsx
// CORRECT — width on the wrapper (the actual flex item)
<StaggeredItem index={i} baseDelay={80} style={isTablet ? styles.cardWrapper : undefined}>
  <OptionCard ... />
</StaggeredItem>

// BROKEN — width buried inside, wrapper has no size constraint
<StaggeredItem index={i} baseDelay={80}>
  <OptionCard style={{ width: "48%" }} ... />
</StaggeredItem>
```

### Press Animations on Cards

The `OptionCard` pattern (trip-type, budget, region, skill) uses:
```tsx
const scale = useSharedValue(1);
const pressed = useSharedValue(0);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  shadowOpacity: interpolate(pressed.value, [0, 1], [0.08, 0.15]),
}));

const handlePressIn = () => {
  scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  pressed.value = withTiming(1, { duration: 100 });
};
const handlePressOut = () => {
  scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  pressed.value = withTiming(0, { duration: 200 });
};
```

---

## Theme Tokens

### Deprecated token: `colors.primary`
Use `colors.brand.primary` instead. `colors.primary` still exists in the theme object but is **not the canonical token** — using it causes off-brand colours in some components.

```tsx
// WRONG
color={colors.primary}

// CORRECT
color={colors.brand.primary}
backgroundColor: colors.brand.primarySubtle
```

Other key tokens:
- `colors.ink.rich` — primary text
- `colors.ink.normal` — secondary text
- `colors.ink.muted` — tertiary / labels
- `colors.ink.inverse` — text on dark backgrounds
- `colors.ink.onBrand` — text on brand-coloured backgrounds
- `colors.canvas.subtle` — card / surface background
- `colors.surface.primary` — elevated surface (cards with shadow)
- `colors.border.subtle` / `colors.border.default`
- `colors.terrain.beginner/intermediate/red/advanced` — piste marker colours
- `colors.primarySubtle` — tinted selection background (used for active states)

### Typography
Custom `Text` component at `src/components/ui/Text.tsx`. Variants: `h1`, `h2`, `h3`, `h4`, `body`, `bodyMedium`, `bodySmall`, `bodySmallMedium`, `caption`. Uses `Montserrat` loaded via Expo.

---

## Layout & Responsiveness

### `useLayout` hook (`src/hooks/useLayout.ts`)

```tsx
const { isTablet, isDesktop, isWeb, hPadding, layoutMode } = useLayout();
```

- `isTablet` — ≥768px
- `isDesktop` — ≥1280px (also requires `isWeb` to show side nav)
- `hPadding` — horizontal page padding (scales with breakpoint)
- `layoutMode` — `"mobile" | "tablet" | "desktop"`

### Side Nav

`src/components/navigation/SideNav.tsx` — 240px sidebar, visible when `isDesktop && isWeb`. Tab bar is hidden on desktop via `tabBarStyle: { display: "none" }` in the `_layout.tsx`.

The `NavItemButton` is extracted as a sub-component so hooks can be used inside `.map()` (RN rules of hooks restriction).

### `ScreenContainer`

Wraps content with responsive `maxWidth`:
- `contentMaxWidth.content` = 960px — general content
- `contentMaxWidth.prose` = 680px — text-heavy screens

### `QuizLayout`

Handles tablet/desktop: renders a full-screen ski-slope background with a centred frosted card (520px wide, `TABLET_CARD_WIDTH`/`TABLET_CARD_HEIGHT`). Mobile uses a plain white `SafeAreaView`.

---

## State Management

### Zustand + MMKV

All stores use Zustand with `persist` middleware backed by MMKV (native) or `localStorage` (web). The web/native split is handled by:
- `src/lib/storage.native.ts` — MMKV adapter
- `src/lib/storage.ts` — web localStorage adapter

### Key Stores

| Store | File | Persisted | Key State |
|-------|------|-----------|-----------|
| `usePreferencesStore` | `stores/preferences.ts` | ✅ | `tripType`, `groupAbilities`, `budgetLevel`, `regions`, `crowdPreference`, `familyVsNightlife`, `snowImportance` |
| `useFavoritesStore` | `stores/favorites.ts` | ✅ | `favoriteIds[]`, cloud sync on auth |
| `useVisitedStore` | `stores/visited.ts` | ✅ | `visitedIds[]` — "✓ Visited" badge on ResortCard |
| `useAuthStore` | `stores/auth.ts` | partial | Supabase session, `profile` |

### `groupAbilities` (not `skillLevel`)

The skill quiz sets `groupAbilities: SkillLevel[]` (multi-select array), **not** a single `skillLevel`. The recommendation engine works from this array. Don't confuse with the `Preferences` interface in `types/preferences.ts` which has a single `skillLevel` — that's a separate normalized type.

---

## Platform Patterns

### Haptics guard
Always guard haptics with a platform check:
```tsx
if (Platform.OS !== "web") {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
```

### Scrollbar on web
`showsVerticalScrollIndicator={Platform.OS !== "web"}` — suppress the native scrollbar on web where browser CSS handles it.

### Keyboard Avoiding View
Web doesn't need KAV. Pattern:
```tsx
{Platform.OS !== "web" && (
  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} />
)}
```

### Focus rings (web accessibility)
`Button` and `Card` use `useState(isFocused)` + `onFocus`/`onBlur` for visible focus rings — **not** Pressable's `focused` state callback (which isn't typed in RN). `PressableStateCallbackType` doesn't include `focused` — that's a web-only Pressable feature not exposed through RN types.

---

## Supabase Integration

### Single-query resort fetch
All 100 resorts + 7 joined tables are fetched in one PostgREST query with nested selects. The result is mapped to the `Resort` TypeScript interface in `types/resort.ts`.

### RLS tables
Row-Level Security is enabled on: `profiles`, `user_preferences`, `user_favorites`, `visited_resorts`. Policies are scoped to `auth.uid()`. Resort data (`public.resort`) is read-only with no RLS — accessible without auth.

### Schema mismatch pattern
Supabase column names (snake_case) differ from the TypeScript `Resort` interface (camelCase). The mapping layer is in `services/resort.ts` — all transformations happen there. If a column is missing from Supabase, the service returns `undefined`/defaults rather than throwing.

---

## Loading Screens

Loading states follow a three-phase pattern established during the loading screen improvement pass:

1. **Timeout guard** — if fetch doesn't complete within N seconds, transition to error state rather than hanging indefinitely
2. **Error state** — shows a clear message + "Try Again" retry button
3. **Retry counter** — `useState(retryCount)` triggers re-fetch via `useEffect([..., retryCount])`

See `app/(onboarding)/region.tsx` for the reference implementation (it fetches live country data from Supabase).

---

## PCA Scatter Plot

Located at `src/components/discover/ResortScatterPlot.tsx`.

- Uses PCA (Principal Component Analysis) to project the multi-dimensional resort attribute space onto 2D
- Axes are abstract (not labelled — they don't map cleanly to a single named attribute after PCA rotation)
- Dots are coloured by match score tier: green (≥80%), yellow (60-79%), red (<60%)
- Tapping a dot shows a resort summary card + navigation CTA
- The scatter plot view is toggled by the "Map" chip in the Discover sort bar

**Important fix (prior session):** Each `ResortDot` rendered in `.map()` needs a `key` prop with a React `Fragment` — without it, React warns about missing keys on the fragment wrapper.

---

## Recommendation Engine

Source: `src/services/recommendation/`

Rule-based, no ML. Transparent and explainable.

**Score weights:**
```
skill:    30%
budget:   25%
vibe:     15%
activity: 15%
snow:     15% (scaled by user's snowImportance preference)
```

**Explainer** (`explainer.ts`) converts top-scoring attributes into human-readable strings (e.g. "Perfect terrain mix for your skill level"). The top 3 reasons are shown in the `ReasonCarousel` on the results screen.

---

## Onboarding Quiz Flow

```
(onboarding)/index.tsx → trip-type → skill → budget → region → vibes → results → decision-flow
```

Progress is tracked by `<ProgressIndicator current={N} total={5} showLabel />`. Quiz questions are 1–5 (trip-type=1, skill=2, budget=3, region=4, vibes=5).

All 5 question screens use the same animation pattern:
- `<AnimatedQuizContent animation="parallax">` — whole screen slides in from right
- `<StaggeredItem index={i} baseDelay={80}>` around each option — spring entrance per item

---

## Common Gotchas

| Gotcha | Detail |
|--------|--------|
| `colors.primary` vs `colors.brand.primary` | Always use `brand.primary`. `colors.primary` is a legacy/alias. |
| `StaggeredItem` in flex-row grids | Width must be on the `StaggeredItem` wrapper via `style` prop, not the inner card. |
| Nested `<button>` elements on web | React throws if a pressable/button contains another. `ProfileCompletionCard` was fixed by replacing an inner `<Button>` with a plain `Pressable`. |
| `Fragment` key in `.map()` | If using `<Fragment key={...}>` in a `.map()`, the key goes on the Fragment, not the child. Missing keys cause React warnings. |
| `groupAbilities` is an array | The skill quiz allows multi-select. The store field is `groupAbilities: SkillLevel[]`, not a single value. |
| Haptics on web | `Haptics.impactAsync` throws on web — always guard with `Platform.OS !== "web"`. |
| `PressableStateCallbackType` has no `focused` | Focus ring state must use `useState` + `onFocus`/`onBlur` handlers, not the Pressable style callback. |
| Reanimated on web | Some spring configs behave slightly differently on web vs native. Test on both. |

---

## File Aliases (`tsconfig.json` paths)

```
@components → src/components
@stores     → src/stores
@hooks      → src/hooks
@services   → src/services
@theme      → src/theme
@/          → src/   (for types, constants, etc.)
```

---

## Scripts

```bash
npm start          # Expo dev server (select platform interactively)
npm run ios        # iOS simulator
npm run android    # Android emulator
npm run web        # Web (Webpack/Metro)
npm test           # Jest
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript check (no build output)
```

---

*Last updated by Copilot — April 2026*
