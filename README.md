# PeakWise

> Find your perfect ski resort in seconds—and get a smart guide once you arrive.

A mobile application that helps users discover the most suitable ski resort based on their personal preferences, make better travel decisions using smart recommendations, and navigate their experience while at the resort.

---

## 🎯 Core Value Proposition

**Personalised recommendation engine + intelligent on-resort companion**

This is NOT a generic maps or discovery app. PeakWise uses a transparent, rule-based matching algorithm to find resorts that genuinely fit your skill level, budget, and vibe preferences.

---

## 👤 Target Users

- Skiers (beginner to expert)
- Travellers planning ski trips
- Groups trying to decide where to go
- Users who feel overwhelmed by too many choices

---

## 🧩 Current Features

### ✅ Implemented

#### 1. Onboarding Quiz
- Trip type (solo/couple/family/friends)
- Group skill levels (beginner/intermediate/advanced)
- Budget range (budget/mid/premium/luxury)
- Region selection (interactive map)
- Atmosphere preferences (crowd level, family vs nightlife, snow importance)

#### 2. Recommendation Engine
- Returns top matches ranked by score
- Shows match percentage (e.g. 92% match)
- Explains WHY each resort is recommended
- Decision flow visualisation

#### 3. Results Experience
- Large hero card for #1 pick
- Swipeable "why it fits" reason carousel
- Horizontal carousel for runner-up resorts
- Tap to view resort details

#### 4. Resort Detail Page
- Fixed navigation bar with back/favorite
- Hero image with resort highlights
- Overview carousel (terrain, snow, budget, altitude, vibe)
- Reviews placeholder section
- Accommodation placeholder section
- Transport info (airport, transfer time)
- Compare against similar resorts carousel
- Zoomable piste map

#### 5. User Accounts (Supabase Auth)
- Email/password sign up and sign in
- Google and Apple social login
- Cloud sync for preferences and favorites
- Row Level Security for user data

#### 6. Favorites
- Save/unsave resorts
- Synced across devices when logged in
- Offline support with merge on reconnect

#### 7. Discover & Scatter Plot
- Browse all 100 resorts with search and sort
- Interactive 2D PCA scatter plot (Map view)
- Dots colour-coded by match score tier
- Adjustable preference controls (skill, budget, snow, vibe, scene)
- Tap any dot for resort summary + navigation

#### 8. Internationalisation
- English, French, German content
- Language selection in onboarding and profile

### 🔜 Coming Soon

See [FUTURE.md](FUTURE.md) for the full roadmap.

---

## � Architecture

### Hybrid Offline-First Design

