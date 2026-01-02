const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/components/(.*)$": "<rootDir>/components/$1",
    "^@/lib/(.*)$": "<rootDir>/lib/$1",
    "^@/app/(.*)$": "<rootDir>/app/$1",
    "^@/context/(.*)$": "<rootDir>/context/$1",
    "^@/hooks/(.*)$": "<rootDir>/hooks/$1",
  },
  collectCoverage: true,
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "context/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "!app/**/*.test.{js,jsx,ts,tsx}",
    "!components/**/*.test.{js,jsx,ts,tsx}",
    "!lib/**/*.test.{js,jsx,ts,tsx}",
    "!app/layout.{js,jsx,ts,tsx}",
    "!app/globals.css",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  // Coverage thresholds - gradually increase as you add more tests
  // Current: ~0.7-2% (46 tests) → Target: 70%+
  // TODO: Increase thresholds as test coverage improves
  coverageThreshold: {
    global: {
      branches: 0.5, // Gradually increase: 0.5 → 5 → 20 → 50 → 70
      functions: 2, // Gradually increase: 2 → 10 → 30 → 50 → 70
      lines: 1, // Gradually increase: 1 → 10 → 30 → 50 → 70
      statements: 1, // Gradually increase: 1 → 10 → 30 → 50 → 70
    },
  },
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
    "/prisma/",
  ],
  testMatch: [
    "**/__tests__/**/*.{js,jsx,ts,tsx}",
    "**/*.test.{js,jsx,ts,tsx}",
    "**/*.spec.{js,jsx,ts,tsx}",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/.next/", "/coverage/"],
  transformIgnorePatterns: [
    "/node_modules/",
    "^.+\\.module\\.(css|sass|scss)$",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  globals: {
    "ts-jest": {
      tsconfig: {
        jsx: "react",
      },
    },
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
