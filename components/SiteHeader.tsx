'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { menuNav, primaryCta, siteConfig, type MenuItem } from '@/lib/site-content';
import Button from '@/components/ui/Button';
import { Container } from '@/components/ui/Section';

/**
 * The site header.
 *
 * Now a menu system rather than a flat row of five links. Eleven public pages exist;
 * six of them were reachable only from the footer, which is where information goes to
 * be lost. Each top-level entry that has children opens a panel describing them, so a
 * visitor can see the shape of the site without navigating into it first.
 *
 * The panel is one shared full-width row under the bar rather than a floating box per
 * item: the panels have very different heights, and anchored boxes made the header
 * jump around as the pointer crossed between them.
 */

/** `trailingSlash: true` means pathname arrives as `/work/`, so compare bare. */
const bare = (p: string) => (p !== '/' && p.endsWith('/') ? p.slice(0, -1) : p);

function isActive(pathname: string, href: string) {
  const a = bare(pathname);
  const b = bare(href);
  return a === b || a.startsWith(`${b}/`);
}

function hasPanel(item: MenuItem): item is Extract<MenuItem, { items: readonly unknown[] }> {
  return Array.isArray(item.items) && item.items.length > 0;
}

export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  /**
   * Hover has to be debounced in both directions. Opening instantly makes the panel
   * flicker as the pointer travels along the bar toward the CTA; closing instantly
   * makes it impossible to reach the panel's own links, because the gap between the
   * label and the panel counts as a leave.
   */
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (enterTimer.current) clearTimeout(enterTimer.current);
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    enterTimer.current = null;
    leaveTimer.current = null;
  }, []);

  const scheduleOpen = useCallback(
    (label: string | null) => {
      clearTimers();
      enterTimer.current = setTimeout(() => setOpenMenu(label), 70);
    },
    [clearTimers]
  );

  const scheduleClose = useCallback(() => {
    clearTimers();
    leaveTimer.current = setTimeout(() => setOpenMenu(null), 160);
  }, [clearTimers]);

  useEffect(() => clearTimers, [clearTimers]);

  const closeAll = useCallback(() => {
    clearTimers();
    setOpenMenu(null);
    setMobileOpen(false);
  }, [clearTimers]);

  // A fixed-position panel over a scrollable body scrolls the page underneath it.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpenMenu(null);
      setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const active = menuNav.find((m) => m.label === openMenu);

  return (
    <header
      className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md"
      onPointerLeave={scheduleClose}
    >
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            onClick={closeAll}
            className="font-mono text-label uppercase text-fg transition-colors duration-fast hover:text-accent"
          >
            {siteConfig.name}
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
            {menuNav.map((item) => {
              const on = isActive(pathname, item.href);
              const open = openMenu === item.label;

              if (!hasPanel(item)) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onPointerEnter={() => scheduleOpen(null)}
                    aria-current={on ? 'page' : undefined}
                    className={`rounded-md px-3 py-2 text-body-sm transition-colors duration-fast ${
                      on ? 'text-fg' : 'text-fg-muted hover:text-fg'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  type="button"
                  aria-expanded={open}
                  aria-controls="site-menu-panel"
                  onPointerEnter={() => scheduleOpen(item.label)}
                  onFocus={() => setOpenMenu(item.label)}
                  onClick={() => setOpenMenu(open ? null : item.label)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-2 text-body-sm transition-colors duration-fast ${
                    on || open ? 'text-fg' : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  {item.label}
                  <svg
                    viewBox="0 0 12 12"
                    aria-hidden
                    className={`h-2.5 w-2.5 transition-transform duration-fast ${
                      open ? 'rotate-180 text-accent' : 'text-fg-faint'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="m2.5 4.5 3.5 3.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
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
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md text-fg-muted transition-colors duration-fast hover:text-fg md:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* ── Desktop panel ─────────────────────────────────────────────────────── */}
      {active && hasPanel(active) ? (
        <div
          id="site-menu-panel"
          onPointerEnter={clearTimers}
          className="absolute inset-x-0 top-full hidden border-b border-line bg-bg-raised/95 shadow-[0_24px_48px_-24px_rgb(0_0_0/0.9)] backdrop-blur-xl md:block"
        >
          <Container>
            <div className="grid gap-8 py-7 lg:grid-cols-[1.6fr_1fr]">
              <ul className="grid gap-1 sm:grid-cols-2">
                {active.items.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeAll}
                      className="group flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors duration-fast hover:bg-surface"
                    >
                      <span className="flex items-center gap-2 text-body-sm font-medium text-fg">
                        {link.label}
                        {link.wizard ? (
                          <span className="rounded border border-accent-line bg-accent-soft px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                            Guided
                          </span>
                        ) : null}
                      </span>
                      {link.hint ? (
                        <span className="text-body-sm text-fg-subtle">{link.hint}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>

              {active.feature ? (
                <Link
                  href={active.feature.href}
                  onClick={closeAll}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-xl border border-accent-line bg-accent-soft p-5 transition-colors duration-fast hover:bg-accent/15"
                >
                  <span className="font-mono text-label uppercase text-accent">Guided flow</span>
                  <span className="mt-2 text-title font-medium text-fg">{active.feature.label}</span>
                  <span className="mt-1.5 text-body-sm text-fg-muted">{active.feature.hint}</span>
                </Link>
              ) : null}
            </div>
          </Container>
        </div>
      ) : null}

      {/* ── Mobile panel ──────────────────────────────────────────────────────── */}
      {mobileOpen ? (
        <div
          id="mobile-nav"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-bg md:hidden"
        >
          <Container>
            <nav aria-label="Primary" className="flex flex-col py-3">
              {menuNav.map((item) => {
                if (!hasPanel(item)) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeAll}
                      aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                      className={`border-b border-line py-3.5 text-body ${
                        isActive(pathname, item.href) ? 'text-fg' : 'text-fg-muted'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                const open = expanded === item.label;
                return (
                  <div key={item.label} className="border-b border-line">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setExpanded(open ? null : item.label)}
                      className="flex w-full items-center justify-between py-3.5 text-left text-body text-fg"
                    >
                      {item.label}
                      <svg
                        viewBox="0 0 12 12"
                        aria-hidden
                        className={`h-3 w-3 transition-transform duration-fast ${
                          open ? 'rotate-180 text-accent' : 'text-fg-faint'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    {open ? (
                      <ul className="pb-2">
                        {item.items.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              onClick={closeAll}
                              className="flex items-center gap-2 py-2.5 pl-3 text-body-sm text-fg-muted"
                            >
                              {link.label}
                              {link.wizard ? (
                                <span className="rounded border border-accent-line px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.14em] text-accent">
                                  Guided
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}

              <Button
                href={primaryCta.href}
                variant="primary"
                size="lg"
                className="my-5 w-full"
                onClick={closeAll}
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
