module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
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
