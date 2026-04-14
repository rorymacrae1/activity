/** @type {import('jest').Config} */

const sharedModuleNameMapper = {
  "^@/lib/storage(\\.native)?$": "<rootDir>/src/__mocks__/lib/storage.ts",
  "^@lib/supabase$": "<rootDir>/src/__mocks__/lib/supabase.ts",
  "^@expo-google-fonts/(.*)$": "<rootDir>/src/__mocks__/expo-google-fonts.ts",
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
};

const sharedTransform = {
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
            extensions: [
              ".ios.js",
              ".android.js",
              ".js",
              ".ts",
              ".tsx",
              ".json",
            ],
          },
        ],
      ],
    },
  ],
};

const sharedTransformIgnore = [
  "node_modules/(?!(react-native|@react-native|expo-[^/]+|expo|@expo|@expo-google-fonts|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens|react-native-worklets|lucide-react-native|react-native-svg)/)",
];

module.exports = {
  globals: {
    __DEV__: true,
  },
  projects: [
    // ── Logic tests (services, stores) — node environment ───────────────
    {
      displayName: "logic",
      testEnvironment: "node",
      testMatch: [
        "**/src/services/**/__tests__/**/*.test.[jt]s?(x)",
        "**/src/stores/**/__tests__/**/*.test.[jt]s?(x)",
      ],
      transform: sharedTransform,
      moduleNameMapper: sharedModuleNameMapper,
      transformIgnorePatterns: sharedTransformIgnore,
    },
    // ── Component tests — react-native environment ──────────────────────
    {
      displayName: "components",
      preset: "react-native",
      testMatch: ["**/src/components/__tests__/**/*.test.[jt]s?(x)"],
      transform: sharedTransform,
      moduleNameMapper: {
        ...sharedModuleNameMapper,
        "^react-native-reanimated$":
          "<rootDir>/src/__mocks__/react-native-reanimated.ts",
      },
      transformIgnorePatterns: sharedTransformIgnore,
      setupFiles: ["<rootDir>/node_modules/react-native/jest/setup.js"],
    },
  ],
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
};
