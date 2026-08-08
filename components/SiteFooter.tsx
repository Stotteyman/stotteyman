import Link from 'next/link';

import { footerNav, siteConfig } from '@/lib/site-content';
import { Container } from '@/components/ui/Section';

/**
 * The site footer.
 *
 * The old one rendered two bare lines — "Stotteyman" and "Based online, building in
 * public" — and nothing else, which meant the creator surfaces (stream, follow,
 * events, donate) had no home once they left the primary nav. They live here now,
 * alongside the legal identity of the group.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link
              href="/"
              className="font-mono text-label uppercase text-fg transition-colors duration-fast hover:text-accent"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-4 max-w-xs text-body-sm text-fg-muted">{siteConfig.description}</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-5 inline-block text-body-sm text-fg-subtle underline underline-offset-4 transition-colors duration-fast hover:text-fg"
            >
              {siteConfig.email}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {footerNav.map((group) => (
              <nav key={group.heading} aria-label={group.heading}>
                <h2 className="font-mono text-label uppercase text-fg-subtle">{group.heading}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-body-sm text-fg-muted transition-colors duration-fast hover:text-fg"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t border-line py-6 text-body-sm text-fg-subtle md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <p className="font-mono text-label uppercase">
            Built and operated in-house
          </p>
        </div>
      </Container>
    </footer>
  );
}
