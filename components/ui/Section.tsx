import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Section rhythm and the eyebrow/link header pattern. See BRAND.md §5/§6.
 *
 * The hairline between sections is this brand's layout device — not a box around
 * everything. `divide` defaults on, so consecutive sections separate themselves.
 */

type SectionProps = {
  children: ReactNode;
  /** Hairline along the bottom edge. Turn off for the last section on a page. */
  divide?: boolean;
  /** `lg` for hero and closing sections, `md` for everything between. */
  size?: 'sm' | 'md' | 'lg';
  id?: string;
  className?: string;
};

const SIZE = {
  sm: 'py-10 md:py-12',
  md: 'py-16 md:py-20',
  lg: 'py-16 md:py-24',
} as const;

export default function Section({
  children,
  divide = true,
  size = 'md',
  id,
  className = '',
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${SIZE[size]} ${divide ? 'border-b border-line' : ''} ${className}`.trim()}
    >
      {children}
    </section>
  );
}

type SectionHeaderProps = {
  /** Mono uppercase eyebrow — the section's name. */
  eyebrow: string;
  /** Optional right-aligned link, e.g. "All projects". */
  action?: { href: string; label: string };
  className?: string;
};

export function SectionHeader({ eyebrow, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${className}`.trim()}>
      <h2 className="font-mono text-label uppercase text-fg-subtle">{eyebrow}</h2>
      {action ? (
        <Link
          href={action.href}
          className="text-body-sm text-fg-subtle underline underline-offset-4 transition-colors duration-fast hover:text-fg"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

/** The one container width. HQ uses it too, so both halves feel like one product. */
export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 lg:px-10 ${className}`.trim()}>{children}</div>
  );
}
