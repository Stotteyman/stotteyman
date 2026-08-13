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
 * substituting either one silently addresses somebody else's chat.
 *
 * Resolved with the viewer's own token — hence `channel:read` in the sign-in scopes.
 * `KICK_BROADCASTER_USER_ID` short-circuits the lookup if it is ever set.
 */
async function resolveBroadcasterUserId(token: string): Promise<number | null> {
  if (cachedBroadcasterId) return cachedBroadcasterId;

  const fromEnv = Number(process.env.KICK_BROADCASTER_USER_ID);
  if (Number.isInteger(fromEnv) && fromEnv > 0) {
    cachedBroadcasterId = fromEnv;
    return fromEnv;
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

  if (kickRes.status === 401) {
    return NextResponse.json(
      { code: 'kick_token_expired', message: 'Your Kick session expired. Reconnect to keep chatting.' },
      { status: 401 }
    );
  }

  if (kickRes.status === 403) {
    return NextResponse.json(
      {
        code: 'kick_scope_missing',
        message: 'Kick did not grant permission to post. Reconnect and approve chat access.',
      },
      { status: 403 }
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
