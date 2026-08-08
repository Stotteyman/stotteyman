import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6 text-fg">
      <div className="text-center">
        <p className="font-mono text-label uppercase text-fg-subtle">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-fg-subtle">The page you requested does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-line-strong px-4 py-2 text-label uppercase text-fg transition-colors hover:border-line-strong hover:text-fg"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
