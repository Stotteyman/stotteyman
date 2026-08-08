'use client';

import { useEffect, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Phase = 'checking' | 'granted' | 'denied';

/**
 * Landing spot for a valid session with no membership.
 *
 * Before giving up it tries `accept_invite` once. That makes access self-healing: a
 * session can arrive here from any entry point — the public /auth/callback page, a
 * sibling app on the shared project, or a stale cookie — and none of those run the HQ
 * callback route. If a pending invite matches the signed-in email, that should be
 * enough, no matter how the session was obtained.
 *
 * Only if there is genuinely no invite do we sign out.
 */
export default function NoAccessClient({ hqBase }: { hqBase: string }) {
  const [phase, setPhase] = useState<Phase>('checking');
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;

      if (!data.user) {
        setPhase('denied');
        return;
      }
      setEmail(data.user.email ?? null);

      const { data: result } = await supabase.rpc('accept_invite');
      if (cancelled) return;

      if (result && typeof result === 'object' && (result as { ok?: boolean }).ok) {
        setPhase('granted');
        // Full reload so middleware re-evaluates with the new membership.
        window.location.replace(`${hqBase}/` || '/');
        return;
      }

      setPhase('denied');
      await supabase.auth.signOut();
    })();

    return () => {
      cancelled = true;
    };
  }, [hqBase]);

  if (phase === 'checking' || phase === 'granted') {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <div className="rounded-xl border border-line bg-surface p-8">
          <p className="text-sm text-fg-muted">
            {phase === 'granted' ? 'Access granted — opening HQ…' : 'Checking your access…'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <div className="rounded-xl border border-line bg-surface p-8">
        <p className="text-label uppercase text-fg-subtle">Restricted</p>
        <h1 className="mt-3 text-2xl font-semibold text-fg">This area is invite-only</h1>
        <p className="mt-4 text-sm leading-relaxed text-fg-muted">
          {email ? (
            <>
              <span className="text-fg">{email}</span> signed in successfully, but it has
              no access to HQ.
            </>
          ) : (
            <>That account has no access to HQ.</>
          )}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-fg-subtle">
          Accounts here are created by invitation only. You have been signed out.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`${hqBase}/login/`}
            className="inline-flex items-center justify-center rounded-full border border-line bg-surface-hover px-6 py-3 text-sm font-medium text-fg transition-all duration-300 hover:border-line-strong"
          >
            Try a different account
          </a>
          <a href="/" className="text-xs text-fg-subtle underline hover:text-fg-muted">
            Back to stotteyman.com
          </a>
        </div>
      </div>
    </div>
  );
}
