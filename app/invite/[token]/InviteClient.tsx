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
}: {
  state: State;
  email: string | null;
  role: string | null;
  note: string | null;
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
        options: { redirectTo: `${window.location.origin}/hq/auth/callback?next=/hq` },
      });
      if (error) {
        setError(error.message);
        setBusy(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed.');
      setBusy(null);
    }
  }, []);

  if (state !== 'valid') {
    const m = MESSAGES[state];
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8">
          <h1 className="text-2xl font-semibold text-white">{m.title}</h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">{m.body}</p>
          <a
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm text-white hover:border-white/40"
          >
            Back to stotteyman.com
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">You are invited</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">Join Stotteyman HQ</h1>

        <dl className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-white/40">Invited address</dt>
            <dd className="text-right text-white">{email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-white/40">Role</dt>
            <dd className="text-right uppercase tracking-[0.15em] text-white/80">{role}</dd>
          </div>
          {note ? (
            <div className="flex justify-between gap-4">
              <dt className="text-white/40">Note</dt>
              <dd className="text-right text-white/70">{note}</dd>
            </div>
          ) : null}
        </dl>

        <p className="mt-6 text-sm leading-relaxed text-white/55">
          Sign in with <span className="text-white/80">{email}</span>. The invitation is matched
          on that address — signing in with a different account will not grant access.
        </p>

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={() => accept('google')}
            disabled={busy !== null}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white hover:border-white/40 disabled:opacity-50"
          >
            {busy === 'google' ? 'Redirecting…' : 'Accept with Google'}
          </button>
          <button
            type="button"
            onClick={() => accept('discord')}
            disabled={busy !== null}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white hover:border-white/40 disabled:opacity-50"
          >
            {busy === 'discord' ? 'Redirecting…' : 'Accept with Discord'}
          </button>
        </div>

        {error ? (
          <p className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
