/**
 * Mock for @expo-google-fonts/* packages.
 * Returns numeric font asset IDs (matching expo-font's expected format).
 */
module.exports = new Proxy(
  {},
  {
    get(_target, prop) {
      if (typeof prop === "string") return prop;
      return undefined;
    },
  },
);
