import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Flat config.
 *
 * `pnpm lint` was broken: Next 16 removed the `next lint` command, and ESLint 9 reads
 * flat config while the repo still carried `.eslintrc.json`. The script failed on every
 * invocation, which left `pnpm type-check` as the only real gate.
 *
 * `eslint-config-next@16` already exports a flat-config array, so it is imported
 * directly. Deliberately NOT via `FlatCompat`: that path pulls in `@eslint/eslintrc`,
 * which does `import minimatch from 'minimatch'` and therefore crashes against the
 * `minimatch: ^9` pnpm override this repo pins for security. Going direct keeps the
 * override in place.
 */
export default [
  {
    // `.netlify/**` matters as much as `.next/**`: the Netlify Next runtime writes its
    // bundled edge handlers and vendored Deno std library in there, which accounted for
    // ~9,800 of the 9,915 problems on the first run and buried every real one.
    ignores: [
      '.next/**',
      '.netlify/**',
      'out/**',
      'node_modules/**',
      'next-env.d.ts',
      '.shot.mjs',
      '.lintsum.mjs',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // Underscore-prefixed names are deliberate here — several components destructure
      // props out of an object purely to keep them out of a rest spread.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
    },
  },
];