```
┌──────────────────────────────────────────────────────────────┐
│                        MOBILE APP                            │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐   │
│  │  Onboarding  │──▶│ Preferences  │──▶│ Recommendation │   │
│  │   Screens    │   │   (Zustand)  │   │ Engine (local) │   │
│  └──────────────┘   └──────────────┘   └───────┬────────┘   │
│                                                 │            │
│                                                 ▼            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    LOCAL DATA LAYER                   │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │ resorts.ts  │  │ MMKV Store  │  │ Cached Maps  │  │   │
│  │  │ (bundled)   │  │ (prefs/user)│  │ (file system)│  │   │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                             │                                │
│                             │ (when online)                  │
│                             ▼                                │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                 SUPABASE BACKEND                      │   │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │ auth.users  │  │   profiles   │  │   resorts   │  │   │
│  │  └─────────────┘  └──────────────┘  └─────────────┘  │   │
│  │  ┌────────────────────┐  ┌────────────────────────┐  │   │
│  │  │ user_preferences   │  │    user_favorites      │  │   │
│  │  └────────────────────┘  └────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Primary DB | Supabase (PostgreSQL) | 100 resorts, auth, sync |
| Local Cache | MMKV | Fast reads, offline support |
| Image Cache | expo-image | Built-in caching |
| State | Zustand + persist | Minimal boilerplate |
| Auth | Supabase Auth | Email/password, Google, Apple |
| Sync | Bi-directional merge | Works offline, syncs when online |

---

## 🧠 Recommendation Engine

### Philosophy
Rule-based scoring with weighted multi-attribute matching. No ML—transparent and explainable.

### User Input → Resort Attribute Mapping

| User Input | Maps To | Scoring Method |
|------------|---------|----------------|
| Skill Level | `terrainDistribution` | Distribution match |
| Budget | `averageDailyCost` | Range fit |
| Region | `country`, `region` | Filter |
| Quiet vs Lively | `crowdLevel` | Inverse/direct |
| Family vs Nightlife | `familyScore`, `nightlifeScore` | Direct match |
| Snow Reliability | `snowReliability` | Weighted by importance |

### Scoring Algorithm

#### Step 1: Normalize Preferences (0-1 scale)
```typescript
interface NormalizedPreferences {
  skillLevel: number;        // 0=beginner, 0.5=intermediate, 1=advanced
  budgetLevel: number;       // 0=budget, 0.5=mid, 1=luxury
  quietLively: number;       // 0=quiet, 1=lively
  familyNightlife: number;   // 0=family, 1=nightlife
  snowImportance: number;    // 0=not important, 1=critical
}
```

#### Step 2: Calculate Attribute Scores

**Skill Match:**
- Compare user skill to resort's terrain distribution
- Beginner ideal: 50% beginner, 40% intermediate, 10% advanced
- Intermediate ideal: 20% beginner, 55% intermediate, 25% advanced
- Advanced ideal: 10% beginner, 30% intermediate, 60% advanced
- Score = 100 - weighted difference from ideal

**Budget Match:**
- Define ranges: Budget (€80-120), Mid (€140-180), Premium (€220-280), Luxury (€350+)
- Score based on fit within range

**Vibe/Activity Match:**
- Direct comparison of normalized values

#### Step 3: Weighted Final Score

```typescript
const weights = {
  skill: 0.30,    // Most important
  budget: 0.25,   // Very important
  vibe: 0.15,     // Moderate
  activity: 0.15, // Moderate
  snow: 0.15      // Adjusted by user importance
};

matchScore = Σ(attributeScore × weight)
```

#### Step 4: Generate Explanations

Top 3 scoring attributes become human-readable reasons:
- "Perfect terrain mix for your skill level"
- "Peaceful slopes you're looking for"
- "Excellent snow reliability (4.5/5)"

---

## 📊 Data Model

### Resort Schema

```typescript
interface Resort {
  id: string;                    // URL-friendly slug
  name: string;
  country: string;
  region: string;
  subRegion?: string;

  location: {
    lat: number;
    lng: number;
    villageAltitude: number;     // meters
    peakAltitude: number;
  };

  terrain: TerrainDistribution;  // { beginner, intermediate, advanced } percentages

  stats: {
    totalRuns: number;
    totalKm: number;
    lifts: number;
    snowParks: number;
  };

  attributes: {
    averageDailyCost: number;    // GBP
    liftPassDayCost: number;
    liftPassSixDayCost: number;
    crowdLevel: number;          // 1-5
    familyScore: number;         // 1-5
    nightlifeScore: number;      // 1-5
    snowReliability: number;     // 1-5
    liftModernity: number;       // 1-5
    nearestAirport: string;      // IATA code
    transferTimeMinutes: number;
    // Extended (from joined tables)
    hasSkiInOut?: boolean;
    hasCatered?: boolean;
    trainAccessible?: boolean;
    eurostarDirect?: boolean;
    trainJourneyHours?: number;
    driveHoursFromLondon?: number;
  };

  content: {
    description: string;
    highlights: string[];
  };

  assets: {
    heroImage: string;           // Unsplash URL
    pisteMap: string;
  };

