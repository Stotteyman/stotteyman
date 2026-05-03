import { NextRequest, NextResponse } from 'next/server';

type KickChatRequest = {
  chatroomId?: number;
  content?: string;
  token?: string;
};

export async function POST(req: NextRequest) {
  let body: KickChatRequest;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 });
  }

  const chatroomId = body.chatroomId;
  const content = typeof body.content === 'string' ? body.content.trim() : '';
  const token = body.token;

  if (!chatroomId || !content || !token) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
  }

  if (content.length > 500) {
    return NextResponse.json({ message: 'Message too long' }, { status: 400 });
  }

  try {
    const kickRes = await fetch(`https://kick.com/api/v2/messages/send/${chatroomId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content, type: 'message' }),
    });

    const data = await kickRes.json().catch(() => ({}));

    return NextResponse.json(data, { status: kickRes.status });
  } catch {
    return NextResponse.json({ message: 'Failed to reach Kick API' }, { status: 502 });
  }
}
