import type { ReactNode } from 'react';

import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import { Container } from '@/components/ui/Section';

/**
 * Standard page frame for every public page below the homepage.
 *
 * The `title` / `eyebrow` / `intro` API is unchanged, so the eleven pages that already
 * use it needed no edits — what changed is everything underneath: the header and footer
 * are now the shared components rather than a second, divergent chrome, and the page
 * title block is a normal masthead instead of a full-height hero with the nav wedged
 * into its right-hand side.
 */

type SiteShellProps = {
  title: string;
  eyebrow?: string;
  intro?: string;
  children: ReactNode;
  /** Optional right-hand slot in the masthead, e.g. a primary action. */
  action?: ReactNode;
};

export default function SiteShell({ title, eyebrow, intro, children, action }: SiteShellProps) {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:text-accent-ink"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="content" className="relative">
        {/* Hairline grid, hero only. Fixed so it does not scroll as a second layer. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-grid-hairline [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />

        <Container>
          <header className="relative border-b border-line py-14 md:py-20">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                {eyebrow ? (
                  <p className="font-mono text-label uppercase text-accent">{eyebrow}</p>
                ) : null}
                <h1 className="mt-5 text-display-lg font-medium text-fg">{title}</h1>
                {intro ? (
                  <p className="mt-5 max-w-prose text-body-lg text-fg-muted">{intro}</p>
                ) : null}
              </div>
              {action ? <div className="shrink-0">{action}</div> : null}
            </div>
          </header>

          <div className="py-14 md:py-16">{children}</div>
        </Container>
      </main>

      <SiteFooter />
    </>
  );
}
