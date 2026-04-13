# PeakWise — Tech Lead Roadmap

> Reviewed 13 April 2026. Current state: **MVP deployed, production gaps remain.**  
> Organised by priority tier. Work top-to-bottom.

---

## Tier 1 — Fix Before You Share This With Anyone

### ~~1.1 Recommendation timeout is a silent hang~~ ✅ Done
**File:** `app/(onboarding)/results.tsx` L47  
The 12-second deadline has no fallback. If `getRecommendations()` fails or stalls, the screen sits frozen. Fix it:
- Show a progress/skeleton state while computing (computation is fast, the network fetch is the variable)
- Wrap the call in a proper `try/catch` with a user-facing error state
- On timeout, fall back to the last cached recommendation set from the preferences store (it already has region data)

### 1.2 Supabase resort schema is out of sync with app types
**Files:** `supabase/migrations/002_resorts_table.sql`, `src/services/resort.ts` L58–71  
The Supabase `resorts` table schema and the `Resort` TypeScript type are different shapes. The mapping in `resort.ts` is lossy — fields like `lat`/`lng` default to `0,0` and `averageDailyCost` is always `150`. Either:
- Reconcile the migration to match the `Resort` type exactly and re-upload resort data, OR  
- Scrap the Supabase resorts table and ship resort data as a local JSON bundle (offline-first was the original intention)

### ~~1.3 Password reset is missing~~ ✅ Done
**File:** `app/(auth)/sign-in.tsx` (no reset flow exists)  
Users who forget their password are locked out permanently. Add a "Forgot password?" link that calls `supabase.auth.resetPasswordForEmail()`. This is 20 lines of code but critical.

### ~~1.4 Broken link: Decision Flow screen~~ ✅ Done
**File:** `app/(onboarding)/results.tsx` L165  
The CTA navigates to `/(onboarding)/decision-flow` but that screen is empty/unimplemented. Either build it (it should show a visual breakdown of _why_ the algorithm scored each resort the way it did — the data is already in `AttributeScores`) or remove the button.

---

## Tier 2 — User Experience Fundamentals

### 2.1 Resort images are all the same fallback
**Files:** `src/services/resort.ts` L50–52, `app/(main)/resort/[id].tsx` L33  
Every resort shows the default hero image because `heroImage` and `pisteMap` are empty strings. This kills first impressions. Fix options:
- Populate the Supabase `resorts` table with real image URLs (can batch from resort official sites or Unsplash with proper attribution)
- As a quick win: map resort IDs to a curated set of 30 vetted Unsplash ski images in local data

### 2.2 "Visited Resorts" is a ghost feature
**Files:** `src/services/profile.ts` L71–117, `src/stores/auth.ts`  
The entire data layer for tracking visited resorts exists — Supabase table, RLS policies, service methods — but there is zero UI for it. The "Stamps" or "I've been here" mechanic could be a genuine differentiator vs. Google/TripAdvisor. Add it to the resort detail page as a simple toggle button.

### 2.3 Sync failures are completely silent
**Files:** `src/stores/favorites.ts` L34–35, `src/stores/preferences.ts` L107–153  
Cloud sync errors are swallowed with `console.warn()`. Users have no idea if their favorites saved or not. Add:
- A `syncStatus` field to both stores (`'idle' | 'syncing' | 'error'`)  
- A small toast/banner on error (the Toast component already exists in `src/components/ui/Toast.tsx`)

### 2.4 Complete Profile screen is orphaned
**File:** `app/(main)/complete-profile.tsx`  
This screen exists in the router but is never navigated to. The `ProfileCompletionCard` in the home screen teases it. Either wire up the navigation from that card, or delete the screen and remove the card.

### 2.5 Home airport is collected but never used
**File:** `src/services/profile.ts` `setHomeAirport()` / `src/data/airports.ts`  
You have 4,000+ airports in the data and a full service layer for storing the user's home airport. The natural next step is to surface "Flight time from [your airport]" on resort cards and in the sorting options on Discover. This would be a strong differentiator — no other ski recommendation app does this well.

