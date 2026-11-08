import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintConfigPrettier from "eslint-config-prettier";

// eslint-config-standard est au format historique (.eslintrc) : on le convertit.
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { ignores: ["dist/", "src/routeTree.gen.ts"] },
  ...compat.extends("standard"),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      // TypeScript gère déjà ces vérifications (et mieux) :
      "no-undef": "off",
      "no-unused-vars": "off",
      "no-redeclare": "off",
      "no-use-before-define": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Résolution des imports gérée par TypeScript / Vite.
      "import/no-unresolved": "off",
    },
  },
  eslintConfigPrettier,
];
