/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.[jt]sx?$": [
      "babel-jest",
      {
        presets: ["babel-preset-expo"],
        plugins: [
          [
            "module-resolver",
            {
              root: ["./"],
              alias: { "@": "./src" },
              extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
            },
          ],
        ],
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^react-native-mmkv$": "<rootDir>/src/__mocks__/react-native-mmkv.ts",
    "^@/lib/storage(\\.native)?$": "<rootDir>/src/__mocks__/lib/storage.ts",
  },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  collectCoverageFrom: [
    "src/services/**/*.ts",
    "src/stores/**/*.ts",
    "!src/**/__mocks__/**",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|expo|@expo|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens)/)",
  ],
};
