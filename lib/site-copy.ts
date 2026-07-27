import { createSupabaseAnonClient } from '@/lib/supabase/client';

/**
 * Page copy, editable from HQ.
 *
 * Every lookup takes a fallback that matches what is seeded in the database, so a copy
 * row being missing or the fetch failing degrades to the original wording rather than an
 * empty headline. The public site should never render a blank hero because a query failed.
 */
export type Copy = (key: string, fallback: string) => string;

export async function loadCopy(): Promise<Copy> {
  let map: Record<string, string> = {};

  try {
    const supabase = createSupabaseAnonClient();
    const { data } = await supabase.from('public_site_copy').select('key, value');
    map = Object.fromEntries(
      ((data ?? []) as unknown as { key: string; value: string }[]).map((r) => [r.key, r.value])
    );
  } catch {
    // Fall through to defaults.
  }

  return (key: string, fallback: string) => {
    const v = map[key];
    return typeof v === 'string' && v.trim() !== '' ? v : fallback;
  };
}
