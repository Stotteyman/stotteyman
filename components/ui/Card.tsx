import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Surface + hairline + radius. No shadow, no transform.
 *
 * On a dark ground, elevation reads from the border and a background lift; coloured
 * drop shadows are what made the old build look like a 2014 gaming site.
 */

type CardProps = {
  children: ReactNode;
  /** Makes the whole card a link and enables the hover treatment. */
  href?: string;
  external?: boolean;
  /** `md` for content cards, `sm` for dense lists. */
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
};

const PADDING = { sm: 'p-4', md: 'p-6', lg: 'p-6 md:p-8' } as const;

const BASE = 'block rounded-lg border border-line bg-surface';
const INTERACTIVE =
  'transition-colors duration-base ease-out hover:border-line-strong hover:bg-surface-hover';

export default function Card({
  children,
  href,
  external,
  padding = 'md',
  className = '',
}: CardProps) {
  const classes = `${BASE} ${PADDING[padding]} ${href ? INTERACTIVE : ''} ${className}`.trim();

  if (!href) return <div className={classes}>{children}</div>;

  if (external || /^https?:/.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
