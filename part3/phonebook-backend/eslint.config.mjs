import js from '@eslint/js'
import globals from 'globals'
import stylistic from '@stylistic/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  {
    // Check all the .js files of the backend
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs', // our code uses require(...)
      globals: globals.node
    },
    plugins: { js, '@stylistic': stylistic },
    // The recommended rules of ESLint
    extends: ['js/recommended'],
    // Our own style rules
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/semi': ['error', 'never'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/arrow-spacing': ['error', { before: true, after: true }],
      '@stylistic/no-trailing-spaces': 'error',
      eqeqeq: 'error',
      'no-console': 'off' // we use console.log in the backend
    }
  },
  // Do not check the frontend build
  globalIgnores(['dist/'])
])