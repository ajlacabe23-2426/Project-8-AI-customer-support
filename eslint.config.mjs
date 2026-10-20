import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';

// Independent lint stack: do not reintroduce eslint-config-next's vulnerable glob chain.
export default [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'] },
  eslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
      globals: { process: 'readonly', console: 'readonly', URL: 'readonly', Request: 'readonly', Response: 'readonly', fetch: 'readonly', Buffer: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', crypto: 'readonly', FormData: 'readonly', AbortController: 'readonly' },
    },
    plugins: { '@typescript-eslint': tsPlugin, 'react-hooks': reactHooks },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off',
    },
  },
];
