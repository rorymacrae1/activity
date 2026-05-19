/**
 * Mock for lucide-react-native — returns a simple View for each icon.
 * Used by component tests where the actual SVG rendering is not needed.
 */
import React from "react";
import { View } from "react-native";

const MockIcon = React.forwardRef((_props: Record<string, unknown>, _ref) =>
  React.createElement(View),
);

MockIcon.displayName = "MockIcon";

export default MockIcon;
