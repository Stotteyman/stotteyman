'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing login…');

  useEffect(() => {
    const finalizeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const hasCode = params.has('code');

      if (hasCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          setStatus(`Login failed: ${error.message}`);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setStatus('Waiting for login confirmation…');
      }
    };

    // Supabase automatically detects auth code/hash in the URL on client init.
    // Listen for the SIGNED_IN event, then notify the opener and close.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setStatus('Logged in! Closing…');
        if (window.opener && !window.opener.closed) {
          /**
           * The token has to travel in this message, because this popup is the only
           * context that will ever see it.
           *
           * Supabase does not persist `provider_token` into the stored session — it is
           * handed once, to whichever browsing context completed the code exchange, and
           * that is this window. The opener calling `getSession()` afterwards gets a
           * perfectly valid session with `provider_token: null`, and sessionStorage is
           * per-tab so it cannot see anything written here either. That is exactly how
           * "logged in, then immediately logged out again" happened: the opener had an
           * identity and no Kick credential, which it reasonably read as signed out.
           *
           * Same-origin target, and the opener verifies `event.origin` on receipt.
           */
          window.opener.postMessage(
            { type: 'KICK_AUTH_DONE', providerToken: session.provider_token ?? null },
            window.location.origin
          );
        } else {
          window.location.replace('/stream/');
          return;
        }
        // Small delay so Supabase finishes writing the session to localStorage
        setTimeout(() => window.close(), 300);
      }
    });

    finalizeAuth();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <span className="h-2 w-2 animate-ping rounded-full bg-[#53FC18]" />
        <p className="font-mono text-sm text-fg-subtle">{status}</p>
      </div>
    </div>
  );
}
