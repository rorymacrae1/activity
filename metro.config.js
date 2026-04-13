const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Enable web support
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs"];

// Force Metro to resolve packages using CJS-compatible conditions.
// Without this, Metro picks up zustand's ESM build (esm/*.mjs) which
// uses `import.meta.env` — a syntax unsupported outside native ES modules.
// Removing "import" from conditionNames forces fallback to "default" → CJS.
config.resolver.unstable_conditionNames = [
  "require",
  "default",
  "react-native",
  "browser",
];

config.transformer = {
  ...config.transformer,
  hermesParser: false,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// ─── Web bundle optimisations ─────────────────────────────────────────────────
// Enable Metro's unstable tree-shaking pass for web builds.
// This eliminates dead code exports that Reanimated and Gesture Handler
// ship in their packages.
config.transformer.unstable_allowRequireContext = true;

// Reduce Reanimated's web footprint: disable features we don't use on web.
// The worklet runtime and JSI bindings are only needed on native.
// On web, Reanimated falls back to JS with CSS transitions which is lighter.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // On web, redirect Reanimated's native bindings to a no-op
  if (
    platform === "web" &&
    moduleName ===
      "react-native-reanimated/src/reanimated2/NativeReanimated/NativeReanimated"
  ) {
    return context.resolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
