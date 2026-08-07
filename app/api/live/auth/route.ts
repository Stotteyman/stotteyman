import { NextResponse } from 'next/server';

import { authorizePlayback } from '@/lib/live/server';

export const dynamic = 'force-dynamic';

/**
 * MediaMTX external authentication hook.
 *
 * MediaMTX POSTs here before allowing ANY publish or read, and honours the
 * status code: 2xx allows, anything else denies. That is what makes invite-only
 * real rather than security-by-obscure-URL — revoking a viewer in the database
 * cuts their video on the next check instead of merely hiding the page.
 *
 * Wire it up in mediamtx.yml:
 *   authMethod: http
 *   authHTTPAddress: https://stotteyman.com/api/live/auth
 *
 * Request body (MediaMTX v1):
 *   { user, password, token, ip, action, path, protocol, id, query }
 */

type AuthRequest = {
  user?: string;
  password?: string;
  token?: string;
  ip?: string;
  action?: 'publish' | 'read' | 'playback' | 'api' | 'metrics' | 'pprof';
  path?: string;
  protocol?: string;
  id?: string;
  query?: string;
};

/** Shared secret proving a publish request came from our own OBS, not the internet. */
const PUBLISH_SECRET = process.env.LIVE_PUBLISH_SECRET;

export async function POST(request: Request) {
  let body: AuthRequest;
  try {
    body = (await request.json()) as AuthRequest;
  } catch {
    return new NextResponse('bad request', { status: 400 });
  }

  const action = body.action ?? 'read';

  // Publishing is never viewer-facing. OBS publishes over loopback and is
  // allowed by an internal MediaMTX rule, so anything reaching this hook
  // asking to publish is remote and must present the shared secret.
  if (action === 'publish') {
    if (PUBLISH_SECRET && body.password === PUBLISH_SECRET) {
      return new NextResponse(null, { status: 200 });
    }
    return new NextResponse('forbidden', { status: 401 });
  }

  // Internal-only surfaces. MediaMTX binds the API to localhost anyway; this
  // is defence in depth in case that config is ever loosened by accident.
  if (action === 'api' || action === 'metrics' || action === 'pprof') {
    return new NextResponse('forbidden', { status: 401 });
  }

  // Only the program feed is watchable. The `live` path is the raw inbound
  // phone camera and must never be readable by the public.
  if (body.path !== 'program') {
    return new NextResponse('forbidden', { status: 401 });
  }

  // The player appends ?token=... to the WHEP URL; MediaMTX forwards it verbatim.
  const token =
    body.token ||
    (body.query ? new URLSearchParams(body.query).get('token') : null) ||
    null;

  const verdict = await authorizePlayback(token, body.ip ?? null);

  if (!verdict.allow) {
    // The reason is deliberately not returned to the client — it would let an
    // attacker distinguish "no such token" from "revoked" and probe for valid ones.
    return new NextResponse('forbidden', { status: 401 });
  }

  return new NextResponse(null, { status: 200 });
}
