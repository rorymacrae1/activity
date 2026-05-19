import React from "react";
import { render } from "@testing-library/react-native";
import { Text } from "@components/ui/Text";

describe("Text", () => {
  it("renders body variant by default", () => {
    const { toJSON } = render(<Text>Hello world</Text>);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders heading variants", () => {
    const { toJSON } = render(<Text variant="h1">Heading</Text>);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders with semantic color presets", () => {
    const { toJSON } = render(
      <Text variant="body" color="muted">
        Muted text
      </Text>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders with custom color string", () => {
    const { toJSON } = render(<Text color="#FF0000">Custom color</Text>);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders with text alignment", () => {
    const { toJSON } = render(<Text align="center">Centered</Text>);
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders display variant", () => {
    const { toJSON } = render(
      <Text variant="display" color="brand">
        PeakWise
      </Text>,
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("renders caption variant with inverse color", () => {
    const { toJSON } = render(
      <Text variant="caption" color="inverse">
        Small text
      </Text>,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
