'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

import Wizard, {
  Choice,
  MultiChoice,
  ReviewRow,
  TextArea,
  TextField,
  type WizardStep,
} from '@/components/wizard/Wizard';
import { supabase } from '@/lib/supabase';

/**
 * The server builder.
 *
 * Turns "I want a server" into a spec sheet: game, slot count, the systems that have
 * to exist behind it, and the hardware that actually runs that combination. The spec
 * is computed live as the answers change, so the visitor leaves with something useful
 * whether or not they ever send the request.
 *
 * **It does not quote money.** Sizing is a technical question with defensible answers;
 * price depends on rates and hosting deals that are not in this codebase, and a number
 * invented here would be a number quoted back at me later. The flow says so plainly
 * and routes the request to the same consultation queue as everything else.
 */

/**
 * Indicative sizing per game. RAM in GB.
 *
 * These are starting points from how these servers actually behave, not vendor
 * minimums — vendor minimums are for an empty server with no mods, which is not a
 * thing anybody runs. Adjust the table, not the callers, when reality disagrees.
 */
const GAMES = [
  {
    value: 'reforger',
    label: 'Arma Reforger',
    hint: 'Enfusion — the one I run daily',
    ramBase: 6,
    ramPerPlayer: 0.07,
    cores: 6,
    maxSlots: 128,
    note: 'Enfusion is single-thread bound: clock speed matters more than core count.',
  },
  {
    value: 'arma3',
    label: 'Arma 3',
    hint: 'Real Virtuality, headless clients',
    ramBase: 5,
    ramPerPlayer: 0.06,
    cores: 6,
    maxSlots: 100,
    note: 'Budget a headless client per ~30 AI-heavy slots or the server tick collapses.',
  },
  {
    value: 'dayz',
    label: 'DayZ',
    hint: 'Persistent survival',
    ramBase: 6,
    ramPerPlayer: 0.05,
    cores: 4,
    maxSlots: 100,
    note: 'Persistence grows on disk forever without a scheduled wipe or cleanup policy.',
  },
  {
    value: 'minecraft',
    label: 'Minecraft',
    hint: 'Java, Bedrock or crossplay',
    ramBase: 4,
    ramPerPlayer: 0.06,
    cores: 4,
    maxSlots: 200,
    note: 'Crossplay pins the version, and pinning the version kills most client mods.',
  },
  {
    value: 'rust',
    label: 'Rust',
    hint: 'Wipe-cycle survival',
    ramBase: 8,
    ramPerPlayer: 0.09,
    cores: 6,
    maxSlots: 300,
    note: 'Map size drives memory harder than player count does.',
  },
  {
    value: 'other',
    label: 'Something else',
    hint: 'Tell me what it is',
    ramBase: 6,
    ramPerPlayer: 0.06,
    cores: 4,
    maxSlots: 500,
    note: 'Sizing confirmed once I know the engine.',
  },
] as const;

/** Each system adds real overhead, so each one carries its own cost. */
const SYSTEMS = [
  { value: 'persistence', label: 'Persistent progression', hint: 'Players keep gear, stats and position', ram: 1 },
  { value: 'economy', label: 'In-game economy', hint: 'Currency, banking, shops, jobs', ram: 1 },
  { value: 'roles', label: 'Whitelist and roles', hint: 'Applications, tiers, staff permissions', ram: 0.5 },
  { value: 'discord', label: 'Discord integration', hint: 'Roles, alerts and admin from Discord', ram: 0.5 },
  { value: 'webstats', label: 'Web stats and profiles', hint: 'A site that reads live server data', ram: 1 },
  { value: 'admin', label: 'Admin and anti-cheat tooling', hint: 'Bans, logs, live moderation', ram: 0.5 },
  { value: 'custom', label: 'Custom gameplay scripting', hint: 'Systems that do not exist in the base game', ram: 1 },
] as const;

const HOSTING = [
  { value: 'managed', label: 'You host and run it', hint: 'I provide the box and keep it alive' },
  { value: 'build-only', label: 'Build it, I run it', hint: 'You get the config and the mods' },
  { value: 'existing', label: 'I already have hosting', hint: 'Work with what is there' },
  { value: 'unsure', label: 'Not sure yet', hint: 'Advise me' },
] as const;

