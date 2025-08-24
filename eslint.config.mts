import js from "@eslint/js"
import globals from "globals"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import eslintConfigPrettier from "eslint-config-prettier/flat"

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    languageOptions: { globals: globals.node },
    plugins: { js },
  },
  eslintConfigPrettier,
]
