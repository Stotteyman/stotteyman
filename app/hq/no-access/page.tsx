import type { Metadata } from 'next';
import { headers } from 'next/headers';

import { hqBaseFromHost } from '@/lib/hq/paths';

import NoAccessClient from './NoAccessClient';

export const metadata: Metadata = {
  title: 'No access',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NoAccessPage() {
  const hqBase = hqBaseFromHost((await headers()).get('host'));

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <NoAccessClient hqBase={hqBase} />
    </main>
  );
}
