/**
 * Back-compat shim.
 *
 * The site now runs on the shared W.A.G.E. Society Supabase project
 * (pqngaffhjqadrsntsvlp), in the `stotteyman` schema. The previous config pointed at
 * `drpowbmmyxwmedaxcjdy`, a project that no longer exists — every call through it
 * failed silently, which is why the content pages render empty today.
 *
 * The client is created lazily. An eager module-level client throws during
 * prerender whenever the env is absent, which fails the whole build for pages that
 * only ever touch Supabase inside a `useEffect`.
 *
 * Prefer importing from `@/lib/supabase/client` (browser) or
 * `@/lib/supabase/server` (service role, server-only) in new code.
 */
import { createSupabaseBrowserClient } from './supabase/client';

/** Inferred so the pinned-schema generics stay intact. */
type BrowserClient = ReturnType<typeof createSupabaseBrowserClient>;

export {
  SUPABASE_SCHEMA,
  createSupabaseAnonClient,
  createSupabaseBrowserClient,
} from './supabase/client';

let instance: BrowserClient | null = null;

function getClient(): BrowserClient {
  if (!instance) {
    // Session-persisting, preserving the existing OAuth / anonymous-auth behaviour.
    instance = createSupabaseBrowserClient();
  }
  return instance;
}

export const supabase = new Proxy({} as BrowserClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
