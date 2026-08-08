'use client';

import { useCallback, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type State = 'valid' | 'accepted' | 'revoked' | 'expired' | 'unknown';

const MESSAGES: Record<Exclude<State, 'valid'>, { title: string; body: string }> = {
  accepted: {
    title: 'Already accepted',
    body: 'This invitation has already been used. Sign in normally to reach HQ.',
  },
  revoked: {
    title: 'Invitation revoked',
    body: 'This invitation is no longer valid. Get in touch if you think that is a mistake.',
  },
  expired: {
    title: 'Invitation expired',
    body: 'This invitation has passed its expiry date. Ask for a new one.',
  },
  unknown: {
    title: 'Invitation not found',
    body: 'This link is not valid. Check you copied the whole thing.',
  },
};

export default function InviteClient({
  state,
  email,
  role,
  note,
  hqCallback,
}: {
  state: State;
  email: string | null;
  role: string | null;
  note: string | null;
  /** Absolute HQ callback URL, resolved server-side from the request host. */
  hqCallback: string;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  const accept = useCallback(async (provider: 'google' | 'discord') => {
    setBusy(provider);
    setError('');
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        // The invite page is public, but HQ lives elsewhere — send the OAuth callback
        // straight there rather than bouncing a single-use code through a redirect.
        // Resolved from the request host so local dev stays on localhost.
        options: { redirectTo: `${hqCallback}?next=/` },
      });
      if (error) {
        setError(error.message);
        setBusy(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.');
      setBusy(null);
    }
  }, [hqCallback]);

  if (state !== 'valid') {
    const m = MESSAGES[state];
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="rounded-xl border border-line bg-surface p-8">
          <h1 className="text-2xl font-semibold text-fg">{m.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-fg-muted">{m.body}</p>
          <a
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-line bg-surface-hover px-6 py-3 text-sm text-fg hover:border-line-strong"
          >
            Back to stotteyman.com
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-line bg-surface p-8">
        <p className="text-label uppercase text-fg-subtle">You are invited</p>
        <h1 className="mt-3 text-2xl font-semibold text-fg">Join Stotteyman HQ</h1>

        <dl className="mt-6 grid gap-3 rounded-lg border border-line bg-bg-raised p-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-fg-subtle">Invited address</dt>
            <dd className="text-right text-fg">{email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-fg-subtle">Role</dt>
            <dd className="text-right uppercase tracking-[0.15em] text-fg">{role}</dd>
          </div>
          {note ? (
            <div className="flex justify-between gap-4">
              <dt className="text-fg-subtle">Note</dt>
              <dd className="text-right text-fg-muted">{note}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-6 text-sm leading-relaxed text-fg-muted">
          Sign in with <span className="text-fg">{email}</span>. The invitation is matched
          on that address — signing in with a different account will not grant access.
        </p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => accept('google')}
            disabled={busy !== null}
            className="inline-flex items-center justify-center rounded-full border border-line bg-surface-hover px-6 py-3 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-50"
          >
            {busy === 'google' ? 'Redirecting…' : 'Accept with Google'}
          </button>
          <button
            type="button"
            onClick={() => accept('discord')}
            disabled={busy !== null}
            className="inline-flex items-center justify-center rounded-full border border-line bg-surface-hover px-6 py-3 text-sm font-medium text-fg hover:border-line-strong disabled:opacity-50"
          >
            {busy === 'discord' ? 'Redirecting…' : 'Accept with Discord'}
          </button>
        </div>

        {error ? (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
