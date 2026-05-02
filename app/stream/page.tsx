import Link from 'next/link';

export const metadata = {
  title: 'Livestream',
  description: 'Watch the Stotteyman Kick livestream and chat live.',
};

const kickChannel = 'stotteyman';
const kickUrl = 'https://kick.com/stotteyman';
const kickLoginUrl = 'https://kick.com/login';
const kickChatPopout = `https://kick.com/popout/${kickChannel}/chat`;
const discordInvite = 'https://discord.gg/9zbyfPyp3E';

export default function StreamPage() {
  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-black text-white">

      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-[0.35em] text-gray-500 transition-colors hover:text-neon-orange"
          >
            ← Home
          </Link>
          <span className="hidden h-3 w-px bg-white/10 sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#53FC18] shadow-[0_0_8px_#53FC18]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#53FC18]">Live on Kick</span>
          </div>
        </div>

        <p className="font-sans text-sm font-bold tracking-[0.2em] text-white">STOTTEYMAN</p>

        <div className="flex items-center gap-2">
          <a
            href={kickLoginUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#53FC18]/60 hover:text-[#53FC18]"
          >
            Login
          </a>
          <a
            href={kickUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-[#53FC18]/40 bg-[#53FC18]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#53FC18] transition-all hover:bg-[#53FC18]/20"
          >
            kick.com
          </a>
          <a
            href={discordInvite}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300 transition-all hover:border-[#5865F2]/60 hover:text-[#5865F2]"
          >
            Discord
          </a>
        </div>
      </header>

      {/* Stream + Chat */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">

        {/* Video player — fills all available space */}
        <div className="relative min-h-0 flex-1 bg-black">
          <iframe
            src={`https://player.kick.com/${kickChannel}`}
            title="Stotteyman Kick livestream"
            allowFullScreen
            allow="autoplay; fullscreen"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>

        {/* Chat sidebar */}
        <div className="flex h-[40vh] shrink-0 flex-col border-t border-white/10 lg:h-full lg:w-80 lg:border-l lg:border-t-0 xl:w-96">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#050505] px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400">Live Chat</span>
            <a
              href={kickChatPopout}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600 transition-colors hover:text-neon-orange"
            >
              Pop out ↗
            </a>
          </div>
          <div className="min-h-0 flex-1 bg-black">
            <iframe
              src={kickChatPopout}
              title="Kick live chat"
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

