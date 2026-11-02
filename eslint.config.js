import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import importPlugin from 'eslint-plugin-import';

export default [
  { ignores: ['dist'] },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { react, 'react-hooks': reactHooks, 'react-refresh': reactRefresh, import: importPlugin },
    settings: { 'import/resolver': { node: { extensions: ['.js', '.jsx'] } } },
    rules: {
      // Só as regras clássicas: as do React Compiler acusam mutações normais no react-three-fiber (plano 11)
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Sem ela, o no-unused-vars não vê o uso em JSX
      'react/jsx-uses-vars': 'error',
      // Aviso até o plano que desfaz o ciclo entre os módulos de src/game
      'import/no-cycle': 'warn',
    },
  },
  {
    files: ['vite.config.js', 'eslint.config.js', 'src/game/__tests__/**'],
    languageOptions: { globals: globals.node },
  },
];
