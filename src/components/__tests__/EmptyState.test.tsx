import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { EmptyState } from "@components/ui/EmptyState";

// Mock Icon — avoids lucide-react-native SVG dependency
jest.mock("@components/ui/Icon", () => ({
  Icon: ({ name }: { name: string }) => {
    const { View, Text } = require("react-native");
    return (
      <View testID={`icon-${name}`}>
        <Text>{name}</Text>
      </View>
    );
  },
}));

// Mock Button — avoids Reanimated dependency
jest.mock("@components/ui/Button", () => ({
  Button: ({ label, onPress }: { label: string; onPress: () => void }) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable onPress={onPress} accessibilityLabel={label}>
        <Text>{label}</Text>
      </Pressable>
    );
  },
}));

describe("EmptyState", () => {
  it("renders title and message", () => {
    render(
      <EmptyState
        icon="bookmark"
        title="No saved resorts"
        message="Save resorts to see them here."
      />,
    );

    expect(screen.getByText("No saved resorts")).toBeTruthy();
    expect(screen.getByText("Save resorts to see them here.")).toBeTruthy();
  });

  it("renders the specified icon", () => {
    render(
      <EmptyState
        icon="heart"
        title="Nothing here"
        message="Add some favorites."
      />,
    );

    expect(screen.getByTestId("icon-heart")).toBeTruthy();
  });

  it("renders action button when provided", () => {
    const onPress = jest.fn();

    render(
      <EmptyState
        icon="search"
        title="No results"
        message="Try different filters."
        action={{ label: "Reset filters", onPress }}
      />,
    );

    expect(screen.getByText("Reset filters")).toBeTruthy();
  });

  it("fires action onPress when button tapped", () => {
    const onPress = jest.fn();

    render(
      <EmptyState
        icon="search"
        title="No results"
        message="Try different filters."
        action={{ label: "Reset filters", onPress }}
      />,
    );

    fireEvent.press(screen.getByText("Reset filters"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not render button when no action provided", () => {
    render(
      <EmptyState icon="bookmark" title="Empty" message="Nothing to show." />,
    );

    expect(screen.queryByText("Reset filters")).toBeNull();
  });
});
