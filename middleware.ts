import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Route gate for the private HQ.
 *
 * Layer 2 of 3 (see Build Notes/stotteyman-hub README §4):
 *   1. DB trigger  — a members row only ever comes from an accepted invite
 *   2. this gate   — no members row, no /hq route
 *   3. RLS         — default deny on every stotteyman.* table
 *
 * The check that matters: `auth.users` is shared across 9+ sibling apps, so a perfectly
 * valid session can arrive here from someone who signed up on a completely different
 * site. A session alone is NOT access — membership is what counts.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

/** Reachable without a session, so an unauthenticated visitor is not redirect-looped. */
const PUBLIC_HQ_PATHS = ['/hq/login', '/hq/no-access', '/hq/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Always refresh, so the session cookie stays alive across the whole site.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!pathname.startsWith('/hq')) return response;

  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  if (PUBLIC_HQ_PATHS.some((p) => pathname.startsWith(p))) return response;

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/hq/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Membership lookup uses the service key: under RLS a non-member simply sees
  // nothing, which is indistinguishable from a policy error. This must be certain.
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/members?select=user_id&status=eq.active&user_id=eq.${user.id}`,
    {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Accept-Profile': 'stotteyman',
      },
      cache: 'no-store',
    }
  );

  const rows = res.ok ? ((await res.json()) as unknown[]) : [];

  if (rows.length === 0) {
    const url = request.nextUrl.clone();
    url.pathname = '/hq/no-access';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)'],
};
