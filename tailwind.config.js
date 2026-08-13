/**
 * Tailwind is the delivery mechanism for the tokens in app/globals.css, not a second
 * source of truth. Colours resolve to `var(--token)` so a change there propagates
 * everywhere instead of needing a find-and-replace across 24 pages.
 *
 * See Build Notes/stotteyman-hub/BRAND.md.
 *
 * @type {import('tailwindcss').Config}
 */

/** Channel-triplet token -> a colour that still accepts Tailwind's `/opacity`. */
const ch = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: ch('bg'),
        'bg-raised': ch('bg-raised'),

        // Composite surfaces: already carry their own alpha, so no modifier.
        surface: 'var(--surface)',
        'surface-hover': 'var(--surface-hover)',
        line: 'var(--border)',
        'line-strong': 'var(--border-strong)',

        fg: ch('fg'),
        'fg-muted': ch('fg-muted'),
        'fg-subtle': ch('fg-subtle'),
        'fg-faint': ch('fg-faint'),

        accent: {
          DEFAULT: ch('accent'),
          hover: ch('accent-hover'),
          ink: ch('accent-ink'),
          soft: 'var(--accent-soft)',
          line: 'var(--accent-line)',
        },

        ok: ch('ok'),
        warn: ch('warn'),
        danger: ch('danger'),
        info: ch('info'),

        /**
         * DEPRECATED — transitional aliases only.
         *
         * Six pages still reference `neon-cyan` / `neon-green` / `neon-pink` and two
         * reference `card-neon`. Mapping them onto real tokens keeps the build green
         * and already improves how those pages look, while each page is migrated in
         * Phase 3. Delete this block once `grep -r "neon-" app/` is empty.
         */
        neon: {
          orange: ch('accent'),
          cyan: ch('info'),
          green: ch('ok'),
          pink: ch('danger'),
        },
      },

      fontFamily: {
        sans: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      /**
       * Fluid scale. Each entry is [size, { lineHeight, letterSpacing }] and clamps
       * between the mobile and desktop ends, so there is no breakpoint step.
       */
      fontSize: {
        // Editorial scale. Only ever one per page — it is the page's headline, and a
        // second one turns the hierarchy back into a flat wall of large text.
        'display-2xl': ['clamp(3.25rem, 10vw, 7.5rem)', { lineHeight: '0.94', letterSpacing: '-0.045em' }],
        'display-xl': ['clamp(2.75rem, 6.5vw, 4.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.25rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(1.75rem, 3vw, 2.25rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        title: ['1.375rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.65' }],
        body: ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        label: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },

      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
      },

      transitionTimingFunction: {
        out: 'var(--ease-out)',
      },

      transitionDuration: {
        fast: 'var(--t-fast)',
        base: 'var(--t-base)',
        slow: 'var(--t-slow)',
      },

      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
