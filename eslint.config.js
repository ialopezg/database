import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import jest from 'eslint-plugin-jest';
import nodeRecommended from 'eslint-plugin-n/configs/recommended-module.js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import ts from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['coverage', 'node_modules', 'dist', 'src/test/**/*.ts', 'rollup.config.js'],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  nodeRecommended,
  jest.configs['flat/recommended'],
  eslintConfigPrettier,
  eslintPluginPrettierRecommended,
  ...ts.configs.recommended,
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      '@typescript-eslint/no-unsafe-function-type': 'off',
      'n/no-extraneous-import': [
        'error',
        {
          allowModules: ['@jest/globals'],
        },
      ],
      'n/no-missing-import': 'off',
      'n/no-process-exit': 'off',
      'n/no-unpublished-import': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
  {
    files: ['test/**/*.js'],
    rules: {
      'no-global-assign': 'off',
    },
  },
];
