import type { ReactElement } from 'react';

/**
 * Shared Open Graph card layout.
 *
 * One definition so the site card and every post card stay identical — Satori (which
 * backs next/og) supports only a subset of CSS and no Tailwind, so these styles are
 * intentionally inline and duplicated from the token values rather than imported.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

const BG = '#0A0B0D';
const FG = '#F4F5F7';
const SUBTLE = '#7C828C';
const ACCENT = '#FF7A1A';

export function ogCard({
  eyebrow,
  headline,
  footerLeft,
  footerRight,
}: {
  eyebrow: string;
  headline: string;
  footerLeft: string;
  footerRight?: string;
}): ReactElement {
  // Long titles have to shrink or Satori will overflow the canvas rather than wrap
  // indefinitely — there is no scrollbar to save it.
  const fontSize = headline.length > 110 ? 48 : headline.length > 70 ? 58 : 68;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BG,
        padding: '72px 80px',
        backgroundImage:
          'linear-gradient(rgba(244,245,247,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(244,245,247,0.045) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }}
    >
      <div
        style={{
          display: 'flex',
          fontSize: 22,
          letterSpacing: '0.22em',
          color: ACCENT,
          textTransform: 'uppercase',
        }}
      >
        {eyebrow}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize,
            lineHeight: 1.08,
            color: FG,
            letterSpacing: '-0.03em',
            maxWidth: 940,
          }}
        >
          {headline}
        </div>
        <div style={{ display: 'flex', width: 96, height: 4, background: ACCENT, marginTop: 40 }} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          fontSize: 24,
          color: SUBTLE,
        }}
      >
        <div style={{ display: 'flex' }}>{footerLeft}</div>
        {footerRight ? <div style={{ display: 'flex' }}>{footerRight}</div> : null}
      </div>
    </div>
  );
}
