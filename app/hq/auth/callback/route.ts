import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * OAuth callback for HQ. A route handler rather than a client page, so the PKCE code
 * is exchanged server-side and the session lands in cookies where middleware can see it.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const rawNext = searchParams.get('next') ?? '/hq';
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/hq';

  if (!code) {
    return NextResponse.redirect(`${origin}/hq/login?error=missing_code`);
  }

  let response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/hq/login?error=${encodeURIComponent(error.message)}`
    );
  }

  // Claim a pending invite, if there is one.
  //
  // The auth.users trigger only fires on INSERT, so it cannot provision anyone who
  // already had an account on this shared project — which is most people worth
  // inviting. This RPC is the second door. It reads the email from auth.users, so it
  // cannot be used to grant yourself access to an invite that is not yours.
  await supabase.rpc('accept_invite');

  // No membership check here — middleware owns that decision, so there is exactly one
  // place where access is granted or refused.
  return response;
}
