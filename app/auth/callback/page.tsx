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
          window.opener.postMessage({ type: 'KICK_AUTH_DONE' }, window.location.origin);
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