  season: {
    start: string;               // "2025-11-30"
    end: string;                 // "2026-04-20"
  };
}
```

### Preferences Schema

```typescript
interface Preferences {
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  budgetLevel: 'budget' | 'mid' | 'premium' | 'luxury';
  regions: string[];
  crowdPreference: number;       // 1-5 (quiet to lively)
  familyVsNightlife: number;     // 1-5 (family to nightlife)
  snowImportance: number;        // 1-5
}
```

### Local Storage Keys

```typescript
// MMKV Keys
"user:uuid"              // Anonymous user ID
"user:createdAt"         // First launch date
"preferences:current"    // Latest quiz results
"preferences:history"    // Previous quiz results
"favorites:resortIds"    // Saved resort IDs
"cache:mapsDownloaded"   // Downloaded piste map IDs
```

---

## 📱 Screen Flow

### Onboarding Quiz Flow
```
Welcome → Trip Type → Skill → Budget → Region → Vibes → Results
                                                          ↓
                                                    Decision Flow
```

### Main App Flow
```
Results → Resort Detail → Map View
   ↓           ↓              
 Favorites  Compare Resorts
   ↓              
Profile → Auth (Sign In / Sign Up)
```

### Screens

| Screen | Route | Purpose | Key Components |
|--------|-------|---------|----------------|
| **Onboarding** ||||
| Welcome | `(onboarding)/` | Value prop, start quiz | Hero illustration, CTA |
| Trip Type | `(onboarding)/trip-type` | Select who you're travelling with | Solo/Couple/Family/Friends cards |
| Skill | `(onboarding)/skill` | Select ability level | Beginner/Intermediate/Advanced cards |
| Budget | `(onboarding)/budget` | Select budget range | 4 budget tier options |
| Region | `(onboarding)/region` | Multi-select regions | Interactive map + region chips |
| Vibes | `(onboarding)/vibes` | Set atmosphere preferences | Crowd & Family/Nightlife sliders |
| Results | `(onboarding)/results` | Show top recommendations | TopPickHero, ReasonCarousel, SecondChoicesCarousel |
| Decision Flow | `(onboarding)/decision-flow` | Visualise recommendation logic | Flow diagram with scores |
| **Main App** ||||
| Discover | `(main)/` | Browse all resorts | Search, filters, resort grid |
| Resort Detail | `(main)/resort/[id]` | Full resort info | OverviewCarousel, Reviews, Accommodation, Transport, SimilarResortsCarousel |
| Map View | `(main)/map/[id]` | Piste map | Zoomable image viewer |
| Favorites | `(main)/favorites` | Saved resorts | Resort cards, empty state |
| Profile | `(main)/profile` | Settings, sync, retake quiz | Account info, preferences summary |
| **Authentication** ||||
| Sign In | `(auth)/sign-in` | Login existing users | Email/password, Google, Apple |
| Sign Up | `(auth)/sign-up` | Create new account | Email/password, terms |

---

## 🏛 Architecture

## 📁 Project Structure

```
/app                           # Expo Router screens
├── _layout.tsx                # Root layout with auth init
├── index.tsx                  # Entry point routing
├── (onboarding)/
│   ├── _layout.tsx
│   ├── index.tsx              # Welcome
│   ├── trip-type.tsx          # Who are you travelling with
│   ├── skill.tsx              # Ability level
│   ├── budget.tsx             # Budget range
│   ├── region.tsx             # Region selection
│   ├── vibes.tsx              # Atmosphere sliders
│   ├── results.tsx            # Recommendations
│   └── decision-flow.tsx      # How we chose your match
├── (main)/
│   ├── _layout.tsx            # Tab navigator
│   ├── index.tsx              # Discover/Home
│   ├── resort/[id].tsx        # Resort detail
│   ├── map/[id].tsx           # Piste map
│   ├── favorites.tsx
│   └── profile.tsx
└── (auth)/
    ├── _layout.tsx
    ├── sign-in.tsx
    └── sign-up.tsx

