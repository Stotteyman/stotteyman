import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Host-based routing + the private HQ gate.
 *
 * HQ lives at hq.stotteyman.com. The routes still live under `app/hq/*` on disk, so the
 * subdomain is served by rewriting `/org` -> `/hq/org` internally, and the canonical
 * public host 308-redirects `/hq/*` across. HQ links carry no `/hq` prefix.
 *
 * The redirect is scoped to the CANONICAL public hosts only. Deploy previews
 * (*.netlify.app) and localhost keep serving `/hq/*` directly — otherwise every preview
 * build and every local dev session would bounce to production the moment you opened HQ.
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
const CANONICAL_PUBLIC_HOSTS = new Set(['stotteyman.com', 'www.stotteyman.com']);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

/** Reachable without a session, so an unauthenticated visitor is not redirect-looped. */
const PUBLIC_HQ_PATHS = ['/login', '/no-access', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase();
  const isHqHost = host === HQ_HOST;
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith('/api');
  const hasHqPrefix = pathname === '/hq' || pathname.startsWith('/hq/');

  // Canonical public host: HQ has moved. Preserve the deep link.
  if (!isHqHost && hasHqPrefix && CANONICAL_PUBLIC_HOSTS.has(host)) {
    const rest = pathname.replace(/^\/hq/, '') || '/';
    return NextResponse.redirect(`https://${HQ_HOST}${rest}${search}`, 308);
  }

  // On the HQ host, collapse an accidental /hq prefix to the canonical form.
  if (isHqHost && !isApi && hasHqPrefix) {
    const rest = pathname.replace(/^\/hq/, '') || '/';
    return NextResponse.redirect(new URL(`${rest}${search}`, request.url), 308);
  }

  /**
   * The HQ route this request resolves to, or null if it is a public page.
   * On the HQ host every page is HQ; elsewhere only an explicit /hq/* path is.
   */
  const hqPath = isHqHost ? (pathname === '/' ? '/hq' : `/hq${pathname}`) : hasHqPrefix ? pathname : null;

  const isHqApi = pathname.startsWith('/api/hq');
  if (hqPath === null && !isHqApi) return NextResponse.next({ request });

  const needsRewrite = isHqHost && !isApi;
  const buildResponse = () => {
    if (!needsRewrite) return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = hqPath!;
    return NextResponse.rewrite(url);
  };

  let response = buildResponse();

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

  // API routes run their own permission checks and must return JSON, not a redirect.
  if (isApi) return response;

  // Compare against the HQ-relative path so this works on both host shapes.
  const relative = hqPath!.replace(/^\/hq/, '') || '/';
  if (PUBLIC_HQ_PATHS.some((p) => relative === p || relative.startsWith(`${p}/`))) {
    return response;
  }

  const loginPath = isHqHost ? '/login' : '/hq/login';
  const noAccessPath = isHqHost ? '/no-access' : '/hq/no-access';

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    url.search = `?next=${encodeURIComponent(relative)}`;
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
    url.pathname = noAccessPath;
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
