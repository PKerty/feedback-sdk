import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,js}"],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        crypto: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        ShadowRoot: "readonly",
        HTMLElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLButtonElement: "readonly",
        NodeListOf: "readonly",
        Element: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      indent: ["error", 4],
      "linebreak-style": ["error", "unix"],
      quotes: ["error", "double"],
      semi: ["error", "always"],
      "max-len": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_", "ignoreRestSiblings": true }],
      camelcase: ["error", { "properties": "never" }],
      complexity: ["error", 10],
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "prefer-const": "error",
      "@typescript-eslint/no-magic-numbers": ["error", { "ignore": [0, 1, -1, 2, 3, 4, 5, 60, 500, 1000] }],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          "selector": "variable",
          "format": ["camelCase"],
          "filter": {
            "regex": "^(ConfigSchema|FeedbackSchema|ICONS)$",
            "match": false
          }
        },
        {
          "selector": "function",
          "format": ["camelCase"]
        },
        {
          "selector": "typeLike",
          "format": ["PascalCase"]
        },
        {
          "selector": "variable",
          "format": ["PascalCase"],
          "filter": {
            "regex": "^(ConfigSchema|FeedbackSchema)$",
            "match": true
          }
        }
      ],
    },
  },
  {
    files: ["src/__tests__/**/*.{ts,js}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-magic-numbers": "off",
    },
  },
];