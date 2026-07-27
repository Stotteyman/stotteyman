'use client';

import { useEffect, useState } from 'react';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Terminal state for a valid session with no membership — most likely someone who
 * signed up on a sibling app that shares this Supabase project. The session is signed
 * out on arrival so they are not left in a half-authenticated limbo.
 */
export default function NoAccessClient() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      void supabase.auth.signOut();
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-md text-center">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Restricted</p>
        <h1 className="mt-3 text-2xl font-semibold text-white">This area is invite-only</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          {email ? (
            <>
              <span className="text-white/80">{email}</span> signed in successfully, but it has
              no access to HQ.
            </>
          ) : (
            <>That account has no access to HQ.</>
          )}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/50">
          Accounts here are created by invitation only. You have been signed out.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-white/40"
          >
            Back to stotteyman.com
          </a>
          <a href="/contact/" className="text-xs text-white/40 underline hover:text-white/70">
            Request access
          </a>
        </div>
      </div>
    </div>
  );
}
