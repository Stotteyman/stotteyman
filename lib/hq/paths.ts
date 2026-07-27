export const HQ_HOST = 'hq.stotteyman.com';
export const CANONICAL_PUBLIC_HOSTS = new Set(['stotteyman.com', 'www.stotteyman.com']);

/**
 * Path prefix for HQ routes on a given host.
 *
 * On hq.stotteyman.com the routes are rewritten so HQ sits at the root and the prefix is
 * empty. Everywhere else — deploy previews, localhost — HQ is served at `/hq/*` and the
 * prefix is required.
 *
 * This has to be derived from the request host rather than hard-coded: building
 * `${origin}/auth/callback` on localhost silently hits the *public* callback page instead
 * of the HQ route handler, and the OAuth code is never exchanged.
 */
export function hqBaseFromHost(host: string | null | undefined): string {
  const clean = (host ?? '').split(':')[0].toLowerCase();
  return clean === HQ_HOST ? '' : '/hq';
}

/** Absolute HQ URL for the origin a request arrived on. */
export function hqUrlFromHost(origin: string, host: string | null | undefined, path = '/'): string {
  const base = hqBaseFromHost(host);
  const p = path === '/' ? '' : path;
  return `${origin.replace(/\/$/, '')}${base}${p}`;
}