### 2.6 Refine recommendations without retaking the full quiz
Currently if a user's top result isn't right, they must retake the entire 5-step quiz. Add:
- A "Tweak" sheet on the results screen with quick-edit sliders for budget and vibes
- This uses the existing `NormalizedPreferences` structure — it's just a different entry point into the same scoring

---

## Tier 3 — Performance

### 3.1 Web bundle is too large (4.6 MB uncompressed)
**Files:** `dist/` build output, `metro.config.js`  
Reanimated + Gesture Handler ship in full on web but most animations could be handled with CSS transitions instead. To cut bundle size:
- Audit which animations truly need Reanimated on web (likely only the parallax quiz scroll)
- Use `Platform.select()` to lazy-load heavy animation code on web
- Enable Metro tree-shaking for web builds (Expo 54 supports it under `experiments.bundleSplitting`)

### 3.2 Images are unoptimized
**File:** `app/(main)/resort/[id].tsx` — uses `expo-image` which is good, but:
- No `contentFit="cover"` with explicit `width`/`height` on all instances (causes layout shifts)
- No `placeholder` blur hash — users see blank rectangles while images load
- No `transition` duration set (missing 200ms fade-in = jarring snap)

Expo Image supports all three. Add them globally via a wrapper `<ResortImage>` component.

### 3.3 Discover screen list could be smarter
**File:** `app/(main)/discover.tsx`  
FlatList is used correctly, but:
- `getItemLayout` is not set — causes FlatList to measure every item on scroll
- List re-renders when sort/filter chip changes re-run the full filter across all resorts
- Add `useMemo` on the filtered/sorted resort list keyed on the filter state

### 3.4 Font loading blocks the splash screen longer than needed
**File:** `app/_layout.tsx` L30  
All 18 Montserrat weight variants are loaded eagerly. On web this is ~6 MB of fonts. Load only the weights you actually use (400, 500, 600, 700) — that cuts font loading by ~56%.

---

## Tier 4 — Product Depth

### 4.1 "Why this resort?" is too vague
**File:** `src/services/recommendation/explainer.ts`  
Explanations currently say "Great for your skill level" but don't reference actual resort data. The scorer already computes individual scores for skill/budget/vibe/snow — use them to write specific copy:
- "450km of pistes, including 45% reds — ideal for your group's mix"
- "Daily lift pass ~€52, well within your mid-range budget"

This transforms the app from a black box into a transparent advisor — trust-building at zero extra computation cost.

### 4.2 Add a "Not for me" feedback loop
After a user views a resort detail page but doesn't favorite it, offer a one-tap "Not for me" option. This creates implicit signal you can use to improve the recommendation ordering in-session (down-weight that resort's attribute profile for re-scoring). No ML needed — pure rule-based reweighting.

### 4.3 Seasonal awareness is missing
**File:** `src/services/recommendation/scorer.ts`  
The scorer has no concept of time. In April, showing Val Thorens as your top pick (closes May) is less useful than Tignes (open June). Add a `season.opensMonth` / `season.closesMonth` to the `Resort` type and apply a freshness penalty in the scorer for resorts nearing close.

### 4.4 The Region picker is the biggest drop-off risk
**File:** `app/(onboarding)/region.tsx`  
Not fully read but likely the most complex step in the quiz. If users can't quickly pick regions they'd consider, they'll abandon. Consider:
- Default to "Anywhere in Europe" pre-selected
- Group by country with a single-tap "All [France]" button

### 4.5 Multi-language is half-built
**Files:** `src/content/{en,fr,de}.json`  
Three languages exist but are loaded as static JSON — there is no locale-to-content mapping derived from device locale. Add `expo-localization` and wire `useContent()` to auto-detect the device language on first launch, defaulting to EN.

---

## Tier 5 — Engineering Hygiene

### 5.1 Expand test coverage beyond services
**Current:** 80%+ on `src/services/` and `src/stores/` only. Everything else is uncovered.  
Add in this order:
1. Snapshot tests for `Button`, `Text`, `Card` primitives (catches theme regressions)
2. Integration test: full onboarding quiz → `getRecommendations()` → assert results contain resorts
3. Auth flow tests (mock Supabase client, assert store state transitions)
4. E2E with Detox (iOS) or Playwright (web) for the two critical paths: onboarding and resort detail