/src
├── components/
│   ├── ui/                    # Design system (Text, Button, Card, etc.)
│   ├── resort/                # ResortCard, TerrainChart, OverviewCarousel, SimilarResortsCarousel
│   ├── onboarding/            # QuizLayout, ProgressIndicator
│   └── results/               # TopPickHero, ReasonCarousel, SecondChoicesCarousel
├── stores/
│   ├── preferences.ts         # Quiz answers (Zustand + persist)
│   ├── favorites.ts           # Saved resorts with cloud sync
│   └── auth.ts                # Supabase auth state
├── services/
│   ├── resort.ts              # Resort data access, getSimilarResorts
│   ├── sync.ts                # Cloud sync for preferences/favorites
│   └── recommendation/
│       ├── index.ts           # getRecommendations entry
│       ├── scorer.ts          # Match scoring algorithm
│       └── explainer.ts       # Human-readable reasons
├── data/
│   ├── resorts.ts             # Bundled resort data (fallback)
│   └── index.ts
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── storage.ts             # Web localStorage adapter
│   └── storage.native.ts      # Native MMKV adapter
├── hooks/
│   ├── useLayout.ts           # Responsive layout
│   └── useContent.ts          # i18n content
├── types/
│   ├── resort.ts
│   ├── preferences.ts
│   ├── recommendation.ts
│   └── supabase.ts            # Database types
└── theme/
    ├── colors.ts
    ├── typography.ts
    ├── spacing.ts
    └── index.ts

/assets
├── images/
│   ├── resorts/               # Hero images
│   └── default-resort.jpg     # Fallback image
├── fonts/
│   └── Montserrat-*.ttf
└── icon.png
```

---

## 🗺 Resort Data

### Current: 100 Ski Resorts (Supabase)

Resort data is stored in `public.resort` (64 columns) with 7 joined tables:
- `cost_data` — lift pass, rental, lunch prices by year
- `slope_data` — kilometres by grade, lift counts, snow park features
- `season_timing` — open/close dates, best/avoid weeks
- `airport_link` — nearest airports with transfer times and flight info
- `facility` — bars, restaurants, ski schools, activities
- `accommodation` — hotels, chalets with pricing and features
- `weather_month` — monthly temperature, snowfall, visibility

All data is fetched via PostgREST joins in a single query. Row Level Security (RLS) is enabled on user-owned tables (`profiles`, `user_preferences`, `user_favorites`, `visited_resorts`) with policies scoped to `auth.uid()`.

**Countries covered:** France, Austria, Switzerland, Italy, Andorra, Spain, Norway, Sweden, Finland, Germany, Bulgaria, Slovenia, Scotland, Japan, USA, Canada, Argentina, Chile, New Zealand, Australia, and more.

---

---

## ⚠️ Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Manual data entry | Time consuming | Template + batch entry |
| Stale data | Inaccurate scores | `lastVerified` field |
| Missing maps | Broken feature | Fallback "coming soon" |
| Subjective ratings | Inconsistent | Create rating rubric |
| Offline image size | Large app | Lazy download maps |

---

## 🚀 Future Roadmap

See [FUTURE.md](FUTURE.md) for the full prioritised roadmap.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript (strict mode) |
| Routing | Expo Router v6 |
| State | Zustand + persist middleware |
| Storage | MMKV (native) / localStorage (web) |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Images | expo-image |
| Animations | Reanimated + Gesture Handler |
| Maps | Zoomable Image (react-native-gesture-handler) |
| Testing | Jest |
| Fonts | Montserrat (custom loaded) |

---

## Development

```bash
# Install dependencies
npm install

# Start development (select platform)
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web

# Run tests
npm test

# TypeScript check
npx tsc --noEmit

# Lint
npm run lint
```

### Environment Variables

Create `.env.local` with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## License

Private - All Rights Reserved
