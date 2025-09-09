import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // ✅ Ignore unused vars completely
      "@typescript-eslint/no-unused-vars": "off",

      // ✅ Allow any
      "@typescript-eslint/no-explicit-any": "off",

      // ✅ Allow <img> for now
      "@next/next/no-img-element": "off",

      // ✅ Allow plain quotes/apostrophes inside JSX
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
