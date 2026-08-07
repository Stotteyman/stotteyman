import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './overlay.css';

export const metadata: Metadata = {
  title: 'Overlay',
  // Overlay URLs carry a shared key. Keeping them out of the index is not the
  // access control — the key is — but an indexed overlay URL is a leaked key.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Wrapper for every browser-source page.
 *
 * The class on <html> is what the stylesheet hooks to force a transparent
 * background; the site's root layout paints the body black, which would otherwise
 * cover the video with a solid rectangle.
 */
export default function OverlayLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('overlay-root');`,
        }}
      />
      {children}
    </>
  );
}
