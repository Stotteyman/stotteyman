/**
 * Shared Meta Graph API plumbing for the Facebook and Instagram adapters.
 *
 * Version is pinned and overridable. Meta expires each version roughly two years after
 * release and an expired version returns errors rather than silently degrading, so this
 * is a value to bump deliberately — v21 and v22 are already gone as of 2026.
 */
import { PublishError } from '../types';

export const GRAPH_VERSION = process.env.META_GRAPH_VERSION ?? 'v25.0';
const GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;

/** Transient Meta error codes — worth retrying rather than surfacing to the user. */
const RETRYABLE_CODES = new Set([1, 2, 4, 17, 32, 341, 613]);

type GraphError = {
  error?: { message?: string; code?: number; error_subcode?: number; type?: string };
};

async function handle(res: Response, what: string): Promise<Record<string, unknown>> {
  const text = await res.text();
  let body: Record<string, unknown> & GraphError = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new PublishError(`${what}: Meta returned non-JSON (${res.status}).`, res.status >= 500);
  }

  if (!res.ok || body.error) {
    const err = body.error ?? {};
    const code = err.code ?? 0;
    const retryable = res.status >= 500 || RETRYABLE_CODES.has(code);
    throw new PublishError(
      `${what}: ${err.message ?? `HTTP ${res.status}`}${code ? ` (code ${code})` : ''}`,
      retryable,
      body
    );
  }

  return body;
}

export async function graphPost(
  path: string,
  params: Record<string, string | undefined>,
  token: string,
  what: string
): Promise<Record<string, unknown>> {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') form.append(key, value);
  }
  form.append('access_token', token);

  const res = await fetch(`${GRAPH}${path}`, { method: 'POST', body: form });
  return handle(res, what);
}

export async function graphGet(
  path: string,
  params: Record<string, string>,
  token: string,
  what: string
): Promise<Record<string, unknown>> {
  const query = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(`${GRAPH}${path}?${query.toString()}`);
  return handle(res, what);
}

export function metaToken(): string {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) {
    throw new PublishError(
      'META_PAGE_ACCESS_TOKEN is not set. Mint a never-expiring Page token first.',
      false
    );
  }
  return token;
}

/**
 * Waits for an Instagram media container to finish server-side processing.
 *
 * Publishing a container that is still `IN_PROGRESS` fails, and video containers are
 * never ready immediately — this poll is the single most common omission in Instagram
 * integrations. Runs inside a background function, so a few minutes of waiting is fine.
 */
export async function waitForContainer(
  containerId: string,
  token: string,
  log: (message: string, detail?: Record<string, unknown>) => void,
  { timeoutMs = 8 * 60 * 1000, intervalMs = 5000 } = {}
): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    const body = (await graphGet(
      `/${containerId}`,
      { fields: 'status_code,status' },
      token,
      'Instagram container status'
    )) as { status_code?: string; status?: string };

    const status = body.status_code ?? 'UNKNOWN';
    if (status === 'FINISHED') return;

    if (status === 'ERROR' || status === 'EXPIRED') {
      throw new PublishError(
        `Instagram could not process the media (${status}): ${body.status ?? 'no detail'}`,
        false
      );
    }

    if (Date.now() > deadline) {
      throw new PublishError(
        `Instagram was still processing after ${Math.round(timeoutMs / 60000)} minutes.`,
        true
      );
    }

    log('waiting on instagram container', { containerId, status });
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
