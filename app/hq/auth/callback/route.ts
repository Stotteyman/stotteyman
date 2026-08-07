import { hqBaseFromHost } from '@/lib/hq/paths';
import { realtimeTransport } from '@/lib/supabase/realtime-transport';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * OAuth callback for HQ. A route handler rather than a client page, so the PKCE code
 * is exchanged server-side and the session lands in cookies where middleware can see it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

  if (!code) {
    return NextResponse.redirect(`${origin}${hqBaseFromHost(request.headers.get('host'))}/login?error=missing_code`);
  }

  // On localhost/previews HQ sits under /hq, so a bare `next` of '/' would land on
  // the PUBLIC homepage instead of HQ.
  const hqBase = hqBaseFromHost(request.headers.get('host'));
  const target = `${origin}${hqBase}${next === '/' ? '' : next}` || `${origin}${hqBase}/`;
  let response = NextResponse.redirect(target);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Required on Netlify's nodejs20 runtime — see lib/supabase/realtime-transport.ts.
      realtime: { transport: realtimeTransport },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}${hqBase}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Claim a pending invite, if there is one.
  //
  // The auth.users trigger only fires on INSERT, so it cannot provision anyone who
  // already had an account on this shared project — which is most people worth
  // inviting. This RPC is the second door. It reads the email from auth.users, so it
  // cannot be used to grant yourself access to an invite that is not yours.
  //
  // The token is passed EXPLICITLY rather than calling supabase.rpc() on the client
  // above: exchangeCodeForSession writes the new session to `response` cookies, but
  // that client reads cookies back off `request`, which still has none. It would run
  // the RPC as anon, get auth.uid() = null, and silently provision nothing.
  if (data.session?.access_token) {
    const authed = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        db: { schema: 'stotteyman' },
        auth: { persistSession: false, autoRefreshToken: false },
        realtime: { transport: realtimeTransport },
        global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      }
    );
    const { data: result, error: rpcError } = await authed.rpc('accept_invite');
    if (rpcError) console.error('[hq/callback] accept_invite failed', rpcError);
    else console.info('[hq/callback] accept_invite', result);
  }

  // No membership check here — middleware owns that decision, so there is exactly one
  // place where access is granted or refused.
  return response;
}
