import 'server-only';

import type { InstantAnswer } from './store';

/**
 * The "I don't want to wait" answer.
 *
 * Runs a free, keyless web lookup and hands back whatever the open web already says,
 * clearly labelled as a machine answer. It does **not** replace the paid answer — the
 * real one still arrives on the same page — so it is allowed to come back empty.
 *
 * Why these two sources and not Google: Google's Custom Search JSON API needs a
 * billing-attached key and caps at 100 queries a day, and scraping the results page is
 * both against their terms and one HTML change away from breaking. DuckDuckGo's
 * Instant Answer API and Wikipedia's REST API are documented, keyless, free and
 * stable — the difference between something that works and something that works until
 * it is watched. Both are called server-side, so neither touches the page's connect-src.
 *
 * **Returning null is the important feature.** Asked "what is the best way to host a
 * game server for 60 players", an ungated Wikipedia search confidently returns the Eve
 * Online article — a real result from a real API that has nothing to do with the
 * question. `isRelevant` below is what stops that reaching a paying customer: better a
 * page that says the web had nothing than a page that answers a different question.
 */

/**
 * OFF by default, and shipped that way deliberately.
 *
 * The relevance gate below kills the worst misses, but it is not yet good enough to put
 * in front of someone who has just paid. Two real examples from testing: "best way to
 * host a game server for 60 players" returned the Eve Online article (now correctly
 * rejected), and "what is Arma Reforger and what engine does it run on" returns the
 * **Arma 3** article — which the gate lets through, because "3" is too short to count
 * as a title word and "Arma" does appear in the question. Close enough to look right,
 * wrong enough to be worse than saying nothing.
 *
 * So the page advertises it as coming soon and this stays dark until the matching is
 * genuinely reliable. Flip AMA_INSTANT_ENABLED to "true" to turn it on.
 */
export function instantAnswerEnabled(): boolean {
  return process.env.AMA_INSTANT_ENABLED === 'true';
}

const TIMEOUT_MS = 6000;

// Wikipedia rejects a generic or absent User-Agent outright. Their API etiquette policy
// requires the app to name itself and a way to reach the operator.
const UA = 'stotteyman.com AMA (+https://stotteyman.com; contact@stotteyman.com)';

type DdgTopic = { Text?: string; FirstURL?: string; Topics?: DdgTopic[] };

type DdgResponse = {
  Answer?: string;
  AnswerType?: string;
  AbstractText?: string;
  AbstractURL?: string;
  AbstractSource?: string;
  Heading?: string;
  Definition?: string;
  DefinitionURL?: string;
  DefinitionSource?: string;
  RelatedTopics?: DdgTopic[];
};

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const STOPWORDS = new Set([
  'about', 'after', 'again', 'against', 'because', 'been', 'before', 'being', 'best',
  'better', 'between', 'both', 'cant', 'could', 'does', 'doing', 'done', 'dont', 'each',
  'else', 'ever', 'every', 'from', 'gets', 'getting', 'good', 'have', 'having', 'here',
  'into', 'itself', 'just', 'know', 'like', 'list', 'make', 'making', 'many', 'more',
  'most', 'much', 'must', 'need', 'only', 'other', 'over', 'said', 'same', 'should',
  'since', 'some', 'such', 'than', 'that', 'their', 'them', 'then', 'there', 'these',
  'they', 'thing', 'things', 'this', 'those', 'through', 'thing', 'used', 'using',
  'very', 'want', 'well', 'were', 'what', 'when', 'where', 'which', 'while', 'will',
  'with', 'without', 'would', 'your',
]);

/** Lowercased content words of four letters or more, crudely de-pluralised. */
function contentWords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !STOPWORDS.has(w))
    .map((w) => (w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.endsWith('s') ? w.slice(0, -1) : w));
  return new Set(words);
}

/**
 * Is this result actually about what was asked?
 *
 * The bar is deliberately high: **every** substantive word in the result's title must
 * appear in the question. Titles are two or three words, so this is cheap and strict.
 * "Game server" against a question about hosting a game server passes on both words;
 * "Eve Online" fails because the question never says "eve" or "online".
 *
 * A loose overlap test — "share any one word" — is what lets the Eve Online result
 * through, since "game" alone matches half of Wikipedia.
 */
