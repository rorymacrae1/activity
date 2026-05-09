# PeakWise Design Review

**Reviewer:** Lead Designer (AI-assisted)
**Target Demographic:** Professional 30+, affluent, experienced skiers
**Date Started:** 9 May 2026

---

## Review Plan

| # | Screen | Skills | Status |
|---|--------|--------|--------|
| 1 | Onboarding Welcome | critique, typeset, quieter | ✅ Done |
| 2 | Results (Top 5) | critique, polish, layout | ✅ Done |
| 3 | Resort Detail [id] | audit, typeset, polish | ✅ Done |
| 4 | Discover Tab | critique, layout, clarify | ✅ Done |
| 5 | Home Dashboard | distill, polish | ✅ Done |
| 6 | Profile / Auth | harden, clarify | ✅ Done |

---

## Review Findings

### 1. Onboarding Welcome

**Files:** [app/(onboarding)/index.tsx](app/(onboarding)/index.tsx), [QuizLayout.tsx](src/components/onboarding/QuizLayout.tsx), [AnimatedQuizContent.tsx](src/components/onboarding/AnimatedQuizContent.tsx)

#### Critique

**Target Persona: Affluent professional skier, 35-50, skis Verbier/Val d'Isère/Courchevel. Expects premium experiences, impatient with anything that feels "app-y" or juvenile.**

##### Nielsen's Heuristics

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No indication of what happens after CTA — how long? What data needed? |
| 2 | Match System / Real World | 3 | Ski language is appropriate; "Find My Resort" feels mid-market |
| 3 | User Control and Freedom | 2 | No skip option, no "I already know what I want" path for experienced users |
| 4 | Consistency and Standards | 3 | Card layout follows conventions; emoji icons feel inconsistent with premium brand |
| 5 | Error Prevention | 3 | Single CTA, low error risk |
| 6 | Recognition Rather Than Recall | 3 | Value props are clear and scannable |
| 7 | Flexibility and Efficiency | 1 | No shortcut for returning users or power users; forced linear flow |
| 8 | Aesthetic and Minimalist Design | 2 | Emoji icons undermine premium positioning; 3 value prop cards create visual noise |
| 9 | Error Recovery | 3 | n/a — no errors possible on this screen |
| 10 | Help and Documentation | 2 | "Takes about 1 minute" is the only orientation copy |
| **Total** | | **24/40** | **Acceptable but below premium standard** |

##### What's Working

1. **QuizLayout tablet treatment is strong.** Full-bleed ski photo + centered frosted card is genuinely premium. The dark scrim + card shadow creates depth without gimmick. This is the right direction.
2. **Parallax animation is restrained.** The `AnimatedQuizContent` with parallax entry avoids the bouncy/playful trap. Subtle lift + fade is appropriate for this demographic.
3. **Copy structure is sound.** Title → tagline → value props → CTA is a proven funnel pattern. The hierarchy works.

##### Priority Issues

**[P1] Emoji icons destroy premium positioning**
- **What**: Using ⛷️ 🎯 🏔️ 📱 as visual identifiers on the welcome screen
- **Why it matters**: A 40-year-old who pays €300/day for a Courchevel lift pass will subconsciously register "this is a casual/free app" from emojis. Premium brands (IKON, Fatmap, Skiresort.info) use photography, illustration, or custom iconography — never emoji. This is the single biggest credibility gap.
- **Fix**: Replace emojis with Lucide icons (already in the project) or minimal SVG line illustrations. The `PersonIcon` in trip-type.tsx shows the team can build custom visuals — apply that same approach here. Logo should be a wordmark or minimal custom icon, not ⛷️.

**[P1] "Find My Resort" CTA feels mid-market, not premium**
- **What**: CTA text "Find My Resort" with "Takes about 1 minute" subtext
- **Why it matters**: This reads like a quiz widget, not a curated recommendation experience. For affluent users, the promise should be about quality/exclusivity, not speed. "1 minute" unconsciously says "this is shallow."
- **Fix**: Reframe the CTA around curation/expertise: "Get My Recommendations" or "Start" (minimalist). Replace "Takes about 1 minute" with "5 quick questions" (sets concrete expectation) or remove entirely — the affluent don't need time reassurance.

**[P2] No path for experienced/returning users**
- **What**: Forced linear onboarding with no skip or shortcut
- **Why it matters**: A professional who already knows they want "luxury, quiet, France, expert terrain" is forced through 5 screens of options they could specify in one. This demographic values their time disproportionately.
- **Fix**: Add a secondary link: "Already know what you want?" → jump to a compact preference picker or direct to Discover with filter presets. Or add "Sign in" link for returning users who already have cloud preferences.

