import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "public/**",
      "supabase/functions/**/vendor/**",
      "next-env.d.ts",
    ],
  },
  {
    files: ["app/**/*.tsx", "app/**/*.ts", "components/**/*.tsx", "features/**/*.tsx"],
    ignores: ["app/api/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/supabase/admin",
              message:
                "The privileged Supabase client is server-only. Use it from server/ or app/api/ route handlers, never from UI components.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
