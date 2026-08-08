'use client';

import Script from 'next/script';

import DonateForm from './DonateForm';

function CashAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.59 3.42A2 2 0 0 0 21.6 2h-3.94l-.47-1.41A.5.5 0 0 0 16.7 0H7.3a.5.5 0 0 0-.48.59L6.34 2H2.4A2 2 0 0 0 .41 3.42L.01 5.7A2 2 0 0 0 2 8h.09l1.24 13.64A2 2 0 0 0 5.32 23.5h13.36a2 2 0 0 0 1.99-1.86L21.91 8H22a2 2 0 0 0 1.99-2.3zM12 18.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13zm1-9.5h-1V8h-1v1H9.5v2h3v1H10a1.5 1.5 0 0 0 0 3h.5v1h1v-1H14v-2h-3v-1h2.5A1.5 1.5 0 0 0 13 9z" />
    </svg>
  );
}

function CryptoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.5 9h3a1.5 1.5 0 0 1 0 3h-3zm0 3h3.5a1.5 1.5 0 0 1 0 3H9.5zm1-4V7m0 10v-1" />
    </svg>
  );
}

export default function DonatePage() {
  const cryptoDonateUrl = 'https://cwallet.com/t/GP3AKY4T';
  const cashAppUrl = 'https://cash.app/$totteyman';

  const openCashAppPopup = () => {
    const width = Math.min(420, Math.max(320, window.screen.width - 32));
    const height = Math.min(730, Math.max(520, window.screen.height - 64));
    const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
    const top = Math.max(0, Math.floor((window.screen.height - height) / 2));

    window.open(
      cashAppUrl,
      '_blank',
      `toolbar=no,menubar=no,help=no,location=no,status=no,scrollbars=yes,resizable=yes,width=${width},height=${height},left=${left},top=${top}`,
    );
  };

  return (
    <>
      <main className="relative flex min-h-dvh w-full flex-col items-center overflow-x-hidden overflow-y-auto bg-bg px-4 py-6 sm:py-10 lg:py-14">
        {/* Background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 45% at 50% -5%, rgba(255,140,0,0.12), transparent), radial-gradient(ellipse 50% 40% at 80% 110%, rgba(83,252,24,0.06), transparent)',
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-grid opacity-[0.04]" />

        <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-6 text-center sm:gap-8 lg:gap-10">

          {/* Header */}
          <div className="animate-fade-up w-full" style={{ animationDelay: '0.05s' }}>
            <a
              href="/"
              className="font-mono text-label uppercase text-fg-subtle transition-colors hover:text-accent sm:text-xs sm:tracking-[0.45em]"
            >
              ← Stotteyman
            </a>
            <h1
              className="mt-4 font-sans text-3xl font-black tracking-[0.1em] text-fg sm:mt-6 sm:text-5xl md:text-6xl"
              style={{ textShadow: '0 0 60px rgba(255,140,0,0.2)' }}
            >
              SUPPORT
            </h1>
            <p className="mt-2 font-mono text-label uppercase text-fg-subtle sm:mt-3 sm:text-sm sm:tracking-[0.4em]">
              Every contribution keeps the work moving.
            </p>
          </div>

          {/* On-stream donation: amount, message, optional song request */}
          <DonateForm />

          {/* Direct rails — no form, no alert, just send money */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">

            {/* CashApp */}
            <button
              type="button"
              onClick={openCashAppPopup}
              aria-label="Send money via Cash App to $totteyman"
              className="donate-card animate-fade-up group flex flex-col items-center justify-center gap-4 rounded-lg border border-line bg-surface] p-6 sm:p-8"
              style={
                {
                  '--card-color': '#00D632',
                  animationDelay: '0.25s',
                } as React.CSSProperties
              }
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full border border-line transition-all duration-300 group-hover:border-[#00D632]/60"
                style={{ background: 'rgba(0,214,50,0.08)' }}
              >
                <CashAppIcon className="h-7 w-7 text-[#00D632]" />
              </span>
              <div>
                <p className="font-sans text-base font-semibold tracking-wider text-fg">Cash App</p>
                <p className="mt-1 font-mono text-xs text-fg-subtle">$totteyman</p>
              </div>
              <span className="font-mono text-label uppercase text-[#00D632] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Send →
              </span>
            </button>

            {/* Crypto */}
            <div
              className="donate-card animate-fade-up group flex flex-col items-center justify-center gap-4 rounded-lg border border-line bg-surface] p-6 sm:p-8"
              style={
                {
                  '--card-color': '#F7931A',
                  animationDelay: '0.35s',
                } as React.CSSProperties
              }
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-full border border-line transition-all duration-300 group-hover:border-[#F7931A]/60"
                style={{ background: 'rgba(247,147,26,0.08)' }}
              >
                <CryptoIcon className="h-7 w-7 text-[#F7931A]" />
              </span>
              <div>
                <p className="font-sans text-base font-semibold tracking-wider text-fg">Crypto</p>
                <p className="mt-1 font-mono text-xs text-fg-subtle">BTC, ETH &amp; more</p>
              </div>

              {/* CWallet widget rendered inline */}
              <div
                className="ccwallet__tipbox__button"
                data-code="GP3AKY4T"
                data-button-type="button"
                data-button-text="Donate Crypto"
                data-button-style="white"
              />

              <a
                href={cryptoDonateUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-label uppercase text-fg-subtle transition-colors hover:text-[#F7931A] sm:tracking-[0.22em]"
              >
                Open crypto donate page
              </a>
            </div>
          </div>

          {/* Thank you note */}
          <p
            className="animate-fade-up font-mono text-sm text-fg-subtle"
            style={{ animationDelay: '0.45s' }}
          >
            Thank you. Every bit of support means the world — it keeps the content coming and the community growing.
          </p>
        </div>
      </main>

      {/* CWallet script — loaded after page is interactive */}
      <Script src="https://cwallet.com/opencc.js" strategy="afterInteractive" />
    </>
  );
}
