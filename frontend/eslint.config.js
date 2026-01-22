import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Allow any in API layer where Supabase returns dynamic types
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow ts-ignore for edge cases
      '@typescript-eslint/ban-ts-comment': 'off',
      // Relaxed for complex effect dependencies
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
])
