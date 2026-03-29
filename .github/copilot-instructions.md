# GitHub Copilot Instructions for PeakWise

## Project Overview

PeakWise is an **offline-first React Native (Expo) mobile app** that recommends European ski resorts based on user preferences. There is no backend — all data and logic runs on-device.

**Stack:** React Native · Expo SDK 54 · TypeScript · Expo Router · Zustand · MMKV · Reanimated · Gesture Handler

---

## Coding Standards

### Language & Formatting
- **TypeScript** for all source files. Strict mode enabled.
- **2 spaces** for indentation. Prettier formatting.
- No `console.log` — remove before committing.

### Naming
- Variables/functions: `camelCase`
- Components/classes/types/interfaces: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- File names: `PascalCase` for components, `camelCase` for utilities/hooks/services

### Imports
- Use `@/` absolute imports (maps to `src/`).
- Group: external libraries → internal `@/` imports → relative imports.
- No barrel re-exports that create circular dependencies.

### Components
- Functional components with hooks only. No class components.
- Define prop types as TypeScript `interface`, destructure at the top.
- Keep components small and focused. Extract logic to hooks or services.
- All styles in `StyleSheet.create()` at the bottom of the file.

### Styling & Theming
- Use tokens from `src/theme/` for all colors, spacing, and typography.
  - `colors` from `@/theme/colors`
  - `spacing` from `@/theme/spacing`
  - `typography` from `@/theme/typography`
- No hard-coded color values, font sizes, or pixel values.
- No CSS, SCSS, or BEM — this is React Native.

### Accessibility (React Native)
- Use `accessibilityLabel`, `accessibilityRole`, and `accessibilityHint` on interactive elements.
- Ensure sufficient color contrast (4.5:1 minimum).
- All `Pressable` elements must have a meaningful `accessibilityLabel`.

### State Management
- Global state in Zustand stores (`src/stores/`).
- Persistence via MMKV on native, localStorage on web (via `src/lib/storage.ts` / `storage.native.ts`).
- Keep store slices focused — one store per domain.

### Data & Services
- Resort data lives in `src/data/resorts.ts` (bundled, offline).
- Recommendation engine lives in `src/services/recommendation/`.
- No network calls in MVP — app is fully offline.

### Error Handling
- Handle errors gracefully with user-facing fallback UI.
- Use null/undefined checks before accessing nested data.
- Services should not throw to UI — return null/empty or handle internally.

### Testing
- Write unit tests for all pure functions in `src/services/` and `src/stores/`.
- Target: **>80% coverage** on service and store files.
- Use **Jest** with `@/` alias support.
- Test files: `src/**/__tests__/*.test.ts(x)`.

### Documentation
- Add JSDoc comments for all exported functions and components.
- Update `README.md` when adding new features, screens, or data.

### General Principles
- KISS, DRY, YAGNI, Single Responsibility.
- Prefer explicit over implicit.
- Prefer duplication over wrong abstraction.

---

## Project Structure

```
app/                   # Expo Router screens
  (onboarding)/        # Welcome → Skill → Budget → Region → Vibes → Results
  (main)/              # Discover (tabs) · Resort Detail · Map · Favorites · Profile
src/
  components/
    ui/                # Shared primitives (Slider)
    resort/            # Resort-specific components (ResortCard, TerrainChart, StatsGrid)
    onboarding/        # Quiz components (ProgressIndicator)
  data/
    resorts.ts         # 30 bundled European resorts
  lib/
    storage.ts         # Web localStorage adapter
    storage.native.ts  # Native MMKV adapter (Metro resolves automatically)
  services/
    resort.ts          # Data access (getAllResorts, getResortById, getResortsByRegion)
    recommendation/    # Scoring engine (scorer, explainer, index)
  stores/
    preferences.ts     # Onboarding quiz state (Zustand + persist)
    favorites.ts       # Saved resort IDs (Zustand + persist)
  theme/
    colors.ts
    spacing.ts
    typography.ts
  types/               # Shared TypeScript types
```

---

## Branching & Commits

- Branch naming: `feature/PW-XXX`, `bugfix/PW-XXX`, `chore/PW-XXX`
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`)
- PRs must include a description of changes and testing steps.
- No direct commits to `main`.

---

## Pull Request Review Checklist

- [ ] Code follows standards above (TypeScript strict, theme tokens, no hard-coded values).
- [ ] New pure functions/services have unit tests (>80% coverage on service files).
- [ ] No ESLint or TypeScript errors (`npm run lint`, `npx tsc --noEmit`).
- [ ] React Native accessibility attributes on all interactive elements.
- [ ] No `console.log` statements.
- [ ] JSDoc on all exported functions and components.
- [ ] `README.md` updated if screens, data, or architecture changed.
- [ ] Tested on both iOS and web (`npm run ios`, `npm run web`).
- [ ] No unnecessary dependencies added.
- [ ] Platform-specific files (`.native.ts`) used where native modules are required.

---

## Copilot Review Instructions

When reviewing code in this repo:
- Enforce theme token usage — flag any raw hex colors or pixel values outside `src/theme/`.
- Flag any import of `react-native-mmkv` outside of `storage.native.ts` — it must never be bundled for web.
- Flag any network fetch/axios calls — the app is offline-first; data is local only.
- Suggest React Native `accessibilityLabel` and `accessibilityRole` on any `Pressable` missing them.
- Reference `src/services/recommendation/` for scoring logic — do not duplicate it in components.
