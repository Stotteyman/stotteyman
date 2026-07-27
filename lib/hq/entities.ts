/**
 * Shared entity column list.
 *
 * One literal, never a concatenation: supabase-js infers row types from the *literal*
 * type of the select string, and `+` collapses it to plain `string`, which silently
 * degrades every result to `GenericStringError[]`.
 */
export const ENTITY_FIELDS =
  'id, parent_id, slug, name, kind, status, tagline, description, domain, sort_order, stripe_account_id, supabase_schema, netlify_site_id, drive_folder_id' as const;

export const ENTITY_KINDS = [
  'holding',
  'business',
  'product',
  'service',
  'property',
  'external',
] as const;

export const ENTITY_STATUSES = ['active', 'building', 'paused', 'archived'] as const;
