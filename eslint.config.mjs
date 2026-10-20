import eslint from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import nextCoreGuards from './lint/next-core-guards.mjs';

// Independent lint stack avoids the affected Next ESLint glob dependency.
// Configure real Node/browser globals; keep recommended JS no-undef enabled.
const globalsUsed = [
  'AbortController', 'AbortSignal', 'Buffer', 'FormData', 'Headers', 'ReadableStream',
  'Request', 'Response', 'TextEncoder', 'URL', 'URLSearchParams',
  'clearInterval', 'clearTimeout', 'console', 'crypto', 'document',
  'fetch', 'process', 'sessionStorage', 'setImmediate', 'setInterval',
  'setTimeout', 'window',
];
const readonlyGlobals = Object.fromEntries(globalsUsed.map(name => [name, 'readonly']));

export default [
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'coverage/**'] },
  {
    ...eslint.configs.recommended,
    languageOptions: { globals: readonlyGlobals },
    // JS test files may explicitly disable a TS rule even though it is not
    // enabled for JS. Register the plugin so such directives are recognized.
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      ...eslint.configs.recommended.rules,
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['app/**/*.{jsx,tsx}', 'pages/**/*.{jsx,tsx}', 'components/**/*.{jsx,tsx}'],
    plugins: { 'local-next': nextCoreGuards },
    rules: {
      'local-next/no-raw-img': 'error',
      'local-next/no-internal-html-link': 'error',
      'local-next/no-sync-script': 'error',
      'local-next/no-raw-head': 'error',
      'local-next/no-unsafe-blank-target': 'error',
      'local-next/no-next-document-in-app': 'error',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaFeatures: { jsx: true }, sourceType: 'module' },
      globals: readonlyGlobals,
    },
    plugins: { '@typescript-eslint': tsPlugin, 'react-hooks': reactHooks },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-undef': 'off', // TypeScript type checking owns TS symbol resolution.
    },
  },
];
