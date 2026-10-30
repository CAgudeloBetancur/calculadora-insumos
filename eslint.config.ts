import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import type { Config } from 'eslint/config';
import astro from 'eslint-plugin-astro';

// Archivos de nuestro código. Se excluyen los .astro porque su// sintaxis (frontmatter) solo la entiende el parser de Astro.
const ARCHIVOS_NUESTROS = ['**/*.{js,mjs,cjs,ts,mts,cts,tsx}'];

// La config de TypeScript viene como array de 3 capas:
//   [0] el parser  -> sin `files`, aplicaría a los .astro
//   [1] las reglas -> con `files` correctos
//   [2] copia sin `files` -> duplicada, se descarta
const tsConfigs = tseslint.configs.recommended as Config[];

export default defineConfig([
  // 1. Ignorar carpetas generadas y dependencias.
  {
    ignores: [
      'dist/**',
      '.astro/**',
      'coverage/**',
      'node_modules/**',
      'public/**',
    ],
  },

  // 2. TypeScript: parser + reglas, limitados a nuestro código.
  {
    ...tsConfigs[0],
    files: ARCHIVOS_NUESTROS,
  },
  {
    ...tsConfigs[1],
    files: ARCHIVOS_NUESTROS,
    rules: {
      ...tsConfigs[1]!.rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // 3. JavaScript.
  {
    files: ARCHIVOS_NUESTROS,
    plugins: { js },
    extends: ['js/recommended'],
    rules: {
      // La versión de TypeScript es más precisa con los tipos: no marca
      // como "no usados" los parámetros que solo aparecen en la firma.
      'no-unused-vars': 'off',
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  // 4. Archivos .astro — al final, para que su parser tenga prioridad.
  ...astro.configs['flat/recommended'],
]);