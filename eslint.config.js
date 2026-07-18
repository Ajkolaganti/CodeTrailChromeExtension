import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";

const browserGlobals = {
  Blob: "readonly",
  URL: "readonly",
  document: "readonly",
  window: "readonly",
  navigator: "readonly",
  location: "readonly",
  fetch: "readonly",
  crypto: "readonly",
  btoa: "readonly",
  atob: "readonly",
  MutationObserver: "readonly",
  chrome: "readonly"
};

const nodeGlobals = {
  process: "readonly",
  console: "readonly",
  __dirname: "readonly",
  Buffer: "readonly"
};

export default [
  {
    ignores: ["dist", "node_modules", "coverage"]
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: "latest",
        sourceType: "module"
      },
      globals: {
        ...browserGlobals,
        ...nodeGlobals
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      "no-console": ["warn", { "allow": ["warn", "error", "info"] }]
    }
  },
  prettier
];
