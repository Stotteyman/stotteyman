import 'server-only';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

import { SUPABASE_SCHEMA } from './client';
import { realtimeTransport } from './realtime-transport';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

/**
 * Service-role client. Bypasses RLS entirely.
 *
 * `import 'server-only'` at the top of this module makes it a build error to pull it
 * into a client component, so the key can never reach a browser bundle.
 */
export function createSupabaseServiceClient() {
  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY. ' +
        'SUPABASE_SERVICE_KEY must be set in Netlify env.'
    );
  }
  return createClient(url, serviceKey, {
    db: { schema: SUPABASE_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
    // Required on Netlify's nodejs20 runtime — see realtime-transport.ts.
    realtime: { transport: realtimeTransport },
  });
}

/**
 * Session-aware server client, reading the user's cookies. Subject to RLS — use this
 * (not the service client) whenever a request should act *as the signed-in user*.
 */
export async function createSupabaseServerClient() {
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    db: { schema: SUPABASE_SCHEMA },
    realtime: { transport: realtimeTransport },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

export type HqMember = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  status: string;
  roles: string[];
};

/**
 * The single authority on "does this session have HQ access".
 *
 * Membership is looked up with the service client on purpose: a brand-new session from
 * a sibling app has no rows visible under RLS, and we need to distinguish "not a member"
 * from "policy hid the row". No member row -> no access, full stop.
 */
export async function getHqMember(): Promise<HqMember | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createSupabaseServiceClient();
  const { data: member } = await admin
    .from('members')
    .select('user_id, email, display_name, avatar_url, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!member) return null;

  const { data: roleRows } = await admin
    .from('user_roles')
    .select('role_slug')
    .eq('user_id', user.id);

  return {
    ...member,
    roles: (roleRows ?? []).map((r: { role_slug: string }) => r.role_slug),
  };
}
