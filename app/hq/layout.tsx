import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: { default: 'HQ', template: '%s · HQ' },
  robots: { index: false, follow: false, nocache: true },
};

export default function HqLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#07070a]">{children}</div>;
}
