import type { Metadata } from 'next';

import NoAccessClient from './NoAccessClient';

export const metadata: Metadata = {
  title: 'No access',
  robots: { index: false, follow: false },
};

export default function NoAccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <NoAccessClient />
    </main>
  );
}
