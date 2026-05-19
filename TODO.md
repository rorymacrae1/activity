# PeakWise — TODO

_Generated 9 May 2026 from architecture review._

---

## Priority 1 — Ship Blockers

- [x] **1. Fix TypeScript errors in TopPickHero.tsx** — `content` variable collision + type mismatch (4 errors)
- [x] **2. Resolve Supabase resort schema mismatch** — Service now reads JSONB columns directly, table name fixed to `resorts`, mock data reshaped
- [x] **3. Add CI pipeline** — GitHub Actions: `lint → tsc --noEmit → jest`
- [x] **4. Add error boundary to root layout** — Already existed
- [x] **5. Add crash reporting** — Sentry integrated (`src/lib/sentry.ts`, ErrorBoundary wired)

## Priority 2 — High-Impact UX Wins

- [x] **6. Lucide tree-shaking** — Already using deep imports, `import type` only for barrel
- [x] **7. Ship Design Review fixes** — P1 items from DESIGN_REVIEW.md: emoji → Lucide icons (12 files), typography tokens applied (TopPickHero, ResortCard, results, resort detail)
- [x] **8. Auto-detect device language** — Already wired in root layout
- [x] **9. Dark mode** — `ThemeProvider` with `useTheme()`/`useColors()` hooks, dark palette, wired in root layout

## Priority 3 — Product Depth

- [x] **10. Surface flight time from home airport** — Haversine-based `flightTime.ts` service, shown on ResortCard, "Nearest" sort in Discover (9 unit tests)
- [x] **11. Seasonal awareness in scoring** — Explainer now adds seasonal warnings, `SeasonBadge` component created
- [x] **12. "Not for me" feedback** — Already implemented: XCircle button in resort detail nav bar, dismiss store, filtered in recommendations
- [x] **13. Remove/replace placeholder sections** — PlaceholderSections.tsx already renders real resort data (activities, accommodation, transport)

## Priority 4 — Engineering Quality

- [x] **14. E2E tests** — Maestro 2.5 installed, 3 flows: onboarding, resort detail, discover (`npm run test:e2e`)
- [x] **15. Component snapshot tests** — Button, Card, Text (31 tests, 25 snapshots)
- [x] **16. Clean up ESLint warnings** — Fixed 1 error (rules-of-hooks) + 9 warnings, now 0 issues

## Architecture Decision

- [x] **17. Decide resort data strategy** — Supabase as source of truth (JSONB columns)
