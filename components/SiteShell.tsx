import Link from 'next/link';
import { navigationItems, siteConfig } from '@/lib/site-content';

interface SiteShellProps {
  title: string;
  eyebrow?: string;
  intro: string;
  children: React.ReactNode;
}

export default function SiteShell({ title, eyebrow, intro, children }: SiteShellProps) {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,140,0,0.18),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(0,255,255,0.12),_transparent_32%),linear-gradient(180deg,_#090909_0%,_#030303_100%)]" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />
        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 lg:px-12 lg:py-10">
          <header className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Link href="/" className="text-sm uppercase tracking-[0.45em] text-neon-orange/80">
                {siteConfig.name}
              </Link>
              {eyebrow ? <p className="mt-6 text-sm uppercase tracking-[0.35em] text-neon-cyan/80">{eyebrow}</p> : null}
              <h1 className="mt-4 text-4xl font-light tracking-tight text-white md:text-6xl">{title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-gray-300 md:text-lg">{intro}</p>
            </div>

            <nav aria-label="Primary" className="flex max-w-2xl flex-wrap gap-3 lg:justify-end">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-gray-200 transition-all duration-300 hover:border-neon-orange/60 hover:bg-neon-orange/10 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>

          <section className="flex-1 py-10">{children}</section>

          <footer className="border-t border-white/10 pt-6 text-sm text-gray-500">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <p>{siteConfig.person}.</p>
              <p>{siteConfig.location}.</p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}