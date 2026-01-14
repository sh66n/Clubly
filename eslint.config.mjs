import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  // ✅ Next.js Core Web Vitals rules
  ...nextVitals,

  // ✅ TypeScript rules
  ...nextTs,

  // 🔧 Your overrides
  {
    rules: {
      // Disable unused vars warnings (Vercel noise)
      "@typescript-eslint/no-unused-vars": "off",

      // Allow <img> instead of next/image
      "@next/next/no-img-element": "off",

      // Allow explicit `any`
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ✅ Ignore build artifacts (override defaults cleanly)
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
]);
