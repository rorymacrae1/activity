import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "@components/ui/Button";

describe("Button", () => {
  it("renders primary variant by default", () => {
    const { toJSON } = render(
      <Button label="Get Started" onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders secondary variant", () => {
    const { toJSON } = render(
      <Button label="Cancel" variant="secondary" onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders ghost variant", () => {
    const { toJSON } = render(
      <Button label="Skip" variant="ghost" onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders accent variant", () => {
    const { toJSON } = render(
      <Button label="Upgrade" variant="accent" onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders danger variant", () => {
    const { toJSON } = render(
      <Button label="Delete" variant="danger" onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders compact size", () => {
    const { toJSON } = render(
      <Button label="Edit" size="compact" onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders prominent size", () => {
    const { toJSON } = render(
      <Button label="Find My Resort" size="prominent" onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders loading state", () => {
    const { toJSON } = render(
      <Button label="Saving..." loading onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders disabled state", () => {
    const { toJSON } = render(
      <Button label="Submit" disabled onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders full width", () => {
    const { toJSON } = render(
      <Button label="Continue" fullWidth onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders with left icon", () => {
    const { toJSON } = render(
      <Button label="Save" leftIcon="❤️" onPress={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("fires onPress when tapped", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <Button label="Tap me" onPress={onPress} />,
    );
    fireEvent.press(getByLabelText("Tap me"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <Button label="Disabled" disabled onPress={onPress} />,
    );
    fireEvent.press(getByLabelText("Disabled"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("has correct accessibility attributes", () => {
    const { getByRole } = render(<Button label="Submit" onPress={() => {}} />);
    const button = getByRole("button");
    expect(button).toBeTruthy();
  });
});
