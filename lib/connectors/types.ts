/**
 * Every connector returns the same envelope, so the dashboard never special-cases a
 * provider and a single failing source cannot blank the page.
 *
 * `entityMetrics` is keyed by entity slug where a connector can attribute its data to a
 * specific business; `summary` carries whatever is global to that source.
 */
export type ConnectorResult = {
  source: string;
  ok: boolean;
  error?: string;
  /** Present but unconfigured (missing credentials) rather than broken. */
  notConfigured?: boolean;
  fetchedAt: string;
  durationMs: number;
  summary: Record<string, unknown>;
  entityMetrics: Record<string, Record<string, unknown>>;
};

export function emptyResult(source: string, error: string, notConfigured = false): ConnectorResult {
  return {
    source,
    ok: false,
    error,
    notConfigured,
    fetchedAt: new Date().toISOString(),
    durationMs: 0,
    summary: {},
    entityMetrics: {},
  };
}

/**
 * Runs a connector with a hard timeout and converts any throw into a failed result.
 * A connector must never be able to reject — the refresh endpoint fans out over all of
 * them and one bad provider should degrade to "stale" not "500".
 */
export async function runConnector(
  source: string,
  fn: (signal: AbortSignal) => Promise<Omit<ConnectorResult, 'source' | 'ok' | 'fetchedAt' | 'durationMs'>>,
  timeoutMs = 20_000
): Promise<ConnectorResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const partial = await fn(controller.signal);
    return {
      source,
      ok: true,
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: partial.summary ?? {},
      entityMetrics: partial.entityMetrics ?? {},
      ...(partial.notConfigured ? { notConfigured: true, ok: false } : {}),
      ...(partial.error ? { error: partial.error } : {}),
    };
  } catch (e) {
    const aborted = controller.signal.aborted;
    return {
      source,
      ok: false,
      error: aborted ? `Timed out after ${timeoutMs}ms` : e instanceof Error ? e.message : String(e),
      fetchedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: {},
      entityMetrics: {},
    };
  } finally {
    clearTimeout(timer);
  }
}
