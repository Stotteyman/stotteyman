import { NextResponse, type NextRequest } from 'next/server';

import { audit, HqAuthError, requirePermission } from '@/lib/hq/auth';
import { confirmDonation } from '@/lib/stream/donations';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function fail(e: unknown) {
  if (e instanceof HqAuthError) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error('[hq/stream/donations]', e);
  return NextResponse.json({ error: 'Unexpected error.' }, { status: 500 });
}

const FIELDS =
  'id, source, status, amount_cents, currency, donor_name, message, is_song_request, ' +
  'youtube_video_id, youtube_title, created_at, confirmed_at';

/** Pending claims first — those are the ones waiting on a human. */
export async function GET() {
  try {
    await requirePermission('stream.moderate');
    const admin = createSupabaseServiceClient();

    const [{ data: pending }, { data: recent }, { data: totals }] = await Promise.all([
      admin
        .from('stream_donations')
        .select(FIELDS)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50),
      admin
        .from('stream_donations')
        .select(FIELDS)
        .eq('status', 'confirmed')
        .order('confirmed_at', { ascending: false })
        .limit(25),
      admin.from('stream_donations').select('amount_cents').eq('status', 'confirmed'),
    ]);

    const totalCents = (totals ?? []).reduce(
      (sum: number, r: { amount_cents: number }) => sum + r.amount_cents,
      0
    );

    return NextResponse.json({
      pending: pending ?? [],
      recent: recent ?? [],
      totalCents,
    });
  } catch (e) {
    return fail(e);
  }
}

/**
 * Approve, reject, or rehearse.
 *
 * `approve` runs the SAME `confirmDonation` the Stripe webhook does, so a manually
 * confirmed CashApp donation produces an identical alert and queue entry — there is
 * no second, divergent code path for the manual rail.
 */
export async function POST(request: NextRequest) {
  try {
    const actor = await requirePermission('stream.moderate');
    const body = (await request.json()) as { id?: string; action?: string; message?: string };
    const admin = createSupabaseServiceClient();

    switch (body.action) {
      case 'approve': {
        if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        const result = await confirmDonation(body.id, actor.userId);
        if (!result.confirmed) {
          return NextResponse.json(
            { error: 'Already handled — nothing changed.' },
            { status: 409 }
          );
        }
        await audit(actor.userId, 'stream.donation.approved', 'stream_donations', body.id, result);
        return NextResponse.json({ ok: true, ...result });
      }

      case 'reject': {
        if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        const { error } = await admin
          .from('stream_donations')
          .update({
            status: 'rejected',
            reviewed_by: actor.userId,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', body.id)
          .eq('status', 'pending');
        if (error) throw error;
        await audit(actor.userId, 'stream.donation.rejected', 'stream_donations', body.id);
        return NextResponse.json({ ok: true });
      }

      case 'test': {
        // Rehearsal goes through the real alert bus, not a preview mode — an alert
        // you cannot test the same way it fires is one you debug live on stream.
        const { data, error } = await admin
          .from('stream_alerts')
          .insert({
            kind: 'test',
            donor_name: 'Test Donor',
            amount_cents: 500,
            currency: 'usd',
            message: body.message?.slice(0, 300) || 'This is a test alert.',
            speak: true,
          })
          .select('id')
          .single();
        if (error) throw error;
        await audit(actor.userId, 'stream.alert.test', 'stream_alerts', data.id);
        return NextResponse.json({ ok: true, alertId: data.id });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
    }
  } catch (e) {
    return fail(e);
  }
}
