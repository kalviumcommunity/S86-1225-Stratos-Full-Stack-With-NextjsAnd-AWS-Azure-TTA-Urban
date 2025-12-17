import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const eslintConfig = defineConfig([
  ...nextVitals,
  prettierRecommended,
  {
    rules: {
      "no-console": "warn",
      quotes: ["error", "double"],
      semi: ["error", "always"],
    },
  },
  // Allow console in API routes, scripts, and test files
  {
    files: [
      "app/api/**/*.ts",
      "app/api/**/*.js",
      "prisma/seed.ts",
      "test-*.ts",
      "check-*.ts",
      "create-*.ts",
      "app/lib/db-test.ts",
    ],
    rules: {
      "no-console": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
