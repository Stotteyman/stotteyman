import type { Context } from '@netlify/functions';

export default async function handler(req: Request, _ctx: Context) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body: { chatroomId?: number; content?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid JSON' }), { status: 400 });
  }

  const { chatroomId, content, token } = body;

  if (!chatroomId || !content || !token) {
    return new Response(JSON.stringify({ message: 'Missing fields' }), { status: 400 });
  }

  if (content.length > 500) {
    return new Response(JSON.stringify({ message: 'Message too long' }), { status: 400 });
  }

  const kickRes = await fetch(`https://kick.com/api/v2/messages/send/${chatroomId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content, type: 'message' }),
  });

  const data = await kickRes.json().catch(() => ({}));

  return new Response(JSON.stringify(data), {
    status: kickRes.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
