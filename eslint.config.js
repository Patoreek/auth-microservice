import js from "@eslint/js";
import * as tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import eslintComments from "eslint-plugin-eslint-comments"; // Import the plugin
import globals from "globals";

export default [
  js.configs.recommended,
  {
    ignores: ["dist", "node_modules"],
  },
  // Configuration for eslint.config.js itself
  {
    files: ["eslint.config.js"],
    languageOptions: {
      globals: {
        ...globals.node, // Include Node.js globals like 'process'
      },
    },
  },
  // JavaScript/Node rules go here
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: process.cwd(),
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        process: "readonly",
      },
    },
    plugins: {
      prettier: pluginPrettier, // Specify the plugin object here
      "eslint-comments": eslintComments, // Specify the plugin object here
    },
    rules: {
      "prettier/prettier": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-expressions": "off",
      "no-warning-comments": "off",
      "eslint-comments/no-unused-disable": "off", // Disable rule to keep comments
      semi: "off",
      "@typescript-eslint/semi": ["error", "always"],
    },
  },
  prettier,
];