function isRelevant(question: string, title: string): boolean {
  const asked = contentWords(question);
  const titled = contentWords(title);
  if (titled.size === 0 || asked.size === 0) return false;
  for (const w of titled) {
    if (!asked.has(w)) return false;
  }
  return true;
}

/** Flattens DuckDuckGo's nested RelatedTopics into a plain link list. */
function flattenTopics(topics: DdgTopic[] | undefined, out: { title: string; url: string }[] = []) {
  for (const t of topics ?? []) {
    if (out.length >= 5) break;
    if (t.FirstURL && t.Text) out.push({ title: t.Text, url: t.FirstURL });
    if (t.Topics) flattenTopics(t.Topics, out);
  }
  return out;
}

async function fromDuckDuckGo(question: string): Promise<InstantAnswer | null> {
  const q = encodeURIComponent(question.slice(0, 400));
  const data = await getJson<DdgResponse>(
    `https://api.duckduckgo.com/?q=${q}&format=json&no_html=1&skip_disambig=1&t=stotteyman`
  );
  if (!data) return null;

  // A direct answer — a calculation, a conversion, a unit change. These are computed
  // from the query itself, so there is nothing to check for relevance.
  if (data.Answer && data.Answer.trim()) {
    return {
      summary: data.Answer.trim(),
      source: data.AnswerType ? `DuckDuckGo (${data.AnswerType})` : 'DuckDuckGo',
      sourceUrl: null,
      links: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const abstract = (data.AbstractText || data.Definition || '').trim();
  const heading = (data.Heading || '').trim();
  if (abstract.length > 40 && heading && isRelevant(question, heading)) {
    return {
      summary: abstract,
      source: data.AbstractSource || data.DefinitionSource || 'DuckDuckGo',
      sourceUrl: data.AbstractURL || data.DefinitionURL || null,
      links: flattenTopics(data.RelatedTopics),
      generatedAt: new Date().toISOString(),
    };
  }

  return null;
}

type WikiSearch = { query?: { search?: { title: string }[] } };
type WikiSummary = {
  title?: string;
  extract?: string;
  type?: string;
  content_urls?: { desktop?: { page?: string } };
};

async function fromWikipedia(question: string): Promise<InstantAnswer | null> {
  const terms = question.replace(/\s+/g, ' ').trim().slice(0, 250);
  if (terms.length < 5) return null;

  const search = await getJson<WikiSearch>(
    'https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srlimit=5&srsearch=' +
      encodeURIComponent(terms)
  );
  const hits = search?.query?.search ?? [];
  if (!hits.length) return null;

  // Take the first hit that is genuinely about the question rather than the first hit
  // full stop. Wikipedia's relevance ranking optimises for term frequency, which is a
  // different thing from being an answer.
  const hit = hits.find((h) => isRelevant(question, h.title));
  if (!hit) return null;

  const summary = await getJson<WikiSummary>(
    'https://en.wikipedia.org/api/rest_v1/page/summary/' +
      encodeURIComponent(hit.title.replace(/ /g, '_'))
  );

  const extract = (summary?.extract ?? '').trim();
  // `disambiguation` pages have an extract that is just "X may refer to:".
  if (extract.length < 40 || summary?.type === 'disambiguation') return null;

  return {
    summary: extract,
    source: `Wikipedia — ${summary?.title ?? hit.title}`,
    sourceUrl:
      summary?.content_urls?.desktop?.page ??
      `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`,
    links: hits
      .filter((h) => h.title !== hit.title && isRelevant(question, h.title))
      .slice(0, 3)
      .map((h) => ({
        title: h.title,
        url: `https://en.wikipedia.org/wiki/${encodeURIComponent(h.title.replace(/ /g, '_'))}`,
      })),
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Best free answer available, or null when the web has nothing that is actually about
 * the question.
 *
 * Null is a real outcome, not an unhandled case: most questions worth $5 ("should I
 * use Reforger or DayZ for this server?") have no encyclopedia entry, and the page says
 * so plainly rather than padding itself with confident, unrelated text.
 */
export async function lookupInstantAnswer(question: string): Promise<InstantAnswer | null> {
  const [ddg, wiki] = await Promise.all([fromDuckDuckGo(question), fromWikipedia(question)]);
  // DDG wins ties: a computed answer or a curated abstract beats an article lede.
  return ddg ?? wiki ?? null;
}
