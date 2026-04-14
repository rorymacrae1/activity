import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ResortCard } from "@components/resort/ResortCard";
import type { RecommendationResult } from "@/types/recommendation";
import type { Resort } from "@/types/resort";

// Mock expo-linear-gradient
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children?: React.ReactNode }) => {
    const { View } = require("react-native");
    return <View>{children}</View>;
  },
}));

// Mock ResortImage (avoids expo-image)
jest.mock("@components/ui/ResortImage", () => ({
  ResortImage: () => {
    const { View } = require("react-native");
    return <View testID="resort-image" />;
  },
}));

// Mock Icon (avoids lucide-react-native)
jest.mock("@components/ui/Icon", () => ({
  Icon: () => null,
}));

// Mock useLayout
jest.mock("@hooks/useLayout", () => ({
  useLayout: () => ({ cardImageHeight: 200 }),
}));

// Mock useProfile from auth store
jest.mock("@stores/auth", () => ({
  useProfile: () => null,
}));

const makeResort = (overrides: Partial<Resort> = {}): Resort => ({
  id: "test-1",
  name: "Test Resort",
  country: "Switzerland",
  region: "Valais",
  subRegion: undefined,
  location: { lat: 46.0, lng: 7.5, villageAltitude: 1500, peakAltitude: 3000 },
  terrain: { beginner: 30, intermediate: 40, advanced: 30 },
  stats: { totalRuns: 100, totalKm: 200, lifts: 50, snowParks: 2 },
  attributes: {
    averageDailyCost: 120,
    liftPassDayCost: 70,
    liftPassSixDayCost: 350,
    crowdLevel: 3,
    familyScore: 4,
    nightlifeScore: 3,
    snowReliability: 4,
    liftModernity: 4,
    nearestAirport: "GVA",
    transferTimeMinutes: 90,
    townStyle: "Traditional village",
    barCount: 10,
    otherActivities: [],
    hasSkiInOut: false,
    hasCatered: false,
    trainAccessible: false,
    eurostarDirect: false,
    trainJourneyHours: null,
    driveHoursFromLondon: null,
  },
  content: { description: "A great resort", highlights: [] },
  assets: { heroImage: "https://example.com/img.jpg", pisteMap: "" },
  season: { start: "2025-12-01", end: "2026-04-30" },
  ...overrides,
});

const makeResult = (
  overrides?: Partial<RecommendationResult>,
): RecommendationResult => ({
  resort: makeResort(),
  matchScore: 85,
  matchReasons: ["Great snow", "Good value"],
  attributeScores: {
    skill: 80,
    budget: 90,
    vibe: 75,
    activity: 85,
    snow: 88,
  },
  ...overrides,
});

describe("ResortCard", () => {
  it("renders without crashing", () => {
    const onPress = jest.fn();
    render(<ResortCard result={makeResult()} onPress={onPress} />);
    expect(screen.getByText("Test Resort")).toBeTruthy();
  });

  it("displays resort name and country", () => {
    render(<ResortCard result={makeResult()} onPress={jest.fn()} />);
    expect(screen.getByText("Test Resort")).toBeTruthy();
    expect(screen.getByText("Switzerland · Valais")).toBeTruthy();
  });

  it("displays stats", () => {
    render(<ResortCard result={makeResult()} onPress={jest.fn()} />);
    expect(screen.getByText("200")).toBeTruthy(); // totalKm
    expect(screen.getByText("4/5")).toBeTruthy(); // snowReliability
    expect(screen.getByText("€120")).toBeTruthy(); // averageDailyCost
  });

  it("displays match score", () => {
    render(<ResortCard result={makeResult()} onPress={jest.fn()} />);
    expect(screen.getByText("85")).toBeTruthy();
    expect(screen.getByText("%")).toBeTruthy();
  });

  it("displays rank badge", () => {
    render(<ResortCard result={makeResult()} rank={1} onPress={jest.fn()} />);
    expect(screen.getByText("#1")).toBeTruthy();
  });

  it("fires onPress", () => {
    const onPress = jest.fn();
    render(<ResortCard result={makeResult()} onPress={onPress} />);
    fireEvent.press(screen.getByLabelText("Test Resort, 85% match"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("displays match reasons", () => {
    render(<ResortCard result={makeResult()} onPress={jest.fn()} />);
    expect(screen.getByText("Great snow")).toBeTruthy();
    expect(screen.getByText("Good value")).toBeTruthy();
  });

  it("hides match score when showMatchScore is false", () => {
    render(
      <ResortCard
        result={makeResult()}
        onPress={jest.fn()}
        showMatchScore={false}
      />,
    );
    expect(screen.queryByText("85")).toBeNull();
    expect(screen.queryByText("%")).toBeNull();
  });

  it("has correct accessibility label", () => {
    render(<ResortCard result={makeResult()} onPress={jest.fn()} />);
    expect(screen.getByLabelText("Test Resort, 85% match")).toBeTruthy();
  });
});
