'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import SiteShell from '@/components/SiteShell';
import Wizard, { Choice, MultiChoice, ReviewRow, type WizardStep } from '@/components/wizard/Wizard';
import { supabase } from '@/lib/supabase';

/**
 * Community onboarding.
 *
 * Was a grid of link cards — six equal-weight tiles, no order, no sense of what to do
 * first, and nothing that told you when you were done. This walks through it instead:
 * join, follow, turn alerts on, and finish with a page that knows what you skipped.
 *
 * **Nothing here is captured.** Joining a Discord and following a Kick channel happen
 * on Discord and Kick; this cannot do them for you and does not pretend to. Progress
 * is a local checklist so it survives a reload — it never leaves the browser, which is
 * also why the flow needs no account, no email and no database write.
 */

type SocialLink = { id: string; platform: string; url: string; description: string };

const PROGRESS_KEY = 'stotteyman_onboarding';

const GOALS = [
  { value: 'watch', label: 'Watch the streams', hint: 'Live on Kick, clips and VODs' },
  { value: 'play', label: 'Play on the servers', hint: 'Arma Reforger roleplay and more' },
  { value: 'build', label: 'Follow the builds', hint: 'What I am shipping and how' },
] as const;

const ALERTS = [
  { value: 'kick-notify', label: 'Kick notifications', hint: 'Bell icon on the channel page' },
  { value: 'discord-ping', label: 'Discord go-live ping', hint: 'Opt into the notify role' },
  { value: 'events', label: 'Event announcements', hint: 'Server nights and one-offs' },
] as const;

type GoalValue = (typeof GOALS)[number]['value'];
type AlertValue = (typeof ALERTS)[number]['value'];

/** Match a `public_links` row by platform name, falling back to a known-good URL. */
function pick(links: SocialLink[], needle: string, fallback: string) {
  return links.find((l) => l.platform.toLowerCase().includes(needle))?.url ?? fallback;
}

