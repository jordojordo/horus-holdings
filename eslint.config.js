import globals from 'globals';
import path from 'node:path';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tseslint from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    name:            'app/env',
    languageOptions: {
      globals:       {
        ...globals.node,
        ...globals.browser
      },
      parser:        tsParser,
      parserOptions: {
        project:      path.resolve('./tsconfig.eslint.json'),
        ecmaFeatures: { jsx: true }
      },
    },
  },
  {
    name:  'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,js,mjs,cjs,jsx}'],
  },

  {
    name:    'app/plugins',
    plugins: {
      js,
      '@typescript-eslint': tseslint,
      react,
      'react-hooks':        reactHooks,
      'react-refresh':      reactRefresh,
    },
  },

  {
    name:    'app/files-to-ignore',
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      'coverage',
      '.nyc_output',
      'node_modules/*',
      'server/node_modules/',
      '.npm',
      '.eslintcache',
      '.env',
      '.cache',
      'dist',
      'dist-pkg',
      'server/dist',
      '.DS_Store',
      'pnpm-lock.yaml',
      'public',
      '*.tsbuildinfo'
    ],
  },

  {
    name:  'app/rules',
    rules: {
      'react/react-in-jsx-scope':             'off',
      'react-refresh/only-export-components': 'off',

      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      'dot-notation':          'off',
      'guard-for-in':          'off',
      'new-cap':               'off',
      'no-empty':              'off',
      'no-extra-boolean-cast': 'off',
      'no-new':                'off',
      'no-plusplus':           'off',
      'no-useless-escape':     'off',
      strict:                  'off',

      'array-bracket-spacing': 'warn',
      'arrow-parens':          'warn',
      'arrow-spacing':         [
        'warn',
        {
          before: true,
          after:  true,
        },
      ],
      'block-spacing':               ['warn', 'always'],
      'brace-style':                 ['warn', '1tbs'],
      'comma-dangle':                ['warn', 'only-multiline'],
      'comma-spacing':               'warn',
      curly:                         'warn',
      eqeqeq:                        'warn',
      'func-call-spacing':           ['warn', 'never'],
      'implicit-arrow-linebreak':    'warn',
      indent:                        ['warn', 2],
      'keyword-spacing':             'warn',
      'lines-between-class-members': [
        'warn',
        'always',
        { exceptAfterSingleLine: true },
      ],
      'multiline-ternary':             ['warn', 'never'],
      'newline-per-chained-call':      ['warn', { ignoreChainWithDepth: 4 }],
      'no-caller':                     'warn',
      'no-cond-assign':                ['warn', 'except-parens'],
      'no-console':                    'off',
      'no-debugger':                   'warn',
      'no-eq-null':                    'warn',
      'no-eval':                       'warn',
      'no-trailing-spaces':            'warn',
      'no-undef':                      'warn',
      'no-unused-vars':                'off',
      'no-whitespace-before-property': 'warn',
      'object-curly-spacing':          ['warn', 'always'],
      'object-property-newline':       'warn',
      'object-shorthand':              'warn',
      'padded-blocks':                 ['warn', 'never'],
      'prefer-arrow-callback':         'warn',
      'prefer-template':               'warn',
      'rest-spread-spacing':           'warn',
      semi:                            ['warn', 'always'],
      'space-before-function-paren':   ['warn', 'never'],
      'space-infix-ops':               'warn',
      'spaced-comment':                'warn',
      'switch-colon-spacing':          'warn',
      'template-curly-spacing':        ['warn', 'always'],
      'yield-star-spacing':            ['warn', 'both'],

      'key-spacing': [
        'warn',
        {
          align: {
            beforeColon: false,
            afterColon:  true,
            on:          'value',
            mode:        'minimum',
          },
          multiLine: {
            beforeColon: false,
            afterColon:  true,
          },
        },
      ],

      'object-curly-newline': [
        'warn',
        {
          ObjectExpression: {
            multiline:     true,
            minProperties: 3,
          },
          ObjectPattern: {
            multiline:     true,
            minProperties: 4,
          },
          ImportDeclaration: {
            multiline:     true,
            minProperties: 5,
          },
          ExportDeclaration: {
            multiline:     true,
            minProperties: 3,
          },
        },
      ],

      'padding-line-between-statements': [
        'warn',
        {
          blankLine: 'always',
          prev:      '*',
          next:      'return',
        },
        {
          blankLine: 'always',
          prev:      'function',
          next:      'function',
        },
        // This configuration would require blank lines after every sequence of variable declarations
        {
          blankLine: 'always',
          prev:      ['const', 'let', 'var'],
          next:      '*',
        },
        {
          blankLine: 'any',
          prev:      ['const', 'let', 'var'],
          next:      ['const', 'let', 'var'],
        },
      ],

      quotes: [
        'warn',
        'single',
        {
          avoidEscape:           true,
          allowTemplateLiterals: true,
        },
      ],

      'space-unary-ops': [
        'warn',
        {
          words:    true,
          nonwords: false,
        },
      ],
    },
  }
];
