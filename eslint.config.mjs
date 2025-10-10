import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
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
      ...js.configs.recommended.rules,
      ...serverRules,
    },
  },

  // UI
  ...defineConfigWithVueTs([
    ...pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,

    {
      name: 'ui',
      files: ['ui/**/*.{vue,ts,tsx,js,mjs,cjs}'],
      ignores: ['**/dist/**', '**/node_modules/**', '**/ui/postcss.config.js'],
      languageOptions: {
        parserOptions: {
          parser: tseslint.parser,
          projectService: true,
          tsconfigRootDir: import.meta.dirname,
          project: ['./ui/tsconfig.eslint.json'],
          extraFileExtensions: ['.vue'],
        },
        globals: { ...globals.browser },
      },
      plugins: {
        '@stylistic': stylistic,
      },
      rules: {
        ...uiRules,
      },
    },
  ]),
];
