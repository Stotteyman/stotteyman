import { NextResponse } from 'next/server';

import { amaPriceCents } from '@/lib/ama/store';
import { stripeConfigured } from '@/lib/stream/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * What the ask form needs before it can render a price or a working button.
 *
 * Deliberately says nothing about which notification channels are wired: that is
 * operational detail, and the asker's experience does not change either way.
 */
export async function GET() {
  return NextResponse.json({
    priceCents: amaPriceCents(),
    cardEnabled: stripeConfigured(),
  });
}
