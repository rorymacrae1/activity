module.exports = function (api) {
  api.cache(true);
  const isTest = process.env.NODE_ENV === "test";
  return {
    // nativewind/babel is a preset (returns { plugins: [...] }) — not a plugin.
    // Excluded in test env: Jest provides its own transform without NativeWind.
    presets: [
      "babel-preset-expo",
      ...(!isTest ? ["nativewind/babel"] : []),
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@theme": "./src/theme",
            "@stores": "./src/stores",
            "@services": "./src/services",
            "@components": "./src/components",
            "@hooks": "./src/hooks",
            "@lib": "./src/lib",
            "@types": "./src/types",
            "@data": "./src/data",
          },
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
        },
      ],
      "react-native-reanimated/plugin",
    ],
  };
};
