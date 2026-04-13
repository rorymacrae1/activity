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
    "^@/lib/storage(\\.native)?$": "<rootDir>/src/__mocks__/lib/storage.ts",
    "^@lib/supabase$": "<rootDir>/src/__mocks__/lib/supabase.ts",
    "^react-native-mmkv$": "<rootDir>/src/__mocks__/react-native-mmkv.ts",
    "^@theme$": "<rootDir>/src/theme/index.ts",
    "^@theme/(.*)$": "<rootDir>/src/theme/$1",
    "^@stores/(.*)$": "<rootDir>/src/stores/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@data/(.*)$": "<rootDir>/src/data/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
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