type GameValue = (typeof GAMES)[number]['value'];
type SystemValue = (typeof SYSTEMS)[number]['value'];

const SLOTS = [16, 32, 64, 100, 128, 200] as const;

const labelOf = <T extends { value: string; label: string }>(list: readonly T[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;

export default function BuildClient() {
  const [game, setGame] = useState<GameValue>('reforger');
  const [slots, setSlots] = useState<number>(64);
  const [systems, setSystems] = useState<SystemValue[]>([]);
  const [hosting, setHosting] = useState<(typeof HOSTING)[number]['value']>('managed');
  const [notes, setNotes] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [community, setCommunity] = useState('');

  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const honeypot = useRef('');
  const renderedAt = useRef(Date.now());

  const spec = useMemo(() => {
    const g = GAMES.find((x) => x.value === game)!;
    const systemRam = systems.reduce(
      (sum, s) => sum + (SYSTEMS.find((x) => x.value === s)?.ram ?? 0),
      0
    );
    const raw = g.ramBase + g.ramPerPlayer * slots + systemRam;
    // Round up to a size anyone can actually rent, and never below the base.
    const ram = [8, 12, 16, 24, 32, 48, 64, 96, 128].find((r) => r >= raw) ?? 128;
    const cores = g.cores + (slots > 100 ? 2 : 0) + (systems.length >= 4 ? 2 : 0);
    const db = systems.some((s) => ['persistence', 'economy', 'webstats', 'roles'].includes(s));

    return { game: g, ram, cores, db, systemRam, raw };
  }, [game, slots, systems]);

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Game',
        heading: 'Which game is it?',
        hint: 'Sizing, mod tooling and the failure modes are all different per engine.',
        body: <Choice options={GAMES} value={game} onChange={setGame} />,
      },
      {
        title: 'Size',
        heading: 'How many players at once?',
        hint: 'Peak concurrent, not total members. Rounding up is cheaper than rebuilding.',
        body: (
          <div className="grid gap-6">
            <Choice
              options={SLOTS.filter((s) => s <= spec.game.maxSlots).map((s) => ({
                value: String(s),
                label: `${s} slots`,
              }))}
              value={String(slots)}
              onChange={(v) => setSlots(Number(v))}
              columns={3}
            />
            <p className="rounded-lg border border-line bg-bg px-4 py-3 text-body-sm text-fg-muted">
              {spec.game.note}
            </p>
          </div>
        ),
      },
      {
        title: 'Systems',
        heading: 'What has to exist behind it?',
        hint: 'This is the part that separates a rented server from a community that keeps people.',
        body: <MultiChoice options={SYSTEMS} values={systems} onChange={setSystems} />,
      },
      {
        title: 'Hosting',
        heading: 'Who runs it once it is built?',
        body: (
          <div className="grid gap-6">
            <Choice options={HOSTING} value={hosting} onChange={setHosting} />
            <TextArea
              label="Anything else I should know"
              value={notes}
              rows={4}
              onChange={setNotes}
              placeholder="Existing community size, mods you already use, a deadline, a budget."
            />
          </div>
        ),
      },
      {
        title: 'You',
        heading: 'Where do I send the spec?',
        body: (
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField label="Your name" value={name} onChange={setName} autoComplete="name" required />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              autoComplete="email"
              required
            />
            <TextField
              label="Community name"
              value={community}
              onChange={setCommunity}
              placeholder="If it already exists"
            />
          </div>
        ),
        validate: () => {
          if (name.trim().length < 2) return 'I need a name to reply to.';
          if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return 'That email does not look right.';
          return null;
        },
      },
    ],
    [community, email, game, hosting, name, notes, slots, spec.game, systems]
  );

  const submit = useCallback(async () => {
    if (honeypot.current) {
      setState('sent');
      return;
    }
    if (Date.now() - renderedAt.current < 3000) {
      setError('That was quick — give it a moment and try again.');
      setState('error');
      return;
    }

    setState('sending');
    setError('');

    const brief = [
      `SERVER BUILD REQUEST`,
      `Game: ${spec.game.label}`,
      `Peak slots: ${slots}`,
      `Systems: ${systems.length ? systems.map((s) => labelOf(SYSTEMS, s)).join(', ') : 'none selected'}`,
      `Hosting: ${labelOf(HOSTING, hosting)}`,
      `Computed spec: ${spec.ram} GB RAM, ${spec.cores} vCPU${spec.db ? ', managed Postgres' : ''}`,
      community.trim() ? `Community: ${community.trim()}` : '',
      '',
      notes.trim() || 'No additional notes.',
    ]
      .filter(Boolean)
      .join('\n');

    const { error: rpcError } = await supabase.rpc('submit_consultation_request', {
      p_name: name.trim(),
      p_email: email.trim(),
      p_company: community.trim() || null,
      // Constrained to four values in the database; a build is a consultation that
      // arrives already scoped. The first line of the brief is what identifies it.
      p_request_type: 'consultation',
      p_topic: `Server build — ${spec.game.label}, ${slots} slots`,
      p_details: brief.slice(0, 5000),
      p_budget_band: 'Not sure yet',
      p_preferred_times: null,
      p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    });

    if (rpcError) {
      setError(rpcError.message);
      setState('error');
      return;
    }
    setState('sent');
  }, [community, email, hosting, name, notes, slots, spec, systems]);

  if (state === 'sent') {
    return (
      <div className="rounded-xl border border-ok/30 bg-ok/10 p-8 md:p-10">
        <p className="font-mono text-label uppercase text-ok">Spec sent</p>
        <h2 className="mt-4 text-display-md font-medium text-fg">
          {spec.game.label}, {slots} slots — {spec.ram} GB / {spec.cores} vCPU.
        </h2>
        <p className="mt-4 max-w-prose text-body text-fg-muted">
          That is the build I will price up. I will come back to you at{' '}
          <span className="text-fg">{email}</span> with what it costs to build and what it
          costs to keep running — those are two different numbers and you should see both.
        </p>
      </div>
    );
  }

  return (
    <>
      <Wizard
        steps={steps}
        state={state}
        error={error}
        onSubmit={submit}
        submitLabel="Send this spec"
        aside={
          <div className="rounded-lg border border-accent-line bg-accent-soft p-4">
            <p className="font-mono text-label uppercase text-accent">Spec so far</p>
            <dl className="mt-3 grid gap-1.5 text-body-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-fg-subtle">Memory</dt>
                <dd className="font-mono text-fg">{spec.ram} GB</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg-subtle">vCPU</dt>
                <dd className="font-mono text-fg">{spec.cores}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-fg-subtle">Database</dt>
                <dd className="font-mono text-fg">{spec.db ? 'Postgres' : 'None'}</dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-accent-line pt-3 text-body-sm text-fg-subtle">
              Indicative sizing. Price comes from me after I read it — I am not going to
              have a form guess at your invoice.
            </p>
          </div>
        }
        review={
          <dl>
            <ReviewRow label="Game" value={spec.game.label} />
            <ReviewRow label="Peak players" value={`${slots} concurrent`} />
            <ReviewRow
              label="Systems"
              value={systems.length ? systems.map((s) => labelOf(SYSTEMS, s)).join(', ') : 'None'}
            />
            <ReviewRow label="Hosting" value={labelOf(HOSTING, hosting)} />
            <ReviewRow
              label="Computed spec"
              value={`${spec.ram} GB RAM · ${spec.cores} vCPU${spec.db ? ' · managed Postgres' : ''}`}
            />
            <ReviewRow label="Notes" value={<span className="whitespace-pre-wrap">{notes.trim()}</span>} />
            <ReviewRow label="Name" value={name} />
            <ReviewRow label="Email" value={email} />
            <ReviewRow label="Community" value={community} />
          </dl>
        }
      />

      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input
            tabIndex={-1}
            autoComplete="off"
            onChange={(e) => {
              honeypot.current = e.target.value;
            }}
          />
        </label>
      </div>
    </>
  );
}