export default function FollowClient() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [goal, setGoal] = useState<GoalValue>('watch');
  const [joinedDiscord, setJoinedDiscord] = useState(false);
  const [followedKick, setFollowedKick] = useState(false);
  const [alerts, setAlerts] = useState<AlertValue[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase
      .from('public_links')
      .select('id, platform, url, description')
      .order('sort_order')
      .then(({ data }) => {
        if (data) setLinks(data as SocialLink[]);
      });
  }, []);

  // Restore progress. Wrapped because Safari private mode throws on localStorage.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PROGRESS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        goal?: GoalValue;
        discord?: boolean;
        kick?: boolean;
        alerts?: AlertValue[];
      };
      if (saved.goal) setGoal(saved.goal);
      setJoinedDiscord(Boolean(saved.discord));
      setFollowedKick(Boolean(saved.kick));
      if (Array.isArray(saved.alerts)) setAlerts(saved.alerts);
    } catch {
      /* no saved progress is a perfectly normal state */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ goal, discord: joinedDiscord, kick: followedKick, alerts })
      );
    } catch {
      /* progress is a convenience, never a requirement */
    }
  }, [alerts, followedKick, goal, joinedDiscord]);

  const discordUrl = pick(links, 'discord', 'https://discord.gg/9zbyfPyp3E');
  const kickUrl = pick(links, 'kick', 'https://kick.com/stotteyman');

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'You',
        heading: 'What brings you here?',
        hint: 'It only changes what I point you at last. Nothing is locked off either way.',
        body: <Choice options={GOALS} value={goal} onChange={setGoal} columns={1} />,
      },
      {
        title: 'Discord',
        heading: 'Join the Discord.',
        hint: 'This is where the servers, the announcements and everyone else actually are.',
        body: (
          <div className="grid gap-5">
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setJoinedDiscord(true)}
              className="flex items-center justify-between gap-4 rounded-lg border border-[#5865F2]/40 bg-[#5865F2]/10 px-5 py-4 transition-colors duration-fast hover:bg-[#5865F2]/20"
            >
              <span>
                <span className="block text-body font-medium text-fg">Open the invite</span>
                <span className="mt-1 block text-body-sm text-fg-muted">
                  Opens in a new tab — come back here after.
                </span>
              </span>
              <span aria-hidden className="text-body text-fg-subtle">
                ↗
              </span>
            </a>
            <Toggle
              checked={joinedDiscord}
              onChange={setJoinedDiscord}
              label="I'm in the Discord"
            />
          </div>
        ),
      },
      {
        title: 'Kick',
        heading: 'Follow on Kick.',
        hint: 'Following is what makes the go-live notification reach you at all.',
        body: (
          <div className="grid gap-5">
            <a
              href={kickUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => setFollowedKick(true)}
              className="flex items-center justify-between gap-4 rounded-lg border border-[#53FC18]/40 bg-[#53FC18]/10 px-5 py-4 transition-colors duration-fast hover:bg-[#53FC18]/20"
            >
              <span>
                <span className="block text-body font-medium text-fg">Open the channel</span>
                <span className="mt-1 block text-body-sm text-fg-muted">
                  Hit Follow, then the bell next to it.
                </span>
              </span>
              <span aria-hidden className="text-body text-fg-subtle">
                ↗
              </span>
            </a>
            <Toggle checked={followedKick} onChange={setFollowedKick} label="Followed on Kick" />
          </div>
        ),
      },
      {
        title: 'Alerts',
        heading: 'Decide how you want to hear about it.',
        hint: 'These are switches on Kick and Discord — tick what you have turned on.',
        body: <MultiChoice options={ALERTS} values={alerts} onChange={setAlerts} columns={1} />,
      },
    ],
    [alerts, discordUrl, followedKick, goal, joinedDiscord, kickUrl]
  );

  const finish = useCallback(() => setDone(true), []);

  const remaining = [
    !joinedDiscord && 'the Discord',
    !followedKick && 'the Kick follow',
    alerts.length === 0 && 'alerts',
  ].filter(Boolean) as string[];

  if (done) {
    return (
      <SiteShell
        eyebrow="Connected"
        title="That is you set up."
        intro="Everything below stays here if you want to come back and finish the rest."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-ok/30 bg-ok/10 p-6">
            <p className="font-mono text-label uppercase text-ok">Done</p>
            <ul className="mt-4 grid gap-2 text-body-sm text-fg">
              {joinedDiscord ? <li>✓ In the Discord</li> : null}
              {followedKick ? <li>✓ Following on Kick</li> : null}
              {alerts.map((a) => (
                <li key={a}>✓ {ALERTS.find((x) => x.value === a)?.label}</li>
              ))}
            </ul>
            {remaining.length ? (
              <p className="mt-5 border-t border-ok/20 pt-4 text-body-sm text-fg-muted">
                Still open: {remaining.join(', ')}.{' '}
                <button
                  type="button"
                  onClick={() => setDone(false)}
                  className="text-fg underline underline-offset-4"
                >
                  Go back
                </button>
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-line bg-bg-raised p-6">
            <p className="font-mono text-label uppercase text-accent">Because you said “{GOALS.find((g) => g.value === goal)?.label}”</p>
            <div className="mt-4 grid gap-3">
              {goal === 'watch' ? (
                <NextLink href="/stream/" label="Watch the stream here" hint="Player and live chat on one page" />
              ) : null}
              {goal === 'play' ? (
                <NextLink href="/events/" label="See what is running" hint="Server nights and events" />
              ) : null}
              {goal === 'build' ? (
                <NextLink href="/blog/" label="Read the build notes" hint="What I am shipping and why" />
              ) : null}
              <NextLink href="/donate/" label="Support the stream" hint="Tips, song requests, shoutouts" />
            </div>
          </div>
        </div>

        {links.length ? (
          <div className="mt-12 border-t border-line pt-10">
            <p className="font-mono text-label uppercase text-fg-subtle">Every other link</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-line bg-surface p-5 transition-colors duration-base hover:border-line-strong hover:bg-surface-hover"
                >
                  <p className="font-mono text-label uppercase text-accent">{link.platform}</p>
                  <p className="mt-3 text-body-sm text-fg-muted">{link.description}</p>
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </SiteShell>
    );
  }

  return (
    <SiteShell
      eyebrow="Get connected"
      title="Four steps and you will not miss anything again."
      intro="Nothing is captured and no account is needed — this just walks you through it in the right order and remembers where you got to."
    >
      <Wizard
        steps={steps}
        state="idle"
        onSubmit={finish}
        submitLabel="Finish"
        aside={
          <div className="rounded-lg border border-line bg-bg-raised p-4">
            <p className="font-mono text-label uppercase text-fg-subtle">Checklist</p>
            <ul className="mt-3 grid gap-1.5 text-body-sm">
              <li className={joinedDiscord ? 'text-ok' : 'text-fg-faint'}>
                {joinedDiscord ? '✓' : '○'} Discord
              </li>
              <li className={followedKick ? 'text-ok' : 'text-fg-faint'}>
                {followedKick ? '✓' : '○'} Kick follow
              </li>
              <li className={alerts.length ? 'text-ok' : 'text-fg-faint'}>
                {alerts.length ? '✓' : '○'} Alerts ({alerts.length})
              </li>
            </ul>
          </div>
        }
        review={
          <dl>
            <ReviewRow label="Here for" value={GOALS.find((g) => g.value === goal)?.label} />
            <ReviewRow label="Discord" value={joinedDiscord ? 'Joined' : 'Not yet'} />
            <ReviewRow label="Kick" value={followedKick ? 'Following' : 'Not yet'} />
            <ReviewRow
              label="Alerts"
              value={
                alerts.length
                  ? alerts.map((a) => ALERTS.find((x) => x.value === a)?.label).join(', ')
                  : 'None on'
              }
            />
          </dl>
        }
      />
    </SiteShell>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden
        className={`flex h-5 w-5 items-center justify-center rounded border text-[11px] transition-colors duration-fast ${
          checked ? 'border-ok bg-ok text-accent-ink' : 'border-line-strong text-transparent'
        }`}
      >
        ✓
      </span>
      <span className={`text-body-sm ${checked ? 'text-fg' : 'text-fg-muted'}`}>{label}</span>
    </label>
  );
}

function NextLink({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 transition-colors duration-fast hover:border-accent-line hover:bg-accent-soft"
    >
      <span>
        <span className="block text-body-sm font-medium text-fg">{label}</span>
        <span className="mt-0.5 block text-body-sm text-fg-subtle">{hint}</span>
      </span>
      <span aria-hidden className="text-fg-faint transition-transform duration-fast group-hover:translate-x-1">
        →
      </span>
    </a>
  );
}
