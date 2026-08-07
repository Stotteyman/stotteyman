/**
 * Service-role Supabase access for Studio.
 *
 * Separate from `lib/supabase/server.ts` because that module imports `server-only` and
 * `next/headers`, neither of which exist inside the Netlify background worker. Same key,
 * same schema pin, no Next.js coupling.
 */
import { createClient } from '@supabase/supabase-js';

import { realtimeTransport } from '../supabase/realtime-transport';

export const STUDIO_SCHEMA = 'stotteyman';
export const MEDIA_BUCKET = 'stotteyman-media';

// Return types are inferred rather than annotated: `SupabaseClient` defaults its schema
// parameter to "public", which does not match a client pinned to `stotteyman`.
export function studioClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      'Studio needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment.'
    );
  }
  return createClient(url, key, {
    db: { schema: STUDIO_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    // Required on Netlify's nodejs20 runtime — see supabase/realtime-transport.ts.
    realtime: { transport: realtimeTransport },
  });
}

/** Storage lives outside the pinned schema, so it needs its own unpinned client. */
export function storageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    throw new Error(
      'Studio needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment.'
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    realtime: { transport: realtimeTransport },
  });
}

export function publicMediaUrl(storagePath: string): string {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '');
  return `${url}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}
