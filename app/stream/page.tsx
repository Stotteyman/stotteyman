import Link from 'next/link';
import { socialLinks } from '@/lib/site-content';

export const metadata = {
  title: 'Livestream',
  description: 'Watch the Kick livestream, chat, and learn how to support the stream.',
};

const kickChannel = 'stotteyman';
const kickUrl = 'https://kick.com/stotteyman';
const kickLoginUrl = 'https://kick.com/login';
const kickChatPopout = 'https://kick.com/popout/stotteyman/chat';
const discordInvite = 'https://discord.gg/9zbyfPyp3E';

export default function StreamPage() {
  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#140f05] via-[#080808]/90 to-transparent pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-6 py-10 lg:px-12 lg:py-14">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">Kick livestream</p>
              <h1 className="mt-4 text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-tight">
                Watch the stream live on Kick.
              </h1>
              <p className="mt-6 text-gray-400 text-base md:text-lg leading-8 max-w-2xl">
                This page is dedicated to live streaming, community support, and what to expect when you join the channel. Login to Kick to chat, follow, subscribe, and gift Kicks in real time.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={kickUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-neon"
                >
                  Visit Kick Stream
                </a>
                <a
                  href={kickLoginUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-neon"
                >
                  Login to Kick
                </a>
                <a
                  href={discordInvite}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-neon"
                >
                  Join Discord
                </a>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium uppercase tracking-[0.2em] text-white transition-all duration-300 hover:border-neon-orange hover:bg-neon-orange/10 hover:text-neon-orange"
            >
              Home
            </Link>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 pb-16 lg:px-12">
        <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-[#040404] shadow-[0_0_80px_rgba(255,140,0,0.12)] overflow-hidden">
              <div className="bg-[#050505] border-b border-white/10 px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-neon-cyan/80">Live now</p>
                  <p className="mt-1 text-sm text-gray-400">kick.com/{kickChannel}</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-neon-orange">
                  <span className="h-2 w-2 rounded-full bg-neon-orange shadow-[0_0_12px_rgba(255,140,0,0.8)]" />
                  Live on Kick
                </div>
              </div>
              <div className="aspect-[16/9] bg-black">
                <iframe
                  src={`https://kick.com/embed/channel/${kickChannel}`}
                  title="Kick livestream"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="card-neon p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-neon-green/80">What to expect</p>
                <h2 className="mt-3 text-2xl font-light text-white">High energy creative streams</h2>
                <p className="mt-3 text-gray-400 text-sm leading-6">
                  Join for live gameplay, creative tech breakdowns, Q&amp;A, community moments, and special subscriber events. Expect a neon-lit broadcast with real audience interaction.
                </p>
              </div>
              <div className="card-neon p-6">
                <p className="text-sm uppercase tracking-[0.35em] text-neon-pink/80">Support the stream</p>
                <h2 className="mt-3 text-2xl font-light text-white">Follow, sub, gift, and cheer</h2>
                <p className="mt-3 text-gray-400 text-sm leading-6">
                  The best way to support is to follow the channel and engage in chat. Subscribers get priority access, badges, and special on-stream recognition.
                </p>
              </div>
            </div>

            <div className="card-neon p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">Why livestream here</p>
              <ul className="mt-4 space-y-3 text-gray-400 text-sm leading-6 list-disc list-inside">
                <li>Real-time community chat and interaction.</li>
                <li>Live support through follows, subs, and gifted Kicks.</li>
                <li>Stream highlights, collabs, and subscriber-only perks.</li>
                <li>Easy access to the Kick channel and chat from one page.</li>
              </ul>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-[#040404] shadow-[0_0_60px_rgba(0,255,255,0.08)] overflow-hidden">
              <div className="bg-[#050505] border-b border-white/10 px-6 py-5">
                <p className="text-sm uppercase tracking-[0.35em] text-neon-green/80">Live Chat</p>
              </div>
              <div className="min-h-[520px] bg-black">
                <iframe
                  src={kickChatPopout}
                  title="Kick popout chat"
                  className="h-full w-full border-0"
                />
              </div>
            </div>

            <div className="card-neon p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-neon-orange/80">Kick access</p>
              <h2 className="mt-3 text-2xl font-light text-white">Login to interact</h2>
              <p className="mt-3 text-gray-400 text-sm leading-6">
                You need a Kick account to chat, follow, subscribe, and send Kicks. Use the button below to sign in and connect with the stream instantly.
              </p>
              <a
                href={kickLoginUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-neon-orange hover:bg-neon-orange/10 hover:text-neon-orange"
              >
                Login to Kick
              </a>
            </div>

            <div className="card-neon p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-neon-cyan/80">Community</p>
              <h2 className="mt-3 text-2xl font-light text-white">Stay connected outside stream</h2>
              <p className="mt-3 text-gray-400 text-sm leading-6">
                Join Discord for stream alerts, behind-the-scenes updates, and community chat between broadcasts.
              </p>
              <a
                href={discordInvite}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium uppercase tracking-[0.25em] text-white transition-all duration-300 hover:border-neon-pink hover:bg-neon-pink/10 hover:text-neon-pink"
              >
                Join Discord
              </a>
            </div>

            <div className="card-neon p-6">
              <p className="text-sm uppercase tracking-[0.35em] text-neon-green/80">More ways to follow</p>
              <div className="mt-5 space-y-3">
                {socialLinks.slice(2).map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-gray-300 transition-all duration-300 hover:border-neon-cyan/60 hover:text-white"
                  >
                    <span>{link.platform}</span>
                    <span className="text-gray-500">Open</span>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
