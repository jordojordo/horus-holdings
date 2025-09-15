import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

import uiRules from './eslint.rules.ui.mjs';
import serverRules from './eslint.rules.server.mjs';

export default [
  { name: 'env', languageOptions: { globals: globals.node } },

  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.vite/**',
      'ui/public/**',
      '**/*.log',
      'server/combined.log',
      'server/error.log',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Server
  {
    name: 'server',
    files: ['server/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./server/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node },
    },
    plugins: { '@stylistic': stylistic },
    rules: {
      ...serverRules,
    },
  },

  // UI
  {
    name: 'ui',
    files: ['ui/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./ui/tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: { ...globals.browser },
    },
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...uiRules,
    },
  }
];