### 5.2 Remove or complete placeholder sections
**File:** `src/components/resort/PlaceholderSections.tsx`  
Reviews, accommodation, and transport sections are placeholder UI with no implementation. They make the resort detail screen look incomplete. Two options:
- Delete them until real integrations are built
- Replace with useful static content (e.g., deep link to booking.com search, TripAdvisor link)

### 5.3 Tighten remaining ESLint warnings
Run `npm run lint`. There are ~12 warnings across:
- Inline styles in `decision-flow.tsx` L57
- Colour literals in `region.tsx` L333, `skill.tsx` L186, `profile.tsx` L374
- Unused vars in `_layout.tsx` L28, `trip-type.tsx` L20

All fixable in under an hour. Move `no-color-literals` from `warn` to `error` once cleared to prevent regressions.

### 5.4 Sort out the TypeScript `baseUrl` deprecation
**File:** `tsconfig.json` L5  
`baseUrl` is deprecated in TypeScript 7 (you're on 5.9 now but heading there). Add `"ignoreDeprecations": "6.0"` as a short-term fix, then migrate path aliases to the new `paths`-only approach before upgrading to TS 7.

### 5.5 Add a pre-push Git hook
Your `~/.npmrc` nearly broke the Vercel deployment because Ford's JFrog registry URLs leaked into `package-lock.json`. Add a Husky pre-push hook that:
- Runs `grep -r "jfrog.ford.com" package-lock.json` and aborts if found
- Runs `npm run lint` and `npx tsc --noEmit`

This prevents the class of issues that burned ~2 hours during your first Vercel deploy.

---

## Tier 6 — Growth & Differentiation (Post-MVP)

### 6.1 Share your results
The onboarding results screen should be shareable. Generate a card image (Expo Sharing + react-native-view-shot or a Cloudflare Worker image renderer) showing your top pick with match score. Ski trip planning is inherently social.

### 6.2 Resort comparison mode
Let users pin 2–3 resorts side-by-side on a comparison table. The data model (`AttributeScores`) already has every dimension needed — just build the UI layout.

### 6.3 Progressive Web App (PWA) manifest
**File:** `public/` directory  
You're deploying to Vercel as a web app. Add a `manifest.json` + service worker to make it installable on mobile browsers. Expo supports this natively via `app.json`'s `web.output: "single"` mode — it just needs a `public/manifest.json`.

### 6.4 SEO — structured data is wired but thin
**File:** `app/(main)/resort/[id].tsx` L82–105  
`getResortSchema()` generates JSON-LD but only sets `@type: TouristAttraction`. Extend it with `Offer` (lift pass price range), `GeoCoordinates`, and `openingHoursSpecification`. Google uses all three in rich results for travel queries.

### 6.5 Analytics
There is zero telemetry currently. To make meaningful product decisions, at minimum add:
- Which resorts are viewed most  
- Where users drop off in the onboarding quiz  
- Whether users who reach results actually open resort detail pages  

Expo supports PostHog (privacy-first) natively with a single SDK. The offline-first architecture makes this straightforward — queue events locally, flush on next network.

---

## Quick Reference: Files That Need the Most Attention

| File | Why |
|---|---|
| `app/(onboarding)/results.tsx` | Timeout + broken decision-flow link |
| `src/services/resort.ts` | Schema mismatch + placeholder data |
| `src/services/recommendation/explainer.ts` | Generic explanations, no resort data referenced |
| `app/(main)/resort/[id].tsx` | Fallback images, empty map screen, placeholder sections |
| `src/stores/favorites.ts` | Silent sync failures |
| `app/(main)/profile.tsx` | Missing password reset, visited resorts never surfaced |
| `src/content/en.json` | Not wired to device locale |
| `tsconfig.json` | baseUrl deprecation heading for TS 7 |
| `jest.config.js` | Coverage only on services/stores; components & hooks excluded |
