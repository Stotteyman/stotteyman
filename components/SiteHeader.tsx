'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { primaryCta, primaryNav, siteConfig } from '@/lib/site-content';
import Button from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';

/**
 * The site header.
 *
 * Replaces two competing chromes: the homepage rendered its own inline header and
 * SiteShell rendered a different one, with different nav, different tracking and a
 * different wordmark treatment. Neither had a mobile menu — twelve nav pills simply
 * wrapped into a four-row block on a phone.
 */

/** `trailingSlash: true` means pathname arrives as `/work/`, so compare bare. */
const bare = (p: string) => (p !== '/' && p.endsWith('/') ? p.slice(0, -1) : p);

function isActive(pathname: string, href: string) {
  const a = bare(pathname);
  const b = bare(href);
  return a === b || a.startsWith(`${b}/`);
}

export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const [open, setOpen] = useState(false);

  /**
   * Closing happens on the click, not in an effect keyed to `pathname`.
   *
   * Setting state from an effect body triggers a second render pass on every
   * navigation for a value that is already known at the moment of the tap — and
   * without it, tapping a link leaves the next page loaded behind an open overlay.
   */
  const close = () => setOpen(false);

  // A fixed-position panel over a scrollable body scrolls the page underneath it.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="font-mono text-label uppercase text-fg transition-colors duration-fast hover:text-accent"
          >
            {siteConfig.name}
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {primaryNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-md px-3 py-2 text-body-sm transition-colors duration-fast ${
                    active ? 'text-fg' : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <Button href={primaryCta.href} variant="primary" size="sm">
              {primaryCta.label}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-fg-muted transition-colors duration-fast hover:text-fg md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              {open ? (
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {open ? (
        <div id="mobile-nav" className="border-t border-line bg-bg md:hidden">
          <Container>
            <nav aria-label="Primary" className="flex flex-col py-4">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                  className={`border-b border-line py-3.5 text-body ${
                    isActive(pathname, item.href) ? 'text-fg' : 'text-fg-muted'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Button
                href={primaryCta.href}
                variant="primary"
                size="lg"
                className="mt-5 w-full"
                onClick={close}
              >
                {primaryCta.label}
              </Button>
            </nav>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
