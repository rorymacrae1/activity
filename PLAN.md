# PisteWise — Delivery Plan

_Generated from codebase review on 14 April 2026_

---

## Sprint 1 — Ship Blockers ✅

> Goal: Close the gaps that would cause data loss, crashes, or compliance failures in production.

### 1.1 Auth Store Tests ✅
- **Files:** `src/stores/__tests__/auth.test.ts`
- **Result:** 36 tests, 84% stmts / 95% lines / 93% branch coverage

### 1.2 Sync Service Tests + Merge Strategy Doc ✅
- **Files:** `src/services/__tests__/sync.test.ts`
- **Result:** 30 tests, 100% stmts / 100% lines / 98% branch coverage
- **Merge strategy:** Favorites = union. Preferences = cloud wins if cloud `has_completed_onboarding`, otherwise local wins.

### 1.3 Accessibility Gaps ✅
- **Files:** `ResortSearchInput.tsx`, `FavoritesPreview.tsx`
- **Result:** Added `accessibilityLabel`/`accessibilityRole` to TextInput, search result Pressables, and "+N more" Pressable.

### 1.4 Cold-Start Fetch Fallback ✅
- **Files:** `src/services/resort.ts`
- **Result:** `getAllResortsAsync` now retries once after 1.5s on cold-start failure (no cached data). Returns stale cache when available.

---

## Sprint 2 — Quality & Robustness ✅

> Goal: Harden the data layer, enforce theme consistency, and remove dead weight.

### 2.1 Theme Token Consolidation ✅
- **Files:** `src/theme/colors.ts`, `src/services/recommendation/pca.ts`, `src/components/resort/ResortScatterPlot.tsx`, `src/components/results/TopPickHero.tsx`, `src/components/results/RunnerUpCard.tsx`, `src/components/home/WelcomeHero.tsx`, `src/components/ui/ResortImage.tsx`
- **Result:** Added `colors.rank.gold/silver/bronze` tokens. Replaced all hardcoded hex in 7 files with theme tokens. Zero hardcoded colours remaining in components/ and services/.

### 2.2 Store Rehydration Validation ✅
- **Files:** `src/stores/preferences.ts`, `src/stores/favorites.ts`
- **Result:** Added `version: 1` + `migrate` handlers to both stores. Preferences validates against `VALID_SKILL_LEVELS`, `VALID_BUDGET_LEVELS`, `VALID_TRIP_TYPES`, `VALID_LANGUAGES` sets. Favorites validates `favoriteIds` is array of non-empty strings.

### 2.3 Audit airports.ts Bundle ✅
- **Files:** `src/data/airports.ts`, `src/components/home/AirportSearchInput.tsx`, `app/(main)/complete-profile.tsx`
- **Result:** airports.ts (540KB, 6,084 lines) is actively used. Converted to lazy-load via `import("@/data/airports")` in both consumers. No longer blocks cold-start JS bundle.

### 2.4 README Completion ✅
- **Files:** `README.md`
- **Result:** Updated resort count (51→100), Expo Router version (v4→v6), documented joined tables + RLS policies, added Discover scatter plot and i18n features, moved future items to FUTURE.md links.

### 2.5 Profile Service Tests ✅
- **Files:** `src/services/__tests__/profile.test.ts`
- **Result:** 22 tests covering all 7 exported functions. 100% stmts / 100% lines / 98% branch coverage on `src/services/profile.ts`.

---

## Sprint 3 — Polish & Performance ✅

> Goal: Improve resilience, developer experience, and bundle efficiency.

### 3.1 Fetch Retry with Backoff ✅
- **Files:** `src/services/resort.ts`
- **Result:** Added `fetchWithRetry<T>(fn, { retries, backoff })` utility with exponential backoff. Wired into `getAllResortsAsync` cold-start path (replaces manual 1.5s retry).

### 3.2 Catch Block Typing ✅
- **Files:** `src/services/resort.ts`, `src/lib/storage.ts`, `src/stores/auth.ts`, `src/components/home/FavoritesBasedRecommendations.tsx`
- **Result:** All `catch (err)` → `catch (e: unknown)` with `instanceof Error` guards. All bare `catch {}` → `catch (_e: unknown)`. 10 catch blocks standardized across 4 files.

