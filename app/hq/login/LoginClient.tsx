'use client';

import { useCallback, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * OAuth only, by design. There is no email/password form and no "create account" link
 * anywhere in this app — accounts exist only by invite, and the invite is what
 * provisions membership when the OAuth account is first created.
 */
export default function LoginClient({
  next,
  hqBase,
  initialError = '',
}: {
  next: string;
  /** '' on hq.stotteyman.com, '/hq' on previews and localhost. */
  hqBase: string;
  initialError?: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState(initialError);

  const signIn = useCallback(
    async (provider: 'google' | 'discord') => {
      setBusy(provider);
      setError('');
      try {
        const supabase = createSupabaseBrowserClient();
        // Must carry the host's HQ prefix: on localhost `/auth/callback` is the
        // PUBLIC callback page, which never exchanges the code.
        const redirectTo = `${window.location.origin}${hqBase}/auth/callback?next=${encodeURIComponent(next)}`;
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
        if (error) {
          setError(error.message);
          setBusy(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sign-in failed.');
        setBusy(null);
      }
    },
    [next, hqBase]
  );

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Stotteyman</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">HQ sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          This area is invite-only. Sign in with the account your invite was sent to.
        </p>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            onClick={() => signIn('google')}
            disabled={busy !== null}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-white/40 hover:bg-white/15 disabled:opacity-50"
          >
            {busy === 'google' ? 'Redirecting…' : 'Continue with Google'}
          </button>
          <button
            type="button"
            onClick={() => signIn('discord')}
            disabled={busy !== null}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-white/40 hover:bg-white/15 disabled:opacity-50"
          >
            {busy === 'discord' ? 'Redirecting…' : 'Continue with Discord'}
          </button>
        </div>

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <p className="mt-8 text-xs leading-relaxed text-white/35">
          Not invited? Signing in will not create access. Use the{' '}
          <a href="/contact/" className="underline hover:text-white/60">
            contact page
          </a>{' '}
          to get in touch.
        </p>
      </div>
    </div>
  );
}
