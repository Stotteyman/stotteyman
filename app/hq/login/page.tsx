import type { Metadata } from 'next';

import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'HQ sign in',
  robots: { index: false, follow: false },
};

export default async function HqLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  // Only accept same-site relative paths — an open redirect here would hand an
  // attacker a login flow that lands on their domain with our branding.
  const raw = params.next ?? '/';
  const next = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/';

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-24">
      <LoginClient next={next} />
    </main>
  );
}
