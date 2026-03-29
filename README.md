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

## 🧩 MVP Scope

### Phase 1 Features

#### 1. Onboarding / Preference Quiz
- Skill level (beginner/intermediate/advanced)
- Budget range
- Preferred region (Europe first)
- Preferences: quiet vs lively, family vs nightlife, snow reliability importance

#### 2. Recommendation Engine
- Return top 3–5 resorts
- Show match score (e.g. 92% match)
- Explain WHY each resort is recommended

#### 3. Resort Detail Page
- Overview
- Difficulty breakdown
- Key stats
- Static piste map

#### 4. Basic Navigation (Lite)
- Simple map view of resort
- Highlight beginner/intermediate/advanced areas

### Out of Scope for MVP
- Real-time tracking
- Social features
- Booking system
- Complex map routing
- AI/ML (rule-based only)

---

## 🏗 Architecture

### Offline-First Design

```
┌──────────────────────────────────────────────────────────────┐
│                        MOBILE APP                            │
│                     (No server required!)                    │
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
│  │  │ resorts.json│  │ MMKV Store  │  │ Cached Maps  │  │   │
│  │  │ (bundled)   │  │ (prefs/user)│  │ (file system)│  │   │
│  │  └─────────────┘  └─────────────┘  └──────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Local DB | MMKV + JSON | Simple for 30-50 resorts, fast reads |
| Image Cache | expo-image | Built-in caching |
| Map Storage | expo-file-system | Offline piste maps |
| State | Zustand + persist | Minimal boilerplate |
| Backend | None for MVP | Ship faster, zero hosting |
| Auth | Anonymous (local UUID) | Accounts added post-MVP |

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
  region: string;                // "Alps", "Pyrenees"
  subRegion?: string;            // "Trois Vallées"
  
  location: {
    lat: number;
    lng: number;
    villageAltitude: number;     // meters
    peakAltitude: number;
  };
  
  terrain: {
    beginner: number;            // percentage (0-100)
    intermediate: number;
    advanced: number;
  };
  
  stats: {
    totalRuns: number;
    totalKm: number;
    lifts: number;
    snowParks: number;
  };
  
  attributes: {
    averageDailyCost: number;    // EUR
    liftPassDayCost: number;
    liftPassSixDayCost: number;
    crowdLevel: number;          // 1-5
    familyScore: number;         // 1-5
    nightlifeScore: number;      // 1-5
    snowReliability: number;     // 1-5
    liftModernity: number;       // 1-5
    nearestAirport: string;
    transferTimeMinutes: number;
  };
  
  content: {
    description: string;
    highlights: string[];
  };
  
  assets: {
    heroImage: string;
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

```
Welcome → Skill → Budget → Region → Vibes → Results
                                              ↓
                                         Resort Detail → Map View
                                              ↓
                                           Favorites
```

### Screens

| Screen | Purpose | Key Components |
|--------|---------|----------------|
| Welcome | Value prop, start quiz | Hero, CTA |
| Skill | Select ability | 3 tappable cards |
| Budget | Select budget range | 4 options |
| Region | Multi-select regions | Map + checkboxes |
| Vibes | Set atmosphere | 2 sliders |
| Results | Show recommendations | Ranked cards |
| Resort Detail | Full resort info | All sections |
| Map View | Piste map | Zoomable image |
| Favorites | Saved resorts | List |
| Profile | Settings, retake quiz | Options |

---

## 📁 Project Structure

```
/app                           # Expo Router screens
├── _layout.tsx
├── index.tsx
├── (onboarding)/
│   ├── index.tsx              # Welcome
│   ├── skill.tsx
│   ├── budget.tsx
│   ├── region.tsx
│   ├── vibes.tsx
│   └── results.tsx
├── (main)/
│   ├── _layout.tsx            # Tab navigator
│   ├── index.tsx              # Results/Home
│   ├── resort/[id].tsx        # Resort detail
│   ├── map/[id].tsx           # Piste map
│   ├── favorites.tsx
│   └── profile.tsx

/src
├── components/
│   ├── ui/                    # Design system
│   ├── resort/                # Resort-specific
│   ├── onboarding/            # Quiz components
│   └── layout/                # Screen wrappers
├── stores/
│   ├── preferences.ts
│   ├── favorites.ts
│   └── app.ts
├── services/
│   └── recommendation/
│       ├── engine.ts
│       ├── scorer.ts
│       └── explainer.ts
├── data/
│   └── resorts.json
├── types/
│   ├── resort.ts
│   └── preferences.ts
├── lib/
│   ├── storage.ts
│   └── constants.ts
└── theme/
    ├── colors.ts
    ├── typography.ts
    └── spacing.ts

/assets
├── images/
│   ├── resorts/               # Hero images
│   └── maps/                  # Piste maps
├── fonts/
└── icon.png
```

---

## 🗺 Resort Data (Europe MVP)

### Target: 30 Resorts

**France (8)**
- Val Thorens, Chamonix, Les Arcs, La Plagne
- Méribel, Courchevel, Tignes, Alpe d'Huez

**Austria (8)**
- Lech-Zürs, St. Anton, Kitzbühel, Obergurgl
- Sölden, Ischgl, Mayrhofen, Zell am See

**Switzerland (6)**
- Verbier, Zermatt, St. Moritz
- Davos, Wengen, Saas-Fee

**Italy (5)**
- Cortina, Val Gardena, Livigno
- Cervinia, Courmayeur

**Andorra/Spain (3)**
- Grandvalira, Baqueira Beret, Formigal

---

## 📅 Implementation Plan (6 Weeks)

### Week 1: Foundation + Data Entry
- [ ] Expo project setup
- [ ] Folder structure + design system basics
- [ ] Zustand stores
- [ ] Research & enter 10 resorts (France/Austria)
- [ ] Create `resorts.json` schema

### Week 2: Data + Recommendation Engine
- [ ] Enter remaining 20 resorts
- [ ] Download/organize piste map images
- [ ] Implement recommendation engine
- [ ] Unit tests for scoring logic

### Week 3: Onboarding Flow
- [ ] Welcome screen
- [ ] Skill, Budget, Region, Vibes screens
- [ ] Progress indicator
- [ ] Wire to Zustand → trigger recommendations

### Week 4: Results + Resort Detail
- [ ] Results screen with ranked cards
- [ ] Match score + reasons display
- [ ] Resort detail screen (all sections)
- [ ] Save/unsave to favorites

### Week 5: Maps + Offline
- [ ] Piste map viewer (zoomable)
- [ ] Image caching
- [ ] Offline indicator
- [ ] Tab navigation polish

### Week 6: Polish + Ship
- [ ] Loading/error/empty states
- [ ] App icon + splash screen
- [ ] TestFlight build
- [ ] Play Store internal track

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

## 🚀 Post-MVP Roadmap

1. **User Accounts** - Optional sync, your test account
2. **More Resorts** - North America, Japan
3. **Booking Links** - Affiliate integration
4. **Weather/Snow Data** - Live conditions
5. **Social Features** - Share trip plans
6. **AI Upgrade** - Learn from user behavior

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native (Expo) |
| Language | TypeScript |
| Routing | Expo Router |
| State | Zustand |
| Storage | MMKV |
| Images | expo-image |
| Maps | Zoomable Image (react-native-gesture-handler) |
| Testing | Jest |

---

## Development

```bash
# Install dependencies
npm install

# Start development
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run tests
npm test
```

---

## License

Private - All Rights Reserved
