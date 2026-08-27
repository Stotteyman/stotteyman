import { NextResponse, type NextRequest } from 'next/server';

import { AMA_TABLE } from '@/lib/ama/store';
import { HqAuthError, audit, requirePermission } from '@/lib/hq/auth';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const STATUSES = new Set(['pending', 'paid', 'answered', 'refunded', 'expired']);

/**
 * Publish an answer, or change a question's status.
 *
 * Writing an answer implies `answered` — the two were separate fields in the first
 * draft and the obvious mistake was saving the answer and forgetting the status, which
 * left the asker's page showing "working on it" over a finished reply.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await requirePermission('ama.manage');
    const { id } = await params;
    const body = (await request.json()) as {
      answer?: string;
      status?: string;
      internal_notes?: string;
    };

    const patch: Record<string, unknown> = {};

    if (body.answer !== undefined) {
      const answer = body.answer.trim();
      if (!answer) {
        return NextResponse.json({ error: 'An empty answer is not an answer.' }, { status: 400 });
      }
      patch.answer = answer;
      patch.answered_at = new Date().toISOString();
      patch.answered_by = actor.userId;
      patch.status = 'answered';
    }

    if (body.status !== undefined) {
      if (!STATUSES.has(body.status)) {
        return NextResponse.json({ error: `Unknown status: ${body.status}` }, { status: 400 });
      }
      patch.status = body.status;
    }

    if (body.internal_notes !== undefined) {
      patch.internal_notes = body.internal_notes.trim() || null;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 });
    }

    const admin = createSupabaseServiceClient();
    const { data, error } = await admin
      .from(AMA_TABLE)
      .update(patch)
      .eq('id', id)
      .select('id, status, answer, answered_at, internal_notes')
      .maybeSingle();

    if (error) throw error;
    if (!data) return NextResponse.json({ error: 'Question not found.' }, { status: 404 });

    // The answer text itself stays out of the audit detail — the log is a record of
    // who did what, not a second copy of the correspondence.
    await audit(actor.userId, 'ama.updated', 'ama_question', id, {
      status: patch.status ?? null,
      answered: body.answer !== undefined,
    });

    return NextResponse.json({ question: data });
  } catch (e) {
    if (e instanceof HqAuthError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error('[hq/ama PATCH]', e);
    return NextResponse.json({ error: 'Update failed.' }, { status: 500 });
  }
}
