export const siteConfig = {
  name: 'Stotteyman',
  person: 'Gary Lee McCullouch Jr.',
  title: 'Builder and operator — games, web platforms, and communities',
  description:
    'A multi-page portfolio documenting mindset, work, achievements, livestreams, events, and the places where people can follow along.',
  location: 'Based online, building in public',
  email: 'contact@stotteyman.com',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://stotteyman.com',
  socialHandle: '@stotteyman',
} as const;

export const navigationItems = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/services', label: 'Services' },
  { href: '/mindset', label: 'Mindset' },
  { href: '/blog', label: 'Writing' },
  { href: '/follow', label: 'Follow' },
  { href: '/events', label: 'Events' },
  { href: '/stream', label: 'Livestream' },
  { href: '/donate', label: 'Donate' },
  { href: '/contact', label: 'Contact' },
  { href: '/consult', label: 'Work with me' },
] as const;

export const homepageSections = [
  {
    title: 'Mindset',
    href: '/mindset',
    eyebrow: 'How I think',
    description:
      'The principles behind how I build, adapt, recover momentum, and keep a public record of my work.',
  },
  {
    title: 'Achievements',
    href: '/achievements',
    eyebrow: 'What I have done',
    description:
      'A structured place to document projects, milestones, and proof of contribution instead of letting the work disappear.',
  },
  {
    title: 'Writing',
    href: '/blog',
    eyebrow: 'What I am thinking about',
    description:
      'Short-form entries about growth, work in progress, and the ideas driving the next chapter.',
  },
  {
    title: 'Follow',
    href: '/follow',
    eyebrow: 'Where to find me',
    description:
      'Social platforms, community links, and the channels where updates show up first.',
  },
  {
    title: 'Events',
    href: '/events',
    eyebrow: 'What is coming up',
    description:
      'Live sessions, launches, community appearances, and places where people can check in.',
  },
  {
    title: 'Livestream',
    href: '/stream',
    eyebrow: 'What is live right now',
    description:
      'A dedicated stream page with the Kick embed, chat, and support links.',
  },
] as const;

export const mindsetPrinciples = [
  {
    title: 'Build in public',
    body:
      'If the work matters, it deserves a record. This site exists to preserve context, momentum, and ownership of what I create.',
  },
  {
    title: 'Keep proof close',
    body:
      'Ideas are easy to dismiss when they are scattered. I prefer visible artifacts, updates, shipped pages, and working links.',
  },
  {
    title: 'Make progress legible',
    body:
      'Progress is not only finished launches. It is also research, prototypes, iteration, community building, and staying consistent.',
  },
  {
    title: 'Own the narrative',
    body:
      'When recognition is inconsistent, documentation matters. I would rather show the timeline and let the work speak clearly.',
  },
] as const;

export const achievements = [
  {
    title: 'Portfolio platform rebuilt as a public record',
    summary:
      'Reframed the site into a focused portfolio that highlights mindset, work, updates, and contact paths instead of burying them inside a single screen.',
    impact: 'Clearer proof of work, easier navigation, stronger SEO, and better long-term maintainability.',
  },
  {
    title: 'Education platform concept in active development',
    summary:
      'Established the foundation for a broader learning experience centered on practical teaching, layered delivery, and interactive growth.',
    impact: 'Creates a home for teaching, long-term audience building, and future product expansion.',
  },
  {
    title: 'Livestream and community presence',
    summary:
      'Maintained a live content channel so people can follow the work process, react in real time, and stay connected between releases.',
    impact: 'Keeps momentum visible and turns isolated work into an ongoing public story.',
  },
  {
    title: 'Cross-discipline creative workflow',
    summary:
      'Combined design instincts, technical execution, writing, and direct audience communication inside one brand surface.',
    impact: 'Makes the work easier to understand, trust, and follow across multiple mediums.',
  },
] as const;

