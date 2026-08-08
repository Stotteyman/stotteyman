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
  { href: '/company', label: 'Company' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Writing' },
] as const;

/** The single accent-coloured action in the header. */
export const primaryCta = { href: '/consult', label: 'Work with me' } as const;

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
      { href: '/follow', label: 'Follow' },
      { href: '/events', label: 'Events' },
      { href: '/donate', label: 'Support' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/company', label: 'Group structure' },
      { href: '/consult', label: 'Work with me' },
      { href: '/contact', label: 'Contact' },
    ],
  },
] as const;

/** Legacy alias — several pages still import this name. Remove once they are migrated. */
export const navigationItems = primaryNav;
