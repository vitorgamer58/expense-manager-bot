// @ts-check

import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import globals from "globals"
import eslintConfigPrettier from "eslint-config-prettier/flat"

export default tseslint.config([
  {
    ignores: ["dist/**", "node_modules/**"]
  },
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    ignores: ["node_modules/**", "dist/**", "eslint.config.mts"],
    languageOptions: {
      globals: globals.node,
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname
      }
    },
    plugins: { js: eslint }
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier
])
