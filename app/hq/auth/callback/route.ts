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

  // Deliberately no membership check here — middleware owns that decision, so there is
  // exactly one place where access is granted or refused.
  return response;
}