export const activeProjects = [
  {
    title: 'Stotteyman.com',
    status: 'Active',
    description:
      'The main portfolio hub for documenting contributions, publishing updates, and directing people to the right channels.',
    link: '/',
    external: false,
  },
  {
    title: 'Education Platform',
    status: 'In progress',
    description:
      'A long-form learning space for practical education, experiments, and a more structured teaching experience.',
    link: 'https://learn.stotteyman.com',
    external: true,
  },
  {
    title: 'Kick Livestream',
    status: 'Live channel',
    description:
      'The current live broadcast space for conversation, community interaction, and real-time visibility into the work.',
    link: 'https://kick.com/stotteyman',
    external: true,
  },
] as const;

export const writingEntries = [
  {
    slug: 'why-this-site-exists',
    title: 'Why this site exists',
    date: '2026-04-23',
    excerpt:
      'This portfolio is less about posing and more about keeping a permanent, visible record of the work and mindset behind it.',
  },
  {
    slug: 'building-with-proof',
    title: 'Building with proof instead of noise',
    date: '2026-04-23',
    excerpt:
      'A note on documentation, momentum, and why real links, shipped pages, and living updates matter more than vague claims.',
  },
  {
    slug: 'what-i-want-people-to-follow',
    title: 'What I want people to follow',
    date: '2026-04-23',
    excerpt:
      'A quick map of the channels, events, streams, and projects that matter most right now.',
  },
] as const;

export const socialLinks = [
  {
    platform: 'Kick',
    url: 'https://kick.com/stotteyman',
    description: 'Live streams, chat, and stream support.',
  },
  {
    platform: 'Discord',
    url: 'https://discord.gg/9zbyfPyp3E',
    description: 'Community hub for updates, alerts, and conversation between streams.',
  },
  {
    platform: 'GitHub',
    url: 'https://github.com/stotteyman',
    description: 'Code, experiments, and technical public work.',
  },
  {
    platform: 'X / Twitter',
    url: 'https://twitter.com/stotteyman',
    description: 'Fast updates, short thoughts, and public signals.',
  },
  {
    platform: 'LinkedIn',
    url: 'https://linkedin.com/in/stotteyman',
    description: 'Professional profile and longer-term credibility trail.',
  },
  {
    platform: 'Instagram',
    url: 'https://instagram.com/stotteyman',
    description: 'Visual snapshots and creative identity.',
  },
] as const;

export const upcomingEvents = [
  {
    title: 'Weekly livestream session',
    window: 'Ongoing',
    description:
      'Regular live sessions focused on gameplay, project discussion, creative work, and audience interaction.',
    cta: { label: 'Open stream page', href: '/stream', external: false },
  },
  {
    title: 'Education platform checkpoints',
    window: 'Rolling updates',
    description:
      'Milestone updates for the learning platform, including structure, feature direction, and public progress notes.',
    cta: { label: 'Visit the platform', href: 'https://learn.stotteyman.com', external: true },
  },
  {
    title: 'Community drop-ins',
    window: 'As announced',
    description:
      'Informal appearances, conversation spaces, and live touchpoints promoted through Discord and stream alerts.',
    cta: { label: 'Join Discord', href: 'https://discord.gg/9zbyfPyp3E', external: true },
  },
] as const;

export const contactMethods = [
  {
    label: 'Email',
    value: 'contact@stotteyman.com',
    href: 'mailto:contact@stotteyman.com',
  },
  {
    label: 'Discord',
    value: 'Community invite',
    href: 'https://discord.gg/9zbyfPyp3E',
  },
  {
    label: 'Kick',
    value: 'kick.com/stotteyman',
    href: 'https://kick.com/stotteyman',
  },
] as const;

export const stackReadiness = [
  'Static-first site architecture for easy deployment on Netlify or Vercel.',
  'Centralized content in TypeScript so Supabase can replace local arrays later without changing page structure.',
  'No database required for the current public experience: the site is driven by links, copy, and embeds.',
  'Clear routes for future Supabase-backed content like posts, events, contact submissions, and live updates.',
] as const;