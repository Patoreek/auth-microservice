// eslint.config.js
const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-config-prettier');
const pluginPrettier = require('eslint-plugin-prettier');
const eslintComments = require('eslint-plugin-eslint-comments');
const globals = require('globals');

module.exports = [
  // Ignore patterns for all files
  {
    ignores: ['dist', 'node_modules'],
  },
  // Recommended JavaScript rules
  js.configs.recommended,
  // TypeScript-specific configuration
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      prettier: pluginPrettier,
      'eslint-comments': eslintComments,
    },
    rules: {
      'no-undef': 'off',
      'prettier/prettier': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-unused-expressions': 'off',
      'no-warning-comments': 'off',
      'eslint-comments/no-unused-disable': 'off',
      semi: 'off',
      '@typescript-eslint/semi': ['error', 'always'],
    },
  },
  // JavaScript-specific configuration (for eslint.config.js and other .js files)
  {
    files: ['eslint.config.js', '**/*.js'],
    languageOptions: {
      parserOptions: {
        sourceType: 'commonjs', // Treat .js files as CommonJS
      },
      globals: {
        ...globals.node, // Define Node.js globals (process, module, etc.)
      },
    },
    rules: {
      'no-undef': 'off', // Disable no-undef to avoid 'process' errors
      '@typescript-eslint/no-require-imports': 'off', // Allow require() in .js files
      '@typescript-eslint/no-explicit-any': 'off', // Disable TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': 'off', // Disable TypeScript-specific rules
    },
  },
  prettier,
];