import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stotteyman',
  description:
    'Stotteyman — Live streaming on Kick, content on YouTube, community on Discord. The official hub for everything Stotteyman.',
  keywords: [
    'Stotteyman',
    'Kick livestream',
    'YouTube',
    'Discord',
    'Facebook',
    'content creator',
    'streaming',
    'Gary Lee McCullouch Jr',
  ],
  openGraph: {
    title: 'Stotteyman',
    description:
      'The official Stotteyman hub — streaming, content, and community.',
  },
};

function KickIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M4 2h4v8l5.5-8H19L13 11l6 11h-5.5L9 14v8H4z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.15.115 18.16.117 18.17a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function GatorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      {/* Body — side profile: snout left, rounded head right */}
      <path d="M1 10Q2 8 4 8L18 8Q22 8 23 12Q22 16 18 16L4 16Q2 16 1 14Z"/>
      {/* Eye ridge on top of head */}
      <ellipse cx="19.5" cy="7" rx="2.5" ry="1.8"/>
      {/* Nostril near snout tip */}
      <circle cx="2.5" cy="11" r="0.75" opacity="0.28"/>
      {/* Teeth bumps along upper jaw */}
      <path d="M6 8L5.3 5.5H6.7zM9 8L8.3 5.5H9.7zM12 8L11.3 5.5H12.7zM15 8L14.3 5.5H15.7z"/>
    </svg>
  );
}

function DonateIcon({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center font-mono font-black tracking-tighter ${className ?? ''}`} aria-hidden="true" style={{ lineHeight: 1 }}>$$</span>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const socialLinks = [
  {
    label: 'Livestream',
    sublabel: 'kick.com/stotteyman',
    href: '/stream',
    external: false,
    color: '#53FC18',
    delay: '0.25s',
    Icon: KickIcon,
  },
  {
    label: 'YouTube',
    sublabel: '@stotteyman',
    href: 'https://www.youtube.com/@stotteyman',
    external: true,
    color: '#FF0000',
    delay: '0.35s',
    Icon: YouTubeIcon,
  },
  {
    label: 'Facebook',
    sublabel: 'stotteyman',
    href: 'https://www.facebook.com/profile.php?id=100089448657186',
    external: true,
    color: '#1877F2',
    delay: '0.45s',
    Icon: FacebookIcon,
  },
  {
    label: 'Instagram',
    sublabel: '@stotteyman',
    href: 'https://www.instagram.com/stotteyman/',
    external: true,
    color: '#E1306C',
    delay: '0.55s',
    Icon: InstagramIcon,
  },
  {
    label: 'Discord',
    sublabel: 'Join the server',
    href: 'https://discord.gg/9zbyfPyp3E',
    external: true,
    color: '#5865F2',
    delay: '0.65s',
    Icon: DiscordIcon,
  },
  {
    label: 'Donate',
    sublabel: 'Support the work',
    href: '/donate',
    external: false,
    color: '#FFD700',
    delay: '0.75s',
    Icon: DonateIcon,
  },
  {
    label: 'Email',
    sublabel: 'contact@stotteyman.com',
    href: 'mailto:contact@stotteyman.com',
    external: false,
    color: '#ff8c00',
    delay: '0.85s',
    Icon: MailIcon,
  },
  {
    label: 'EBZ',
    sublabel: '#FreeEBZ',
    href: '/ebz',
    external: false,
    color: '#53FC18',
    delay: '0.95s',
    Icon: GatorIcon,
  },
] as const;

export default function HomePage() {
  return (
    <main className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-black">
      {/* Animated background gradients */}
      <div
        className="pointer-events-none absolute inset-0 animate-bg-drift"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,140,0,0.14), transparent), radial-gradient(ellipse 60% 40% at 85% 110%, rgba(83,252,24,0.07), transparent), radial-gradient(ellipse 60% 40% at 15% 110%, rgba(88,101,242,0.07), transparent)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-[0.04]" />

      {/* Main content */}
      <div className="relative z-10 flex w-full flex-col items-center gap-10 px-4 text-center sm:gap-14">

        {/* Title block */}
        <div className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <h1
            className="font-sans text-5xl font-black tracking-[0.18em] text-white sm:text-7xl md:text-8xl"
            style={{ textShadow: '0 0 60px rgba(255,140,0,0.25), 0 0 120px rgba(255,140,0,0.08)' }}
          >
            STOTTEYMAN
          </h1>
          <p
            className="animate-fade-up mt-3 font-mono text-[11px] uppercase tracking-[0.45em] text-gray-500 sm:text-sm"
            style={{ animationDelay: '0.15s' }}
          >
            Life is what you make it
          </p>
        </div>

        {/* Social icon cards */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-5">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.external ? { target: '_blank', rel: 'noreferrer' } : {})}
              aria-label={`${link.label} — ${link.sublabel}`}
              className="social-card animate-fade-up group flex flex-col items-center gap-2.5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
              style={
                {
                  '--card-color': link.color,
                  animationDelay: link.delay,
                  width: 'clamp(80px, 15vw, 110px)',
                } as React.CSSProperties
              }
            >
              <span className="social-icon" style={{ color: link.color } as React.CSSProperties}>
                <link.Icon className="h-7 w-7 sm:h-9 sm:w-9" />
              </span>
              <span className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-gray-400 transition-colors duration-300 group-hover:text-white sm:text-[11px]">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="animate-fade-up absolute bottom-5 font-mono text-[10px] uppercase tracking-[0.3em] text-gray-700"
        style={{ animationDelay: '0.85s' }}
      >
        stotteyman.com
      </footer>
    </main>
  );
}
