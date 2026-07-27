import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

/**
 * Browser-side Supabase clients. Anon key only.
 *
 * Points at the shared W.A.G.E. Society project (pqngaffhjqadrsntsvlp) and pins the
 * `stotteyman` schema. The pin is not optional: every app on this project lives in
 * its own schema, and an unpinned call silently resolves against `public` — the same
 * trap that has bitten furiouspvp and gn2i.
 *
 * Sessions are stored in COOKIES (via @supabase/ssr), not localStorage. Middleware
 * gating `/hq/*` runs on the edge and can only see cookies, so a localStorage session
 * would be invisible to it and every private route would read as logged-out.
 *
 * `anon` holds no table privileges in this schema, so the only things reachable from
 * the browser are the `public_*` views, the whitelisted RPCs, and Auth.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const SUPABASE_SCHEMA = 'stotteyman' as const;

function config(): { url: string; anonKey: string } {
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Set both in Netlify env or in .env.local.'
    );
  }
  return { url, anonKey };
}

/** Session-aware, cookie-backed client for client components. */
export function createSupabaseBrowserClient() {
  const cfg = config();
  return createBrowserClient(cfg.url, cfg.anonKey, {
    db: { schema: SUPABASE_SCHEMA },
  });
}

/** Stateless client for public reads that need no session. */
export function createSupabaseAnonClient() {
  const cfg = config();
  return createClient(cfg.url, cfg.anonKey, {
    db: { schema: SUPABASE_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
