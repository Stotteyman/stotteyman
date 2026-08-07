import { NextResponse, type NextRequest } from 'next/server';

import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const COMMANDS = ['start_stream', 'stop_stream', 'set_scene', 'refresh_feed', 'get_status'] as const;
type Command = (typeof COMMANDS)[number];

function fail(e: unknown) {
  if (e instanceof HqAuthError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  console.error('[hq/live/obs]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

/**
 * Queue a command for the local OBS agent.
 *
 * The site never connects to the streaming PC. The agent running beside OBS
 * holds an OUTBOUND subscription and claims rows from this queue, so OBS
 * remote control needs no inbound port and no exposed obs-websocket. It also
 * means commands survive the PC being temporarily offline — they sit here
 * until the agent picks them up.
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('live.manage');
    const body = (await request.json()) as {
      command?: string;
      payload?: Record<string, unknown>;
    };

    if (!body.command || !COMMANDS.includes(body.command as Command)) {
      return NextResponse.json({ error: `Unknown command: ${body.command}` }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();

    const { data, error } = await admin
      .from('live_commands')
      .insert({
        command: body.command,
        payload: body.payload ?? {},
        requested_by: actor.userId,
      })
      .select('id, command, status, created_at')
      .single();
    if (error) throw error;

    await audit(actor.userId, `live.obs.${body.command}`, 'live_command', data.id, body.payload ?? {});
    return NextResponse.json({ command: data });
  } catch (e) {
    return fail(e);
  }
}

/** Poll a queued command for its result. */
export async function GET(request: NextRequest) {
  try {
    await requirePermission('live.manage');
    const id = request.nextUrl.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required.' }, { status: 400 });

    const admin = createSupabaseServiceClient();
    const { data } = await admin
      .from('live_commands')
      .select('id, command, status, result, created_at, completed_at')
      .eq('id', id)
      .maybeSingle();

    return NextResponse.json({ command: data ?? null });
  } catch (e) {
    return fail(e);
  }
}
