import { NextResponse, type NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Send a chat message to the Stotteyman Kick chatroom on behalf of the viewer.
 *
 * This used to POST `https://kick.com/api/v2/messages/send/<chatroomId>` with the
 * Supabase `provider_token` as a bearer, and it could never have worked:
 *
 *   - `kick.com/api/v2/*` is Kick's INTERNAL website API. It authenticates with the
 *     site's session cookie plus an XSRF header, not an OAuth bearer, and it sits
 *     behind the same Cloudflare edge that already 403s this stack server-side
 *     (which is why resolving a chatroom id needs the Supabase edge function).
 *   - The token we hold is an OFFICIAL Kick OAuth token. Those are only accepted by
 *     `api.kick.com/public/v1/*`, which is a different host with a different
 *     contract — `broadcaster_user_id`, not `chatroomId`, and `type: 'user'`,
 *     not `type: 'message'`.
 *
 * So every send was rejected, the widget read the rejection as "your login died",
 * and signed the user out of the whole site. Hence "logged in, typed, got logged
 * straight back out again".
 */

const KICK_API = 'https://api.kick.com/public/v1';
const CHANNEL_SLUG = 'stotteyman';
const MAX_LENGTH = 500;

type KickChatRequest = {
  content?: string;
  token?: string;
  replyToMessageId?: string;
};

/**
 * The broadcaster id is a constant for a given channel, so it is resolved once per
 * warm lambda rather than on every keystroke-sized request.
 */
let cachedBroadcasterId: number | null = null;

/**
 * `broadcaster_user_id` is a Kick USER id. It is neither the chatroom id (1062846)
 * nor the channel id (1069731) that the rest of the stream stack passes around, and
 * substituting either one silently addresses somebody else's chat. For stotteyman it
 * is 1108886.
 *
 * Three sources, in order, and NONE of them depend on the viewer's granted scopes:
 *
 *  1. `KICK_BROADCASTER_USER_ID` — the pinned value. One constant, zero requests.
 *  2. The `kick-chatroom` edge function, which reads it from Kick's internal channel
 *     payload out of Supabase's egress. No token, no scope.
 *  3. The public channels endpoint using the caller's token, which needs
 *     `channel:read`.
 *
 * It used to be (3) alone, and that failed in production: the `custom:kick` provider
 * on GoTrue was configured with `scopes: ['user:read']`, so no viewer token carried
 * `channel:read` no matter what `signInWithOAuth` requested — the provider's own
 * config wins. Anything that makes sending depend on a scope grant is a thing that
 * silently breaks the moment that config drifts.
 */
async function resolveBroadcasterUserId(token: string): Promise<number | null> {
  if (cachedBroadcasterId) return cachedBroadcasterId;

  const fromEnv = Number(process.env.KICK_BROADCASTER_USER_ID);
  if (Number.isInteger(fromEnv) && fromEnv > 0) {
    cachedBroadcasterId = fromEnv;
    return fromEnv;
  }

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (base) {
    try {
      const res = await fetch(
        `${base}/functions/v1/kick-chatroom?slug=${CHANNEL_SLUG}`,
        { signal: AbortSignal.timeout(10_000), cache: 'no-store' }
      );
      if (res.ok) {
        const body = (await res.json()) as { userId?: string };
        const id = Number(body.userId);
        if (Number.isInteger(id) && id > 0) {
          cachedBroadcasterId = id;
          return id;
        }
      }
    } catch {
      /* fall through to the token-scoped lookup */
    }
  }

  try {
    const res = await fetch(`${KICK_API}/channels?slug=${CHANNEL_SLUG}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
      cache: 'no-store',
    });
    if (!res.ok) return null;

    const body = (await res.json()) as {
      data?: { broadcaster_user_id?: number; slug?: string }[];
    };
    const id = body.data?.find((c) => c.slug === CHANNEL_SLUG)?.broadcaster_user_id
      ?? body.data?.[0]?.broadcaster_user_id;

    if (typeof id === 'number' && id > 0) {
      cachedBroadcasterId = id;
      return id;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Ask Kick what a token is actually allowed to do.
 *
 * Returns the granted scopes, or null if introspection itself failed — in which case
 * the caller must not infer anything, since "no answer" is not "no scopes".
 */
async function introspectScopes(token: string): Promise<string[] | null> {
  try {
    const res = await fetch(`${KICK_API}/token/introspect`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;

    const body = (await res.json()) as { data?: { active?: boolean; scope?: string } };
    if (!body.data?.active) return [];
    return (body.data.scope ?? '').split(/[\s,]+/).filter(Boolean);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: KickChatRequest;

  try {
    body = (await req.json()) as KickChatRequest;
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const token = typeof body.token === 'string' ? body.token.trim() : '';

  if (!content || !token) {
    return NextResponse.json({ message: 'Missing message or Kick token' }, { status: 400 });
  }
  if (content.length > MAX_LENGTH) {
    return NextResponse.json(
      { message: `Message too long (${MAX_LENGTH} characters max)` },
      { status: 400 }
    );
  }

  const broadcasterUserId = await resolveBroadcasterUserId(token);
  if (!broadcasterUserId) {
    // A failed lookup is almost always a token that Kick will also reject for the
    // send itself, so say the useful thing rather than "unknown error".
    return NextResponse.json(
      {
        code: 'kick_channel_unresolved',
        message: 'Could not resolve the Kick channel. Reconnect your Kick account and try again.',
      },
      { status: 502 }
    );
  }

  let kickRes: Response;
  try {
    kickRes = await fetch(`${KICK_API}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        broadcaster_user_id: broadcasterUserId,
        content,
        type: 'user',
        ...(body.replyToMessageId ? { reply_to_message_id: body.replyToMessageId } : {}),
      }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return NextResponse.json(
      { code: 'kick_unreachable', message: 'Could not reach Kick. Try again in a moment.' },
      { status: 502 }
    );
  }

  const data = (await kickRes.json().catch(() => ({}))) as {
    data?: { is_sent?: boolean; message_id?: string };
    message?: string;
  };

  // A rejected token has two very different causes that look identical from here:
  // genuinely expired, or alive but missing chat:write. Kick will say which if asked,
  // so ask rather than guess — the difference decides whether the user should press
  // reconnect or whether the OAuth provider config is wrong.
  if (kickRes.status === 401 || kickRes.status === 403) {
    const scopes = await introspectScopes(token);
    const hasWrite = scopes?.includes('chat:write');

    if (scopes && !hasWrite) {
      return NextResponse.json(
        {
          code: 'kick_scope_missing',
          message:
            'Your Kick login predates chat permission being enabled. Reconnect and approve chat access.',
          grantedScopes: scopes,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        code: 'kick_token_expired',
        message: 'Your Kick session expired. Reconnect to keep chatting.',
        ...(scopes ? { grantedScopes: scopes } : {}),
      },
      { status: 401 }
    );
  }

  if (!kickRes.ok) {
    return NextResponse.json(
      { code: 'kick_rejected', message: data.message || `Kick rejected the message (${kickRes.status})` },
      { status: kickRes.status }
    );
  }

  // A 200 with `is_sent: false` is Kick's way of saying the message was dropped —
  // slow mode, followers-only, a timeout, a banned word. Reporting that as success
  // leaves the sender staring at a chat their message never reached.
  if (data.data?.is_sent === false) {
    return NextResponse.json(
      {
        code: 'kick_not_sent',
        message: data.message || 'Kick accepted the request but did not post the message.',
      },
      { status: 422 }
    );
  }

  return NextResponse.json({ ok: true, messageId: data.data?.message_id ?? null });
}
