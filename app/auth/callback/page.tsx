'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [status, setStatus] = useState('Completing login…');

  useEffect(() => {
    // Supabase automatically detects auth code/hash in the URL on client init.
    // Listen for the SIGNED_IN event, then notify the opener and close.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        setStatus('Logged in! Closing…');
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: 'KICK_AUTH_DONE' }, window.location.origin);
        }
        // Small delay so Supabase finishes writing the session to localStorage
        setTimeout(() => window.close(), 300);
      }
    });

    // Trigger URL-based session detection (picks up ?code= or #access_token=)
    supabase.auth.getSession();

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <span className="h-2 w-2 animate-ping rounded-full bg-[#53FC18]" />
        <p className="font-mono text-sm text-gray-400">{status}</p>
      </div>
    </div>
  );
}
