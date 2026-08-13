/**
 * Editable content collections.
 *
 * This registry is the authority on what may be written from the browser. Field lists
 * are enforced server-side on every request — the UI is generated from the same source,
 * so the two cannot drift, and an extra field in a request body is simply dropped.
 */
export type FieldType = 'text' | 'textarea' | 'markdown' | 'bool' | 'int' | 'select' | 'tags' | 'date';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  /** Shown in the row summary rather than only in the edit form. */
  primary?: boolean;
};

export type Collection = {
  key: string;
  table: string;
  label: string;
  description: string;
  /** Column used for the row heading. */
  titleField: string;
  orderBy: string;
  fields: Field[];
};

const PUBLISHED: Field = { name: 'published', label: 'Published', type: 'bool' };
const SORT: Field = { name: 'sort_order', label: 'Order', type: 'int' };

export const COLLECTIONS: Collection[] = [
  {
    key: 'projects',
    table: 'projects',
    label: 'Projects',
    description: 'Portfolio entries shown on the homepage and /work.',
    titleField: 'title',
    orderBy: 'sort_order',
    fields: [
      { name: 'title', label: 'Title', type: 'text', primary: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea', primary: true },
      { name: 'body', label: 'Detail', type: 'markdown' },
      { name: 'role', label: 'My role', type: 'text' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: ['active', 'shipped', 'in_progress', 'archived'],
      },
      { name: 'url', label: 'Link', type: 'text', placeholder: 'https://' },
      { name: 'image_url', label: 'Image URL', type: 'text' },
      { name: 'featured', label: 'Featured', type: 'bool' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    key: 'services',
    table: 'services',
    label: 'Services',
    description: 'Offerings shown on /services and the homepage.',
    titleField: 'title',
    orderBy: 'sort_order',
    fields: [
      { name: 'title', label: 'Title', type: 'text', primary: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea', primary: true },
      { name: 'detail', label: 'Detail', type: 'markdown' },
      { name: 'deliverables', label: 'Deliverables', type: 'tags' },
      { name: 'starting_at', label: 'Price note', type: 'text' },
      { name: 'cta_label', label: 'Button label', type: 'text' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    key: 'posts',
    table: 'posts',
    label: 'Writing',
    description: 'Blog entries at /blog.',
    titleField: 'title',
    orderBy: 'sort_order',
    fields: [
      { name: 'title', label: 'Title', type: 'text', primary: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', primary: true },
      { name: 'body', label: 'Body', type: 'markdown' },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'cover_url', label: 'Cover image', type: 'text' },
      { name: 'youtube_id', label: 'YouTube ID (11 chars, not a URL)', type: 'text' },
      // The daily publisher (public.daily_blog_publish_tick, pg_cron 13:05 UTC) takes the
      // lowest queue_position with status 'queued' and kind 'evergreen' — but only on a day
      // with no post already published, so a hand-published timely post never spends one.
      { name: 'kind', label: 'Kind (evergreen | timely)', type: 'text' },
      { name: 'status', label: 'Status (draft | queued | scheduled | published)', type: 'text' },
      { name: 'queue_position', label: 'Queue position (lowest goes next)', type: 'text' },
      { name: 'published_at', label: 'Publish date', type: 'date' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    key: 'mindset',
    table: 'mindset_principles',
    label: 'Mindset',
    description: 'Principles shown on /mindset.',
    titleField: 'title',
    orderBy: 'sort_order',
    fields: [
      { name: 'title', label: 'Title', type: 'text', primary: true },
      { name: 'body', label: 'Body', type: 'textarea', primary: true },
      PUBLISHED,
      SORT,
    ],
  },
  {
    key: 'achievements',
    table: 'achievements',
    label: 'Achievements',
    description: 'Entries shown on /achievements.',
    titleField: 'title',
    orderBy: 'sort_order',
    fields: [
      { name: 'title', label: 'Title', type: 'text', primary: true },
      { name: 'summary', label: 'Summary', type: 'textarea', primary: true },
      { name: 'impact', label: 'Impact', type: 'textarea' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    key: 'events',
    table: 'events',
    label: 'Events',
    description: 'Entries shown on /events.',
    titleField: 'title',
    orderBy: 'sort_order',
    fields: [
      { name: 'title', label: 'Title', type: 'text', primary: true },
      { name: 'description', label: 'Description', type: 'textarea', primary: true },
      { name: 'window_label', label: 'When', type: 'text', placeholder: 'e.g. Ongoing' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'cta_label', label: 'Button label', type: 'text' },
      { name: 'cta_href', label: 'Button link', type: 'text' },
      { name: 'cta_external', label: 'Opens externally', type: 'bool' },
      PUBLISHED,
      SORT,
    ],
  },
  {
    key: 'links',
    table: 'links',
    label: 'Links',
    description: 'Social and community links shown on /follow.',
    titleField: 'platform',
    orderBy: 'sort_order',
    fields: [
      { name: 'platform', label: 'Platform', type: 'text', primary: true },
      { name: 'url', label: 'URL', type: 'text', primary: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon', type: 'text' },
      PUBLISHED,
      SORT,
    ],
  },
];

export function getCollection(key: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.key === key);
}

/**
 * Strips anything not declared on the collection and coerces to the declared type.
 * Empty strings become NULL so clearing a field actually clears it — except for
 * booleans and integers, where empty is meaningless.
 */
export function sanitize(
  collection: Collection,
  body: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of collection.fields) {
    if (!(field.name in body)) continue;
    const raw = body[field.name];

    switch (field.type) {
      case 'bool':
        out[field.name] = Boolean(raw);
        break;
      case 'int': {
        const n = Number(raw);
        out[field.name] = Number.isFinite(n) ? Math.trunc(n) : 0;
        break;
      }
      case 'tags':
        out[field.name] = Array.isArray(raw)
          ? raw.map((t) => String(t).trim()).filter(Boolean)
          : String(raw ?? '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);
        break;
      case 'select':
        if (field.options && !field.options.includes(String(raw))) break;
        out[field.name] = String(raw);
        break;
      case 'date': {
        const v = String(raw ?? '').trim();
        out[field.name] = v ? new Date(v).toISOString() : null;
        break;
      }
      default: {
        const v = String(raw ?? '');
        out[field.name] = v.trim() === '' ? null : v;
      }
    }
  }
  return out;
}
