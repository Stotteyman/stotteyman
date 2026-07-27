import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Host-based routing + the private HQ gate.
 *
 * HQ lives at hq.stotteyman.com. The routes still live under `app/hq/*` on disk, so the
 * subdomain is served by rewriting `/org` -> `/hq/org` internally. The apex redirects
 * `/hq/*` to the subdomain, which means HQ links are written WITHOUT the `/hq` prefix
 * and there is exactly one canonical URL for every HQ page.
 *
 * The gate is layer 2 of 3 (see Build Notes/stotteyman-hub README §4):
 *   1. DB trigger / accept_invite — membership only ever comes from an invite
 *   2. this gate                  — no members row, no HQ route
 *   3. RLS                        — default deny on every stotteyman.* table
 *
 * `auth.users` is shared across 9+ sibling apps, so a perfectly valid session can arrive
 * from someone who signed up on a completely different site. A session is not access.
 */
const HQ_HOST = 'hq.stotteyman.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

/** Reachable without a session, so an unauthenticated visitor is not redirect-looped. */
const PUBLIC_HQ_PATHS = ['/login', '/no-access', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase();
  const isHqHost = host === HQ_HOST;
  const { pathname, search } = request.nextUrl;

  // Apex/www: HQ has moved. Send it to the subdomain, preserving the deep link.
  if (!isHqHost && (pathname === '/hq' || pathname.startsWith('/hq/'))) {
    const rest = pathname.replace(/^\/hq/, '') || '/';
    return NextResponse.redirect(`https://${HQ_HOST}${rest}${search}`, 308);
  }

  if (!isHqHost) return NextResponse.next({ request });

  // ---- from here down we are on hq.stotteyman.com ----

  // /api is served as-is; only page routes get the /hq prefix.
  const isApi = pathname.startsWith('/api');

  // Someone hitting hq.stotteyman.com/hq/... — collapse to the canonical form.
  if (!isApi && (pathname === '/hq' || pathname.startsWith('/hq/'))) {
    const rest = pathname.replace(/^\/hq/, '') || '/';
    return NextResponse.redirect(new URL(`${rest}${search}`, request.url), 308);
  }

  const hqPath = pathname === '/' ? '/hq' : `/hq${pathname}`;

  let response: NextResponse;
  const buildResponse = () => {
    if (isApi) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = hqPath;
    return NextResponse.rewrite(url);
  };
  response = buildResponse();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = buildResponse();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  // API routes do their own permission checks and must return JSON, not a redirect.
  if (isApi) return response;

  if (PUBLIC_HQ_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Membership is looked up with the service key: under RLS a non-member simply sees
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
    url.pathname = '/no-access';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico|txt|xml)$).*)',
  ],
};