**[P2] Value prop cards are generic and undifferentiated**
- **What**: Three cards with emoji + one-line text ("Personalised to your skill and style", "30+ top European resorts", "Works offline")
- **Why it matters**: These read like app store bullet points, not a premium welcome. "30+ top European resorts" is a feature count (mid-market thinking). "Works offline" is a technical feature — the user doesn't care about the mechanism, they care about the benefit.
- **Fix**: Either (a) eliminate the value props entirely and let the hero + CTA stand alone (the confident approach — Airbnb's login has zero bullet points), or (b) rewrite for the persona: "Curated for your group" / "Expert-rated European resorts" / "No WiFi needed on the mountain."

**[P3] Mobile layout lacks visual anchor**
- **What**: On mobile, the screen is text-heavy with no photography, just a white background with emoji + text
- **Why it matters**: Tablet gets the gorgeous ski photography background. Mobile gets a plain white screen. First impressions matter — this demographic opens the app and sees... nothing aspirational. No mountain, no snow, no mood.
- **Fix**: Add a subtle hero image or alpine gradient at the top of the mobile layout. Even a tinted background (canvas.subtle or a soft gradient using the ice palette) would create warmth.

##### Persona Red Flags

**Marcus, 42, Private Equity, skis 3 weeks/year in the Alps:**
- Opens app → sees ⛷️ emoji → immediately categorizes as "free utility app, not for me"
- "Find My Resort" → "This sounds like a BuzzFeed quiz"
- No sign-in option visible → "Can't save anything? Am I going to lose my data?"
- Would close within 5 seconds and google "best luxury ski resorts 2026" instead

**Sophie, 36, Corporate Lawyer, books Verbier annually via a specialist travel agent:**
- Value prop "30+ European resorts" → "Only 30? My agent knows hundreds"
- "Takes about 1 minute" → "Is this going to be superficial?"
- No social proof, no authority signals → "Who made this? Why should I trust their recommendations?"

##### Minor Observations

- The `QuizLayout` background image URL is hardcoded to a specific Unsplash photo — consider curating 3-5 premium alpine shots and rotating them
- `TABLET_CARD_HEIGHT = 580` is fixed — on very tall screens (desktop), this leaves excessive empty space above/below
- No haptic feedback on the CTA button press (other screens use `expo-haptics`)
- Button component uses `colors.brand.primary` (Alpine Blue #4A90A4) as primary bg — this is a cool, restrained color which works for premium, but may lack contrast on the CTA. Consider using the navy or a higher-contrast variant for the main CTA only
- `accessibilityLabel` is set on the Button, but the welcome screen has no `accessibilityRole` on the outer container or headings

#### Typeset

**Current state:** Montserrat is a solid choice — geometric but warm, used by premium brands. The weight allocation (Light for display, Bold for h1, SemiBold for subheads) is correct.

| Issue | Location | Severity | Fix |
|-------|----------|----------|-----|
| Logo text uses `h1` (26px bold) or `display` (34px light) depending on device — but the app name should have its own dedicated style, not share heading semantics | Welcome hero title | P2 | Create a `brandTitle` typography style: 28-32px, SemiBold, letter-spacing: 1-2px. The app name deserves its own typographic treatment, not a generic heading. |
| Tagline "Find your perfect ski resort in seconds" uses `body` (15px regular) — undersized for a hero tagline | Tagline | P2 | Use `bodyLarge` (17px) or `h3` (17px semiBold) for the tagline. On tablet, use `h2` (21px). The tagline is doing heavy persuasion work and needs more presence. |
| Value prop text uses `bodySmall` (13px) — barely legible, especially for 40+ eyes | Value prop cards | P1 | Increase to `body` (15px). For the 30+ demographic, 13px is below comfortable reading size. Apple's Human Interface Guidelines recommend 17px minimum for body text. |
| "Takes about 1 minute" uses `caption` (11px) — too small for a confidence signal | CTA subtext | P2 | Use `bodySmall` (13px) minimum. If this copy is important enough to include, it's important enough to read. |
| No tracking/spacing on the app title "PisteWise" — reads as a single run-on word | Title | P3 | Add letter-spacing: 0.5-1px to separate "Piste" and "Wise" visually, or use a wordmark with differentiated weight (e.g., "Piste" in Light, "Wise" in Bold) |

#### Quieter Assessment

**Overall:** The design system is already leaning quiet — Alpine Navy, Snow White, muted reds. This is good. But the execution on this screen undoes the system's restraint.

| Element | Current | Problem | Premium Direction |
|---------|---------|---------|-------------------|
| Logo | ⛷️ emoji, 64-72px | Loud, casual, clashes with otherwise restrained palette | Remove. Use wordmark or minimal icon. Let the name speak. |
| Value prop icons | 🎯 🏔️ 📱 emoji | Visual noise, infantilizing for target demographic | Replace with 16-20px Lucide line icons in `colors.ink.muted` — subtle, not decorative |
| CTA button | `colors.brand.primary` (Alpine Blue) full-width | Acceptable, but "prominent" size (56px tall) is chunky | Keep color, reduce to `standard` size (48px). Prominent should be reserved for final conversion points, not first CTA |
| 3x value prop cards | Cards with border, icon, text | Creates visual busyness — 3 boxes competing for attention | Simplify to a plain text list (no cards) with minimal icons, or remove entirely |
| CTA subtext | "Takes about 1 minute" below button | Unnecessary qualifier — adds noise | Remove, or replace with "5 questions" if retention data shows it helps |

**Quieter principle for this demographic:** Premium products say less. The welcome screen should convey confidence through restraint — a strong name, one line of copy, one button. Every additional element must earn its place.

---

### 2. Results (Top 5)

**Files:** [app/(onboarding)/results.tsx](app/(onboarding)/results.tsx), [TopPickHero.tsx](src/components/results/TopPickHero.tsx), [ReasonCarousel.tsx](src/components/results/ReasonCarousel.tsx), [SecondChoicesCarousel.tsx](src/components/results/SecondChoicesCarousel.tsx)

#### Critique

##### Nielsen's Heuristics

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading phases with messages are good; score count-up animation gives feedback |
| 2 | Match System / Real World | 3 | "Your Perfect Match" badge, percentage scores, resort stats — speaks the user's language |
| 3 | User Control and Freedom | 3 | Tweak modal + "Retake Quiz" provide escape routes; back navigation works |
| 4 | Consistency and Standards | 2 | Hard-coded strings alongside i18n content; `fontSize: 13` and `fontWeight: "600"` inline instead of typography tokens |
| 5 | Error Prevention | 3 | Timeout handling is solid; empty state with retry |
| 6 | Recognition Rather Than Recall | 2 | "Here's why it fits your criteria" section is good but requires carousel swiping to see all 5 attributes — cognitive load |
| 7 | Flexibility and Efficiency | 3 | Tweak modal lets you adjust without redoing the quiz — good shortcut |
| 8 | Aesthetic and Minimalist Design | 2 | Too many sections competing: hero → reasons carousel → runner-ups carousel → decision flow CTA → sticky footer. Five distinct content blocks is heavy |
| 9 | Error Recovery | 3 | Timeout retry, empty state with retake — solid |
| 10 | Help and Documentation | 2 | "Want to know how this was chosen?" is buried at the bottom; the decision flow link is easily missed |
| **Total** | | **26/40** | **Functional but visually dense** |

##### What's Working

1. **TopPickHero is the best component in the app.** Full-bleed image, dark gradient, score counter animation, stats overlay — this is genuinely premium. The count-up animation (0→matchScore with ease-out) is a chef's-kiss moment. This component sets the right standard.
2. **Tweak modal is smart UX.** Letting users adjust 3 sliders and re-rank without redoing the whole quiz is the right pattern for the power-user persona. Bottom sheet presentation is correct for mobile.
3. **Loading phases with progressive messages** ("Analysing terrain match...", "Comparing snow data...") are excellent — they build anticipation and demonstrate work being done. Premium touch.

##### Priority Issues

**[P1] Hard-coded styling bypasses the design system**
- **What**: Results screen has 15+ inline `fontSize`, `fontWeight`, and `color` values instead of using `typography` and `colors` tokens: `fontSize: 13`, `fontWeight: "600"`, `fontSize: 15`, `fontSize: 20`, `fontSize: 11`
- **Why it matters**: These break consistency with the rest of the app and make the screen feel like a prototype. They also bypass the typography scale entirely (e.g., `fontSize: 15` ≠ `typography.body` which is 15px but also sets lineHeight, letterSpacing, and fontFamily).
- **Fix**: Replace every inline style with the appropriate typography token. `fontSize: 13, fontWeight: "600"` → `typography.bodySmallMedium`. `fontSize: 15, fontWeight: "600"` → `typography.h4`. `fontSize: 11` → `typography.caption`. `fontSize: 20` → use an Icon component.

**[P1] Hard-coded English strings break i18n**
- **What**: "Your Perfect Match", "Here's why it fits your criteria", "Close Second Choices", "Want to know how this was chosen?", "Tweak Your Results", "Apply & Re-rank", "Explore Resorts →", slider labels — all hard-coded English
- **Why it matters**: The app supports en/fr/de, but this screen is English-only. A French user completing the quiz in French suddenly gets English results. Broken experience.
- **Fix**: Move all strings to `src/content/en.json` (and fr.json, de.json) under `onboarding.results.*`. Use `content.onboarding.results.*` for all text.

**[P2] Vertical content overload — 5 sections fight for attention**
- **What**: The scroll contains: header → TopPickHero (320px) → ReasonCarousel → SecondChoicesCarousel → DecisionFlowCTA → StickyFooter
- **Why it matters**: For the affluent professional, the results page should feel like a confident answer, not a dashboard of data. The cognitive load is "here's everything we know" vs "here's your answer." The ReasonCarousel with 5 attribute cards and pagination dots particularly feels like a generic AI dashboard pattern.
- **Fix**: Condense. Show the TopPickHero + 2-3 inline reason badges (not a carousel) + runner-ups as a simple list below. The decision flow CTA could be a link in the header actions rather than a separate card. Goal: the top pick should own the viewport.

**[P2] "Explore Resorts →" sticky footer competes with the top pick CTA**
- **What**: Two competing primary actions — tapping the hero to see resort detail, vs tapping the sticky footer "Explore Resorts" to skip to main app
- **Why it matters**: The affluent user who sees a 92% match Verbier wants ONE clear next step: see that resort. Instead they face two buttons. The sticky footer is always visible, competing with the hero's tap action.
- **Fix**: Make the hero tap the primary affordance (add a visible "View Resort →" CTA on the hero). Change the sticky footer to a secondary "Explore All Resorts" ghost button, or add it inline below the runner-ups section instead.

**[P3] Reason carousel requires swiping to see all scores**
- **What**: 5 reason cards in a horizontal carousel with pagination dots
- **Why it matters**: Carousels have notoriously low engagement after the first 1-2 items. For a premium audience, hiding key information behind swipes feels like work. The attributes (skill, budget, vibe, activity, snow) are compact enough to show inline.
- **Fix**: Display all 5 attributes as a compact bar chart or radial chart, or as 5 inline badges with score indicators. No carousel needed for 5 small items.

##### Persona Red Flags

**Marcus, 42, Private Equity:** "I got my result — a 92% match. Great. Now I have to scroll through a carousel of reasons, a carousel of alternatives, some CTA about a 'decision flow'... I just want to book a hotel. Where's the detail page?"

**Sophie, 36, Corporate Lawyer:** Sees hard-coded English on a French-language quiz → "This app isn't really multilingual, it's just a veneer." Notices "Tweak" button text isn't localized → confirms suspicion.

##### Minor Observations

- `tweakButtonLabel` uses raw `fontSize: 13, fontWeight: "600"` — should be `typography.bodySmallMedium` or `typography.label`
- The `→` arrow in "Explore Resorts →" is a text character, not a Lucide icon — inconsistent with the rest of the app which uses Lucide
- `RECOMMENDATION_TIMEOUT_MS = 12000` (12s) is generous — the loading message phases at 3/7/10s are good, but 12s total feels long for a client-side operation. If resorts are cached, scoring should be <1s
- `Dimensions.get("window")` is imported but only used as `_SCREEN_WIDTH` (unused) — dead code
- The modal uses `Modal` from RN which is problematic on web — consider a custom bottom sheet for cross-platform consistency

#### Polish

| Issue | Severity | Fix |
|-------|----------|-----|
| Tweak button uses `+ "40"` hex append for opacity (`colors.brand.primary + "40"`) — fragile, breaks if brand color changes format | P2 | Use a proper `rgba()` or add an `opacity` token to the color system |
| DecisionFlowCTA icon background uses `colors.brand.primary + "20"` — same fragile hex append pattern | P3 | Same fix |
| `scrollContent` padding bottom is `spacing.xxl` (32px) but sticky footer height isn't accounted for — last content may be hidden behind footer | P2 | Add `paddingBottom: 56 + spacing.xxl` (button height + padding) or measure footer height |
| Pagination dots in ReasonCarousel: active dot width changes from 8→24px but no animation — abrupt width change | P3 | Add `withSpring` or `withTiming` transition on active dot width |
| Runner-up carousel pagination uses a `translateX` transform with raw percentage math — doesn't work correctly (percentage of what?) | P2 | Replace with proper Reanimated interpolation based on scroll offset |

#### Layout

| Issue | Severity | Fix |
|-------|----------|-----|
| Hero image height is fixed at 320px regardless of screen size — too short on tablets, too tall on small phones | P2 | Use `useLayout().heroHeight` which already exists for responsive height |
| Header is a `flexDirection: "row"` with title on left and "Tweak" + "Retake" on right — on narrow phones with long translated titles, this will overflow | P2 | Stack header vertically on phone, row on tablet. Or move actions into a more menu |
| ReasonCarousel card width is fixed at 260px — doesn't adapt to screen width | P3 | Calculate card width as `screenWidth - 2*hPadding - peekAmount` for snap-to-card |
| Tweak modal doesn't use `ScreenContainer` or `useLayout` — its padding and sizing are independent of the responsive system | P3 | Align with the global layout system, especially for tablet where it should be a centered sheet |

---

### 3. Resort Detail

**Files:** [app/(main)/resort/[id].tsx](app/(main)/resort/[id].tsx), [OverviewCarousel](src/components/resort/OverviewCarousel.tsx), [MatchBreakdownSection](src/components/resort/MatchBreakdownSection.tsx), [SimilarResortsCarousel](src/components/resort/SimilarResortsCarousel.tsx), [LocationMapSection](src/components/resort/LocationMapSection.tsx)

#### Audit

##### Accessibility

| Issue | WCAG | Severity | Fix |
|-------|------|----------|-----|
| Hero overlay text ("rgba(255,255,255,0.8)" on gradient over photo) — contrast is unpredictable, depends on photo content | 1.4.3 AA | P1 | Add a solid dark scrim behind text, or use text shadow. Current gradient may not cover bright snow photos. Test with light-colored hero images. |
| Dismiss button (XCircle) and Visited button (CheckCircle) have no text label visible — icon-only, relying solely on `accessibilityLabel` | 1.3.3 A | P2 | Add visible tooltip on long-press (mobile) or hover (web), or add small text labels beneath icons |
| `heroLocation` uses raw `fontSize: 15` and `color: "rgba(255,255,255,0.8)"` — not from typography system, opacity may fail contrast on light images | 1.4.3 AA | P2 | Use `typography.body` + ensure minimum contrast with scrim |
| Map button uses 🗺️ emoji as icon — screen reader will announce "world map" emoji which is confusing | 1.1.1 A | P3 | Use a Lucide `map` icon instead |
| Highlight chips use `colors.sentiment.successSubtle` bg with `colors.sentiment.success` text — green-on-light-green may not meet 4.5:1 contrast | 1.4.3 AA | P2 | Verify contrast ratio; likely needs darker text or stronger background |
| No skip-to-content link for keyboard navigation — the nav bar has 4+ buttons before content | 2.4.1 A | P3 | Add skip link for web |

##### Performance

| Issue | Severity | Fix |
|-------|----------|-----|
| Hero image loads synchronously with no placeholder — shows `colors.canvas.subtle` bg, but no skeleton/blur placeholder | P2 | Use `ResortImage` with blurhash or a low-res placeholder |
| Similar resorts loads after main resort — sequential network calls | P3 | Parallel fetch both, or show skeleton for similar section |
| Scroll handler fires every 16ms (`scrollEventThrottle={16}`) — fine for Reanimated worklet but verify it's a worklet handler | P3 | Already using `useAnimatedScrollHandler` — correct. No action needed. |

##### Design System Violations

| Issue | Severity | Fix |
|-------|----------|-----|
| `heroLocation` uses raw `fontSize: 15` + `color: "rgba(255,255,255,0.8)"` | P2 | Use `typography.body` + `colors.onDark.text` or a dedicated onDark.muted token |
| `heroStat` uses raw `fontSize: 14, fontWeight: "600"` | P2 | Use `typography.bodySmallMedium` or `typography.label` |
| `heroStatDot` uses raw `fontSize: 14, color: "rgba(255,255,255,0.5)"` | P3 | Use `colors.onDark.text` with opacity, or define `colors.onDark.textFaint` |
| `highlightText` uses inline `fontWeight: "600"` — should use a typography variant that includes weight | P3 | Use `typography.labelSmall` or `typography.captionMedium` |
| "Compare Against Similar Resorts" heading is hard-coded English | P1 | Move to content JSON |

#### Typeset

| Issue | Severity | Fix |
|-------|----------|-----|
| `heroName` uses `typography.h1` (26px bold) — for a premium resort page, the hero name should be larger, more luxurious | P2 | Use `typography.display` (34px light) on tablet/desktop, keep h1 on phone. Light weight on larger screens reads as more premium. |
| Stats row (42km · 1850–3300m · €180/day) uses 14px which is below the type scale minimum of 15px | P2 | Bump to 15px (`typography.body` or create a `statInline` variant) |
| Description text after the carousel has no visual distinction — runs into the sections above/below | P3 | Add a subtle section divider or increase vertical spacing. Consider an initial cap or drop cap for editorial feel. |

#### Polish

| Issue | Severity | Fix |
|-------|----------|-----|
| Nav bar uses deprecated `colors.surface.divider` for border — should be `colors.border.subtle` | P3 | Replace `colors.surface.divider` → `colors.border.subtle` |
| Desktop 2-column layout has `flex: 3` left and `flex: 2` right with a `borderLeftWidth: 1` divider — the divider has no padding-top alignment with the left column content | P3 | Add consistent `paddingTop` to both columns |
| Heart animation on favorite uses `withSequence(1.4 → 1)` which is the correct bounce pattern, but the dismiss and visited buttons have no press feedback | P2 | Add scale animation to dismiss/visited buttons too — or at minimum use Reanimated spring feedback |
| "Compare Against Similar Resorts" section has no loading skeleton — appears after a delay with no indication it's coming | P3 | Show 3 placeholder cards while `similarResorts` is loading |
| Emoji 🗺️ in button label `🗺️  ${content.resort.viewMap}` — inconsistent with Lucide icon system used everywhere else | P2 | Replace with `<Icon name="map" />` prefix |

---

### 4. Discover Tab

**Files:** [app/(main)/discover.tsx](app/(main)/discover.tsx), [ResortScatterPlot.tsx](src/components/resort/ResortScatterPlot.tsx), [DiscoverControls.tsx](src/components/resort/DiscoverControls.tsx)

#### Critique

##### Nielsen's Heuristics

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Results count updates live; sort state is visible |
| 2 | Match System / Real World | 3 | "A–Z / Most km / Best snow" sorts make sense; resort vocabulary is correct |
| 3 | User Control and Freedom | 3 | Clear search button, clear sort, view toggle — good escape routes |
| 4 | Consistency and Standards | 3 | Uses theme tokens well; desktop sidebar pattern is standard |
| 5 | Error Prevention | 3 | Empty state with clear action is good |
| 6 | Recognition Rather Than Recall | 2 | "Refine" panel is hidden by default — users may not discover the preference sliders exist |
| 7 | Flexibility and Efficiency | 3 | FlatList with `getItemLayout` for performance; desktop sidebar always shows filters |
| 8 | Aesthetic and Minimalist Design | 3 | Clean, functional layout; good density without feeling cramped |
| 9 | Error Recovery | 3 | Network error with retry is solid |
| 10 | Help and Documentation | 2 | No explanation of what the scatter plot axes represent; "Chart" view label is vague |
| **Total** | | **28/40** | **Solid functional screen** |

##### What's Working

1. **Desktop two-panel layout is excellent.** Filter sidebar (300px) + results panel is the correct pattern. Filters always visible, no toggle needed. This is the most mature screen in the app.
2. **FlatList with getItemLayout** is the right performance choice — fixed row height (90px + 1px separator) means no layout measurement overhead. Good engineering.
3. **View toggle between list and scatter plot** is a premium differentiator — most resort apps only offer lists. The scatter plot (budget vs difficulty with bubble size) is a unique visualization.

##### Priority Issues

**[P1] Hard-coded English strings throughout**
- **What**: "Discover", "Search by name, country or region…", "Sort:", "A – Z", "Most km", "Best snow", "Refine", "resort", "resorts", "Chart", "No resorts found", "Clear search" — all hard-coded
- **Why it matters**: Same i18n problem as the results screen. A French user sees English UI chrome around their localized resort data.
- **Fix**: Move all strings to content JSON files.

**[P2] Scatter plot "Chart" label is unclear**
- **What**: The view toggle shows a grid icon + "Chart" — but it opens a scatter plot visualization
- **Why it matters**: "Chart" is generic. The affluent user who sees a grid icon expects a grid view (like Google Maps satellite view toggle), not a scatter plot. Surprise ≠ delight.
- **Fix**: Label it "Compare" or "Plot" and use a scatter-plot icon (Lucide `scatter-chart`). Add a brief subtitle the first time: "See all resorts by budget vs. difficulty."

**[P2] Row design lacks match context**
- **What**: Each row shows thumbnail, name, location, km, snow rating — but no match score or relevance indicator
- **Why it matters**: The user just completed a quiz. They expect to see how each resort relates to their preferences. Without a match score, the Discover tab feels disconnected from the personalized onboarding experience. It's a generic directory.
- **Fix**: Add a match score badge (subtle, right side) or sort by match score by default. Even a colored dot (green/amber/red) indicating match quality would help.

**[P3] Refine panel is hidden on mobile — low discoverability**
- **What**: The preference sliders are behind a "Refine" chip that most users won't tap
- **Why it matters**: The refine controls drive the scatter plot — they're the core interaction. Hiding them behind a toggle means most mobile users will never discover the preference adjustment feature.
- **Fix**: On mobile, show a collapsed summary of current filter state ("Intermediate • Mid budget • Quiet") that expands on tap. This gives visibility + discoverability.

##### Persona Red Flags

**Marcus, 42, Private Equity:** "I can search resorts, but why can't I filter by 'luxury only' or 'off-piste'? The sort options are basic — I want price range and terrain type filters, not just A-Z."

**Sophie, 36, Corporate Lawyer:** Sees "30 resorts" and thinks "There should be more." No indication that this is a curated list, not a comprehensive directory. Needs copy: "Our curated selection of Europe's finest."

##### Minor Observations

- `searchInput` uses raw `fontSize: 15` — should use `typography.body` for consistency
- Sort chip active state adds `fontWeight: "600"` inline — should use a typography variant
- `savedDot` (7x7px red dot for favorited resorts) is extremely subtle — easy to miss. Consider a small heart icon instead
- The scatter plot switches context entirely — search query + sort are irrelevant in that view but the search bar remains. Consider hiding the search bar when in chart view
- `overflowY: "auto" as any` in `desktopSidebar` — type casting suggests RN web-specific CSS leak

#### Layout

| Issue | Severity | Fix |
|-------|----------|-----|
| Desktop sidebar is fixed at 300px width — too narrow for slider labels if content is translated to German (longer strings) | P3 | Use `minWidth: 300, maxWidth: 340` or make it flexible |
| Row thumbnail is 52x52px — quite small for a resort photo. On a premium app, the image should create desire | P2 | Increase to 64x64 or 72x48 (landscape ratio matches actual photos better) |
| Mobile page header uses `variant="h2"` for "Discover" — oversized for a tab screen title. Tabs typically use h3 or overline | P3 | Use `h3` or match the convention of other tab screens |

#### Clarify

| Copy | Problem | Improved Version |
|------|---------|-----------------|
| "Search by name, country or region…" | Overly instructional; users know what search does | "Search resorts…" |
| "No resorts found" + "Start typing to search for resorts." | Condescending when results are empty but user hasn't searched | "No matches" + "Try adjusting your search or filters" |
| "Chart" (view toggle) | Vague — doesn't convey what the visualization shows | "Compare" or "Scatter" |
| "Sort:" label | Unnecessary — sort chips are self-evident | Remove label, or use only on first visit |
| "Refine" | Technical — users think "filter" | "Filter" or "Preferences" |

---

### 5. Home Dashboard

**Files:** [app/(main)/index.tsx](app/(main)/index.tsx), [WelcomeHero.tsx](src/components/home/WelcomeHero.tsx), [QuickActions.tsx](src/components/home/QuickActions.tsx), [FavoritesPreview.tsx](src/components/home/FavoritesPreview.tsx), [ProfileCompletionCard.tsx](src/components/home/ProfileCompletionCard.tsx), [FavoritesBasedRecommendations.tsx](src/components/home/FavoritesBasedRecommendations.tsx)

#### Distill

The home screen currently has 5 sections stacked vertically: **WelcomeHero → QuickActions → ProfileCompletionCard → FavoritesPreview → FavoritesBasedRecommendations**. For a curated app with 30 resorts, this is too much dashboard furniture for a small amount of content.

##### What to Strip

**[P1] Quick Actions section feels like an admin panel, not a premium experience**
- **What**: A grid of coloured cards with icons — "Browse Resorts", "Retake Quiz", "Complete Profile". Each card has icon + label + sublabel.
- **Why remove/reduce**: This is a CMS admin dashboard pattern. Affluent users don't think in "actions" — they think in destinations. The nav tabs already give access to Discover, Favorites, Profile. QuickActions duplicates the tab bar.
- **Recommendation**: Remove QuickActions entirely. Instead, surface contextual nudges inline (e.g., "Your preferences were last updated 3 months ago — worth refreshing?" as a banner, not a card grid).

**[P2] WelcomeHero stat values are thin/misleading**
- **What**: Shows "2 Favorites" and "60% Profile" as the two hero stats
- **Why reduce**: A user with 2 favorites doesn't need a large "2" displayed prominently. It's not a meaningful number. And "60% Profile" is gamification that feels like a fitness app, not a luxury concierge. These stats add visual weight without informational value.
- **Recommendation**: Replace stats row with a single, contextual line: "2 saved resorts · Profile nearly complete" or simply remove the stats and let the greeting + season status badge stand alone. The hero should feel like a private club greeting, not a gamified scorecard.

**[P3] ProfileCompletionCard + QuickActions create double-prompting**
- **What**: If profile is incomplete, user sees "Complete Profile" in QuickActions AND the ProfileCompletionCard below it — two separate components saying the same thing
- **Recommendation**: Keep only ProfileCompletionCard (it's the better-designed of the two). Remove the profile action from QuickActions.

**[P3] "Resorts You'll Love" heading is presumptuous**
- **What**: `FavoritesBasedRecommendations` uses heading "Resorts You'll Love" — based only on similarity to one resort
- **Why**: Claiming "you'll love" something based on a single favorite feels hollow. If I favorited Verbier and you show me Chamonix, that's an educated suggestion — but "You'll Love" oversells it.
- **Recommendation**: "Similar to [Resort Name]" or "Explore more like [Resort Name]"

##### Section Order (Recommended)

| Priority | Section | Rationale |
|----------|---------|-----------|
| 1 | WelcomeHero (simplified) | Personalised greeting + season context. Remove stats row. |
| 2 | FavoritesPreview | Most valuable — shows content the user has actively chosen |
| 3 | ProfileCompletionCard (if incomplete) | Actionable nudge — but only if needed |
| 4 | FavoritesBasedRecommendations | Discovery — "Similar to [name]" |
| — | ~~QuickActions~~ | Remove — duplicates tab bar |

#### Polish

##### Typography / Design System Violations

| File | Issue | Line | Fix |
|------|-------|------|-----|
| [WelcomeHero.tsx](src/components/home/WelcomeHero.tsx) | `name` style uses raw `fontSize: 34, fontWeight: "700", lineHeight: 40, letterSpacing: -1` — not a typography token | 152 | Use `typography.display` or create a `heroName` token |
| [WelcomeHero.tsx](src/components/home/WelcomeHero.tsx) | `seasonText` uses raw `fontSize: 13, fontWeight: "500"` | 170 | Use `typography.labelSmall` |
| [WelcomeHero.tsx](src/components/home/WelcomeHero.tsx) | `statLabel` uses raw `fontSize: 12, fontWeight: "500"` with `textTransform: "uppercase"` + `letterSpacing: 0.5` | 183 | Create `typography.overline` token or use `typography.labelSmall` |
| [QuickActions.tsx](src/components/home/QuickActions.tsx) | `heading` uses `variant="h3"` but then overrides with raw `fontSize: 18, fontWeight: "700"` | 113 | Use variant only, no override. If h3 doesn't match, fix the h3 token. |
| [QuickActions.tsx](src/components/home/QuickActions.tsx) | `label` uses raw `fontSize: 16, fontWeight: "600"` | 131 | Use `typography.bodyMedium` |
| [QuickActions.tsx](src/components/home/QuickActions.tsx) | `sublabel` uses raw `fontSize: 13` | 137 | Use `typography.caption` |
| [FavoritesPreview.tsx](src/components/home/FavoritesPreview.tsx) | `heading` uses `variant="h3"` but overrides with raw `fontSize: 18, fontWeight: "700"` | Same pattern | Remove override, fix h3 token globally |
| [FavoritesPreview.tsx](src/components/home/FavoritesPreview.tsx) | `viewAll` uses raw `fontSize: 14, fontWeight: "600"` | — | Use `typography.labelSmall` with brand.primary color |
| [FavoritesPreview.tsx](src/components/home/FavoritesPreview.tsx) | `emptyTitle` uses raw `fontSize: 16, fontWeight: "600"` | — | Use `typography.bodyMedium` |
| [FavoritesPreview.tsx](src/components/home/FavoritesPreview.tsx) | `emptyText` uses raw `fontSize: 14` | — | Use `typography.body` or `bodySmall` |

**Pattern**: Every home component overrides `variant="h3"` with the same `fontSize: 18, fontWeight: "700"`. This means the `h3` token itself is wrong for their intent. Either fix the token (preferred) or create a section heading variant.

##### Hard-coded English Strings

| Component | Strings | Fix |
|-----------|---------|-----|
| WelcomeHero | "Good morning/afternoon/evening", "Ski season is on!", "Spring skiing available", "Planning ahead?", "Favorite(s)", "Profile" | Move all to content JSON |
| QuickActions | "Quick Actions", "Browse Resorts", "Discover your next trip", "Retake Quiz", "Update your preferences", "Complete Profile", "Better recommendations" | Move to content JSON |
| FavoritesPreview | "Your Favorites", "View All", "No favorites yet", "Tap to browse…", "Browse Resorts →", "more resort(s)" | Move to content JSON |
| ProfileCompletionCard | "Let's Personalise Your Experience", "Help us find your perfect resorts", "complete", "Add resorts you've visited", "Set your home airport", "Save resorts you love", "Complete Profile" | Move to content JSON |
| FavoritesBasedRecommendations | "Resorts You'll Love", "You loved [name]", "These resorts are similar" | Move to content JSON |

**Total: ~35+ hard-coded English strings across 5 components. None use the content/i18n system.**

##### Visual Polish

| Issue | Severity | Fix |
|-------|----------|-----|
| WelcomeHero "decorative snow dots" (80px, 40px, 60px translucent circles) are a cute idea but feel whimsical rather than premium. A 42-year-old PE director doesn't want snow dots. | P2 | Replace with a subtle topographic line pattern or remove entirely. The gradient is strong enough on its own. |
| ProfileCompletionCard progress bar is 6px thin — adequate but the percentage text "60% complete" next to it is redundant with the visual bar | P3 | Keep bar OR percentage text, not both. The bar alone with a tooltip/label on complete is cleaner. |
| FavoritesPreview chevron uses raw text `›` instead of an Icon component | P3 | Replace with `<Icon name="chevron-right" size={16} />` for consistency and better rendering |
| WelcomeHero profile stat always shows "60%" or "100%" — no granularity (it's a boolean check `profileComplete ? "100%" : "60%"`) | P2 | Either show actual percentage from `completionPercentage` or don't show a percentage at all. Hardcoding "60%" is misleading. |
| QuickActions card colors (brand.primarySubtle, sentiment.warningSubtle, sentiment.successSubtle) create a tri-colour patchwork that feels like a children's app | P2 | Use a single neutral card colour with an icon accent colour, or use the same subtle tint for all cards |

##### Accessibility

| Issue | Fix |
|-------|-----|
| WelcomeHero has no `accessibilityRole` or `accessibilityLabel` on the container — screen readers will read individual text nodes without context | Add `accessibilityRole="header"` or wrap in a semantic group |
| FavoritesPreview "Browse Resorts →" uses a text arrow `→` which screen readers may read as "rightwards arrow" | Use `accessibilityLabel="Browse Resorts"` (already present) — but change the visual to an Icon |
| QuickActions cards have `accessibilityLabel={action.label}` but not `accessibilityHint` — user doesn't know tapping navigates | Add `accessibilityHint={`Navigates to ${action.sublabel}`}` |

---

### 6. Profile / Auth

**Files:** [app/(main)/profile.tsx](app/(main)/profile.tsx), [app/(auth)/sign-in.tsx](app/(auth)/sign-in.tsx), [app/(auth)/sign-up.tsx](app/(auth)/sign-up.tsx), [app/(auth)/forgot-password.tsx](app/(auth)/forgot-password.tsx), [app/(auth)/_layout.tsx](app/(auth)/_layout.tsx)

#### Harden

##### Edge Cases & Error Handling

**[P1] No back navigation on auth screens**
- **What**: `_layout.tsx` has `headerShown: false`. None of the auth screens render a back button. If a user taps "Sign In" from profile and wants to go back, they're stuck.
- **Impact**: Dead end. Only escape is system back gesture (Android) or swipe back (iOS). Web users have no escape route at all.
- **Fix**: Add a `<Pressable onPress={() => router.back()}>` with an X or back arrow at the top of each auth screen, or set `headerShown: true` with a minimal header.

**[P1] `Alert.alert()` is not available on web**
- **What**: Profile screen uses `Alert.alert()` for sign out confirmation, retake quiz, clear favorites, and sync results. `Alert.alert()` only works on iOS/Android — on web it's undefined or throws.
- **Impact**: Clicking "Sign Out", "Retake Quiz", or "Clear Favorites" on web will silently fail or crash.
- **Fix**: Use a cross-platform modal/dialog component, or check `Platform.OS === 'web'` and fall back to `window.confirm()`.

**[P2] No email format validation on auth forms**
- **What**: Sign-in checks `if (!email.trim() || !password.trim())` — but doesn't validate email format. Sign-up validates password length but not email.
- **Impact**: User types "john" (no @), submits, gets a Supabase error message that may be unclear. Validate client-side first for a better experience.
- **Fix**: Add basic email regex validation before submit: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.

**[P2] No loading/disabled state on input fields during submit**
- **What**: Sign-in has `editable={!isLoading}` on inputs (good), but there's no visual indication the fields are disabled — they look the same.
- **Impact**: User may think the form is broken when they can't type during submission.
- **Fix**: Add `opacity: 0.5` or a muted background when `isLoading` is true.

**[P2] Profile hero shows emoji 💙 for favorites count**
- **What**: `heroStatPill` renders `💙 {favoriteIds.length}` as a text string
- **Impact**: Emoji in a stat renders inconsistently across platforms. Android may show a different blue heart variant. This is the same anti-pattern flagged on the welcome screen.
- **Fix**: Replace with `<Icon name="heart" size={14} color={colors.brand.accent} />`.

**[P3] "Sync Now" and "Sign Out" have no visual hierarchy**
- **What**: Both are `variant="secondary"` `size="compact"` buttons side by side. "Sign Out" is destructive but looks identical to "Sync Now".
- **Fix**: Use `variant="danger"` for "Sign Out" (which you already have a danger variant for "Clear Saved Resorts").

**[P3] Forgot password screen — no indication of email format**
- **What**: After sending the reset link, screen shows "We've sent a reset link to {email}". But the email isn't masked — could be a privacy concern if someone is looking over the user's shoulder.
- **Fix**: Mask email: "We've sent a link to j***@example.com" or just "Check your inbox for a reset link."

**[P3] Password requirements only shown as placeholder**
- **What**: Sign-up has `placeholder="At least 6 characters"` but no real-time strength indicator or requirements list. Validation only fires on submit.
- **Fix**: Show password requirements below the field (✓ 6+ characters) that update as user types.

##### Empty / Edge States

| State | Current Behaviour | Improvement |
|-------|-------------------|-------------|
| Not authenticated on profile | Shows "Welcome" + "Sign in" button + preferences (possibly stale) | Consider showing a focused sign-in prompt with value prop, not the full preference panel |
| No preferences set | Shows "⚠️ Not set" warning + all rows show "Not set" | Group into a single onboarding CTA: "Complete your quiz to see preferences here" |
| 0 favorites, 0 visited | Shows `💙 0 Saved · ✓ 0 Visited` | Hide the stat row entirely when both are 0 — showing zeros feels hollow |
| Very long display name | `numberOfLines={1}` truncates — but no maxWidth set on `heroIdentity` | Add `maxWidth: '70%'` or test with "Alexander von Humboldt III" |

#### Clarify

##### Profile Screen Copy

| Current Copy | Problem | Improved Version |
|-------------|---------|-----------------|
| "Sync Now" | Technical — users don't know what "sync" means in context | "Save to Cloud" or "Back Up" |
| "Sign Out" | Fine, but context is unclear — will they lose data? | "Sign Out" with subtitle: "Your local data will be kept" (currently only in the alert) |
| "Retake Quiz" → destructive alert "This will reset your preferences" | "Retake" implies supplements, "reset" implies destruction — mixed messaging | "Update Preferences" → "This will start the preference quiz again. Your current settings will be replaced." |
| "Clear Saved Resorts (3)" | "Clear" is vague — delete? Unsave? | "Remove All Saved Resorts (3)" |
| "Visited Resorts: Not set" | Users don't "set" visited resorts — they "add" them | "Visited Resorts: None added" |
| Budget: "Premium tier" | What does "tier" mean? It's quiz jargon | "Premium budget" |
| "About" section with `aboutText` from content | Useful for transparency, but buried at the bottom with no call to action | Keep as-is but consider a "Help & FAQ" link |

##### Auth Screen Copy

| Current Copy | Problem | Improved Version |
|-------------|---------|-----------------|
| Sign-in: "Welcome Back" | Generic — every app says this | "Sign in to PisteWise" (brand reinforcement) |
| Sign-in: "Sign in to sync your preferences and favorites across devices." | Too long for a subtitle. Users know why they're signing in. | "Your preferences. Every device." |
| Sign-up: "Sign up to save your preferences and sync across devices." | Same issue — verbose | "One account. All your resorts." |
| Sign-in: "or continue with" (social divider) | Correct pattern, but the case is inconsistent ("Sign In" vs "continue with") | "Or sign in with" |
| Sign-in: "Continue without an account" | Good — but styled as faint text, easily missed. Should be more prominent for users who want to browse without commitment. | Keep copy, increase `fontSize` and add underline or make it a ghost button |
| Forgot password: "Enter the email address for your account and we'll send you a reset link." | Overly long | "Enter your email and we'll send a reset link." |

##### Accessibility Gaps

| Element | Issue | Fix |
|---------|-------|-----|
| Profile `heroAvatar` (initial letter circle) | No `accessibilityLabel` — screen reader reads nothing or just the letter | Add `accessibilityLabel="Profile avatar"` |
| Profile `heroStatRow` | Stat pills read as separate fragments ("💙", "2", "Saved") | Wrap in accessible group: `accessibilityLabel="2 saved resorts, 0 visited"` |
| Sign-in email input | No `accessibilityLabel` — relies on platform inference from `placeholder` | Add `accessibilityLabel="Email address"` |
| Sign-in password input | No `accessibilityLabel` | Add `accessibilityLabel="Password"` |
| Sign-up confirm password input | No `accessibilityLabel` | Add `accessibilityLabel="Confirm password"` |
| Sign-up display name input | No `accessibilityLabel` | Add `accessibilityLabel="Display name"` |
| Forgot password "Send Reset Link" button | No `accessibilityHint` | Add `accessibilityHint="Sends a password reset email"` |
| Language selector buttons | Good — already have `accessibilityLabel` and `accessibilityState` | ✅ |
| Profile `PrefRow` | Good — has `accessibilityLabel` and `accessibilityRole` | ✅ |

##### Hard-coded English Strings (Auth screens)

All auth screen strings are hard-coded in English — none use the content/i18n system:

| Screen | Strings |
|--------|---------|
| Sign In | "Welcome Back", "Sign in to sync…", "Email", "Password", "Forgot password?", "Sign In", "Signing in...", "or continue with", "Continue with Apple/Google", "Don't have an account?", "Sign Up", "Continue without an account", "Please enter both…", "Welcome back!" |
| Sign Up | "Create Account", "Sign up to save…", "Display Name (optional)", "Email", "Password", "Confirm Password", "Create Account", "Creating account…", "At least 6 characters", "Account created successfully!", "Check your email…", validation messages |
| Forgot Password | "Reset Password", "Check your inbox", "Enter the email…", "We've sent a reset link…", "Email", "Send Reset Link", "Sending…", "Back to Sign In" |

**Total: ~40+ hard-coded strings across 3 auth screens.**

The Profile screen partially uses the content system (good) but still has hard-coded strings for: "My Profile", "Visited Resorts", "All regions", the word "tier" in budget display, "Sign in to sync your data across devices", "Welcome", "Sync Now", "Sign Out", sync success/failure alert messages.

---

## Executive Summary

### Cross-cutting Issues (by frequency)

| Issue | Screens Affected | Severity |
|-------|-----------------|----------|
| **Hard-coded English strings** | All 6 screens | P1 |
| **Raw fontSize/fontWeight instead of typography tokens** | 5 of 6 (all except Resort Detail) | P1 |
| **Emoji used instead of icons** | Welcome (⛷️🎯🏔️📱), Profile (💙✓⚠️) | P1 |
| **Accessibility labels/hints missing** | All 6 screens have gaps | P2 |
| **`Alert.alert()` not available on web** | Profile (4 usages) | P1 |
| **No back navigation on auth screens** | Sign In, Sign Up, Forgot Password | P1 |

### P1 Fix Priority (do first)

1. **i18n sweep**: Move ~120+ hard-coded English strings to content JSON across all screens
2. **Typography token audit**: Replace all raw `fontSize`/`fontWeight` with `typography.*` tokens. Fix `h3` token to match actual usage (18px/700).
3. **Replace all emoji with Lucide icons** (welcome, profile)
4. **Add cross-platform dialog** to replace `Alert.alert()` on web
5. **Add back navigation to auth screens**

### P2 Fix Priority (do next)

1. Improve hero overlay text contrast on resort detail (text shadow or gradient scrim)
2. Increase resort thumbnails from 52×52 to 64×64 on Discover
3. Remove QuickActions from home dashboard (duplicates tab bar)
4. Rename scatter plot toggle from "Chart" to "Compare"
5. Add match score context to Discover list rows
6. Remove decorative snow dots from WelcomeHero
7. Add email validation to auth forms
8. Fix WelcomeHero hardcoded "60%" profile stat

### Design Maturity Scores

| Screen | Score | Assessment |
|--------|-------|------------|
| Onboarding Welcome | 24/40 | Below premium standard — emoji + missing shortcuts |
| Results Top 5 | 26/40 | Good personalization, i18n and token gaps |
| Resort Detail | 30/40 | Best screen — well-structured, minor polish needed |
| Discover Tab | 28/40 | Strong functionality, needs match context + i18n |
| Home Dashboard | 22/40 | Over-engineered — too many sections for 30 resorts |
| Profile / Auth | 25/40 | Functional but web-broken (`Alert.alert`), no auth back nav |
| **Average** | **25.8/40** | **Solid foundation, not yet premium** |

### Bottom Line

The app has strong engineering foundations (FlatList optimization, responsive layouts, Supabase sync, design token system) but the UI doesn't yet match the affluent 30+ demographic. The three biggest gaps are:

1. **i18n is broken** — the content system exists but ~60% of strings bypass it
2. **Typography tokens exist but aren't used** — every component overrides with raw values
3. **Visual tone is mid-market** — emoji, snow dots, gamified stats, and "Quick Actions" cards feel like a fitness app, not a luxury concierge

Fixing these three systemic issues would elevate every screen simultaneously.
