/**
 * Static site identity and navigation.
 *
 * Everything that is *content* — projects, services, posts, principles, achievements,
 * events, links — now lives in Supabase and is edited from HQ. This file previously
 * also exported hard-coded copies of all of it (`homepageSections`, `achievements`,
 * `activeProjects`, `writingEntries`, `socialLinks`, `upcomingEvents`,
 * `contactMethods`, `mindsetPrinciples`, `stackReadiness`); none were imported by any
 * page, they had drifted out of date, and `stackReadiness` still claimed the site
 * needed no database. They are gone.
 *
 * What stays here is identity and IA: things that are structural rather than editorial.
 */

export const siteConfig = {
  name: 'Stotteyman',
  person: 'Stotteyman',
  /** The legal parent. Always written in full — never abbreviated. */
  legalName: 'Stotteyman Enterprises LLC',
  title: 'Builder and operator — games, web platforms, and communities',
  description:
    'Game servers, community platforms, storefronts, and internal tooling — designed, engineered, and operated.',
  email: 'contact@stotteyman.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://stotteyman.com',
  socialHandle: '@stotteyman',

  /** Used for `sameAs` in structured data. Only list profiles that actually exist. */
  profiles: [
    'https://kick.com/stotteyman',
    'https://discord.gg/9zbyfPyp3E',
    'https://github.com/stotteyman',
  ],
} as const;

/**
 * Primary navigation.
 *
 * Five items, not twelve. The old list mixed the client-facing track (work, services,
 * consult) with the creator track (stream, donate, follow, events) in one flat row that
 * wrapped to four lines on a phone. The creator surfaces still exist and are reachable
 * from the footer and from /stream itself — they are just no longer competing with the
 * thing this site is for.
 */
export const primaryNav = [
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Writing' },
] as const;

/**
 * The header menu.
 *
 * `primaryNav` above is a flat list, which is why eleven public pages had to be either
 * crammed into the bar or exiled to the footer — /mindset, /achievements, /events and
 * every guided flow were only reachable by scrolling to the bottom of the page. This
 * is the same information arranged as menus: five top-level entries, each of which is
 * either a plain link or a panel that shows what is underneath it.
 *
 * `menuNav` is what the header renders. `primaryNav` stays exported because several
 * pages still import it, and the two agree on the top-level hrefs.
 */
export type MenuLink = {
  href: string;
  label: string;
  hint?: string;
  /** Guided flows are flagged so the panel can mark them; they behave like any link. */
  wizard?: boolean;
  external?: boolean;
};

export type MenuItem =
  | { label: string; href: string; items?: never; feature?: never }
  | {
      label: string;
      /** The panel's own landing page — the top-level label stays clickable. */
      href: string;
      items: readonly MenuLink[];
      feature?: { href: string; label: string; hint: string };
    };

export const menuNav: readonly MenuItem[] = [
  {
    label: 'Work',
    href: '/work',
    // The group structure is deliberately NOT here. It is back-office information and
    // lives only in /hq/org — see the revoke on stotteyman.public_entities.
    items: [
      { href: '/work', label: 'All projects', hint: 'Everything shipped and running' },
      { href: '/achievements', label: 'Track record', hint: 'Milestones worth pointing at' },
      { href: '/services', label: 'How I work', hint: 'What hiring me looks like' },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    items: [
      { href: '/services', label: 'What I do', hint: 'Servers, platforms, storefronts, tooling' },
      { href: '/build', label: 'Server builder', hint: 'Spec a game server and price it', wizard: true },
      { href: '/consult', label: 'Start a project', hint: 'Scope it in four steps', wizard: true },
    ],
    feature: {
      href: '/build',
      label: 'Build me a server',
      hint: 'Pick a game, a player count and the mods you want. Get a spec and a price back.',
    },
  },
  {
    label: 'Live',
    href: '/stream',
    items: [
      { href: '/stream', label: 'Watch the stream', hint: 'Kick player and live chat' },
      { href: '/events', label: 'Events', hint: 'What is coming up' },
      { href: '/follow', label: 'Get connected', hint: 'Discord, Kick and alerts in one pass', wizard: true },
      { href: '/donate', label: 'Support the stream', hint: 'Tips, song requests, shoutouts', wizard: true },
    ],
  },
  {
    label: 'About',
    href: '/about',
    items: [
      { href: '/about', label: 'Who I am', hint: 'Background and how I work' },
      { href: '/mindset', label: 'How I think', hint: 'The principles behind the decisions' },
      { href: '/contact', label: 'Contact', hint: 'Direct line, no form gymnastics' },
    ],
  },
  { label: 'Writing', href: '/blog' },
];

/** The single accent-coloured action in the header. */
export const primaryCta = { href: '/consult', label: 'Start a project' } as const;

export const footerNav = [
  {
    heading: 'Site',
    links: [
      { href: '/work', label: 'Work' },
      { href: '/services', label: 'Services' },
      { href: '/about', label: 'About' },
      { href: '/blog', label: 'Writing' },
      { href: '/mindset', label: 'Mindset' },
      { href: '/achievements', label: 'Achievements' },
    ],
  },
  {
    heading: 'Live',
    links: [
      { href: '/stream', label: 'Livestream' },
      { href: '/follow', label: 'Get connected' },
      { href: '/events', label: 'Events' },
      { href: '/donate', label: 'Support' },
    ],
  },
  {
    heading: 'Work with me',
    links: [
      { href: '/build', label: 'Server builder' },
      { href: '/consult', label: 'Start a project' },
      { href: '/contact', label: 'Contact' },
    ],
  },
] as const;

/** Legacy alias — several pages still import this name. Remove once they are migrated. */
export const navigationItems = primaryNav;