### 3.3 Document PCA Eigenvectors ✅
- **Files:** `src/services/recommendation/pca.ts`
- **Result:** Added comprehensive JSDoc on PC1/PC2 documenting: dimension loadings, variance captured (~68%), derivation method (numpy.linalg.eigh), and recomputation trigger.

### 3.4 Bundle Size Analysis ✅
- **Result:** Web bundle: 4.23MB main + 486KB airports (lazy chunk). Top 5 heaviest:
  1. `lucide-react-native` — **1,323KB (20.6%)** — NOT tree-shaken (1,702 icon files bundled for 38 used)
  2. `react-native-web` — 719KB (11.2%)
  3. `react-native-reanimated` — 648KB (10.1%)
  4. `react-dom` — 512KB (8.0%)
  5. `expo-router` — 432KB (6.7%)
- **Action items:** lucide-react-native is the #1 optimization target. Individual icon imports (`lucide-react-native/dist/esm/icons/mountain`) would save ~1.3MB.

### 3.5 Component Interaction Tests ✅
- **Files:** `src/components/__tests__/EmptyState.test.tsx`, `src/components/__tests__/ResortCard.test.tsx`
- **Result:** 14 tests (5 EmptyState + 9 ResortCard) covering render, press, accessibility labels, conditional rendering.
- **Infrastructure:** Jest config upgraded to multi-project (logic + components). Added `react-native` preset for component tests, custom Reanimated mock, @expo-google-fonts mock, `__DEV__` global. Installed `@testing-library/react-native`, `react-test-renderer`, `jest-environment-jsdom`, `react-native-worklets`.

---

## Backlog (Not Scheduled)

| Item | Notes |
|---|---|
| **lucide-react-native tree-shaking** | **1.3MB savings.** Switch to individual imports or replace with a custom SVG icon set. See §3.4 analysis. |
| Dark mode support | Theme tokens are ready; needs `useColorScheme` + dark palette |
| Error boundary in root layout | Wrap `<Slot />` in an `ErrorBoundary` component with a fallback UI |
| Favorites store cloud merge tests | Extend sync tests to cover conflict scenarios |
| Dismissed alerts store tests | Low priority — 4 statements, trivial logic |
| Analytics / crash reporting | No Sentry/Crashlytics wired. Needed before scaling. |
| E2E tests | Detox or Maestro for onboarding + resort detail flows |
| CI pipeline | GitHub Actions: lint → typecheck → test → build (no CI exists yet) |
| Storybook for design system | `Card`, `Button`, `Text`, `Icon`, `EmptyState` are good candidates |

---

## Coverage Targets

| File / Area | Current | Target | Sprint |
|---|---|---|---|
| `src/stores/auth.ts` | ✅ 84% stmts / 95% lines | 80% | 1 |
| `src/services/sync.ts` | ✅ 100% stmts / 100% lines | 100% | 1 |
| `src/services/profile.ts` | ✅ 100% stmts / 100% lines | 80% | 2 |
| `src/stores/preferences.ts` | 27% | 60% | 2 |
| `src/stores/favorites.ts` | 17% | 50% | 2 |
| `src/services/resort.ts` | ~70% | 80% | 3 |
| `src/services/recommendation/*` | ~90% | 90% | Maintain |

---

## Decision Log

| Date | Decision | Rationale |
|---|---|---|
| 14 Apr 2026 | Remove country filter chips from Discover list view | All-country dataset made 6-country chips misleading. Search bar handles country filtering via text. |
| 14 Apr 2026 | Guard against stale `SkillLevel` in persisted store | "FirstTimer" leaked through to Profile UI. Need store migration. |
| 14 Apr 2026 | Hide "Clear Saved Resorts" when count is 0 | Destructive button with no action is confusing UX. |
| 14 Apr 2026 | Change Sign Out from danger to secondary variant | Sign-out is not destructive (local data kept). Red styling implies data loss. |
