import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';

/**
 * The one button. See BRAND.md §6.
 *
 * Renders an <a>, a next/link <Link>, or a <button> depending on `href` — so a page
 * never has to hand-roll a link that only *looks* like a button and loses the states.
 *
 * Hover changes colour, never size. The old primary CTA carried
 * `hover:scale-[1.02]`, which made the button move out from under the cursor.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap ' +
  'transition-colors duration-fast ease-out ' +
  'disabled:pointer-events-none disabled:opacity-45';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-hover',
  secondary:
    'border border-line bg-surface text-fg hover:border-line-strong hover:bg-surface-hover',
  ghost: 'text-fg-muted hover:text-fg',
  danger: 'border border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/60',
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-body-sm',
  md: 'h-10 px-4 text-body-sm',
  lg: 'h-12 px-6 text-body',
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

type AnchorProps = CommonProps & {
  href: string;
  /** Set for links leaving the site — adds target and rel. */
  external?: boolean;
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className' | 'children'>;

type NativeProps = CommonProps & {
  href?: undefined;
} & Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'>;

export type ButtonProps = AnchorProps | NativeProps;

export default function Button(props: ButtonProps) {
  const { variant = 'secondary', size = 'md', className = '', children } = props;
  const classes = `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${className}`.trim();

  if (props.href !== undefined) {
    const { href, external, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props;

    // mailto:, tel: and off-site URLs must not go through the client router.
    const isPlainAnchor = external || /^(https?:|mailto:|tel:)/.test(href);

    if (isPlainAnchor) {
      return (
        <a
          href={href}
          className={classes}
          {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
          {...rest}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } = props;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
