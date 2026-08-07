import { NextResponse } from 'next/server';

import { getStreamSettings } from '@/lib/stream/server';
import { stripeConfigured } from '@/lib/stream/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Public shape of the donation form: what is switched on and what it costs.
 *
 * Read by the /donate page so the form reflects the live settings without a
 * rebuild — turning song requests off in HQ hides the tickbox immediately.
 */
export async function GET() {
  try {
    const settings = await getStreamSettings();
    return NextResponse.json(
      {
        cardEnabled: stripeConfigured(),
        songsEnabled: settings.songs_enabled,
        songsMinCents: settings.songs_min_cents,
        alertsMinCents: settings.alerts_min_cents,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    // Fail visible-but-degraded: the manual CashApp/crypto path still works even
    // if settings cannot be read.
    return NextResponse.json({
      cardEnabled: false,
      songsEnabled: false,
      songsMinCents: 300,
      alertsMinCents: 100,
    });
  }
}
