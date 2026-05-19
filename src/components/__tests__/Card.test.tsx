import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Text as RNText } from "react-native";
import { Card } from "@components/ui/Card";

describe("Card", () => {
  it("renders standard elevation by default", () => {
    const { toJSON } = render(
      <Card>
        <RNText>Card content</RNText>
      </Card>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders flat elevation", () => {
    const { toJSON } = render(
      <Card elevation="flat">
        <RNText>Flat card</RNText>
      </Card>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders elevated variant", () => {
    const { toJSON } = render(
      <Card elevation="elevated">
        <RNText>Featured</RNText>
      </Card>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders with no padding", () => {
    const { toJSON } = render(
      <Card padding="none">
        <RNText>Image card</RNText>
      </Card>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders compact padding", () => {
    const { toJSON } = render(
      <Card padding="compact">
        <RNText>Dense card</RNText>
      </Card>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders with border", () => {
    const { toJSON } = render(
      <Card bordered>
        <RNText>Bordered</RNText>
      </Card>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders as interactive when onPress is provided", () => {
    const { toJSON } = render(
      <Card onPress={() => {}} accessibilityLabel="Tap this card">
        <RNText>Interactive card</RNText>
      </Card>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("fires onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <Card onPress={onPress} accessibilityLabel="Resort card">
        <RNText>Tap me</RNText>
      </Card>,
    );
    fireEvent.press(getByLabelText("Resort card"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("has button role when interactive", () => {
    const { getByRole } = render(
      <Card onPress={() => {}} accessibilityLabel="Resort card">
        <RNText>Interactive</RNText>
      </Card>,
    );
    expect(getByRole("button")).toBeTruthy();
  });

  it("renders static card without button role", () => {
    const { queryByRole } = render(
      <Card>
        <RNText>Static</RNText>
      </Card>,
    );
    expect(queryByRole("button")).toBeNull();
  });
});
