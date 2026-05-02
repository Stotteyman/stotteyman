import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gray-500">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-gray-400">The page you requested does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-200 transition-colors hover:border-white/40 hover:text-white"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
