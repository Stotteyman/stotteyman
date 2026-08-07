import WebSocket from 'ws';

/**
 * WebSocket constructor for supabase-js's realtime client, on the server.
 *
 * Netlify bundles Functions for nodejs20.x, and `globalThis.WebSocket` only landed
 * in Node 22. `createClient()` ALWAYS constructs a RealtimeClient, and realtime-js
 * throws out of that constructor when it finds no WebSocket rather than degrading —
 * so every Supabase-backed route 500s, including ones that never touch realtime.
 *
 * This never reproduces locally: dev machines run Node 22+, build the client fine,
 * and the deployed symptom points somewhere else entirely.
 *
 * Passing the transport explicitly is preferred over raising the runtime version,
 * because it is correct on every runtime and does not depend on a host default
 * that can change underneath us.
 */
export const realtimeTransport = (
  typeof globalThis.WebSocket !== 'undefined' ? globalThis.WebSocket : WebSocket
) as unknown as typeof globalThis.WebSocket;
