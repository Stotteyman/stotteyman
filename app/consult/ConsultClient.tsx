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
 * The project scoping flow.
 *
 * Was a single long form: eight fields and a 20-character-minimum textarea, all
 * visible at once, which is a wall to look at and produced briefs with the useful
 * parts missing. Same destination — `submit_consultation_request` — but the answers
 * arrive structured, so a request now says what it is for rather than just "hi".
 *
 * `p_request_type` is constrained in the database to four values. The richer detail
 * (scope, scale, timeline) is folded into `p_details` rather than added as columns,
 * so this needed no migration and HQ's existing queue reads it unchanged.
 */

const TYPES = [
  { value: 'consultation', label: 'Consultation', hint: 'Paid advice on a specific problem' },
  { value: 'collaboration', label: 'Collaboration', hint: 'Building something together' },
  { value: 'meeting', label: 'Intro call', hint: 'Work out whether there is a fit' },
  { value: 'help', label: 'Something is broken', hint: 'You need a hand, fast' },
] as const;

const SCOPE = [
  { value: 'game-server', label: 'Game server', hint: 'Hosting, mods, persistence, live ops' },
  { value: 'platform', label: 'Community platform', hint: 'Accounts, roles, Discord, memberships' },
  { value: 'storefront', label: 'Storefront', hint: 'Products, Stripe, fulfilment' },
  { value: 'tooling', label: 'Internal tooling', hint: 'Dashboards, automation, back office' },
  { value: 'website', label: 'Website or brand', hint: 'Design and build from scratch' },
  { value: 'rescue', label: 'Rescue an existing build', hint: 'Inherit, stabilise, finish it' },
] as const;

const SCALE = [
  { value: 'idea', label: 'Just an idea', hint: 'Nothing built yet' },
  { value: 'prototype', label: 'Prototype exists', hint: 'Something runs, roughly' },
  { value: 'live-small', label: 'Live, small', hint: 'Real users, under a few hundred' },
  { value: 'live-large', label: 'Live, at scale', hint: 'Thousands of users or more' },
] as const;

const TIMELINE = [
  { value: 'urgent', label: 'Urgent', hint: 'Days — something is on fire' },
  { value: 'weeks', label: 'Weeks', hint: 'A defined near-term deadline' },
  { value: 'quarter', label: 'This quarter', hint: 'Planned, not panicked' },
  { value: 'exploring', label: 'No deadline', hint: 'Working out what is possible' },
] as const;

const BUDGETS = [
  'Not sure yet',
  'Under $1k',
  '$1k – $5k',
  '$5k – $20k',
  '$20k+',
  'Equity / rev share',
] as const;

type ScopeValue = (typeof SCOPE)[number]['value'];

const labelOf = <T extends { value: string; label: string }>(list: readonly T[], v: string) =>
  list.find((o) => o.value === v)?.label ?? v;

export default function ConsultClient() {
  const [type, setType] = useState<(typeof TYPES)[number]['value']>('consultation');
  const [scope, setScope] = useState<ScopeValue[]>([]);
  const [scale, setScale] = useState<(typeof SCALE)[number]['value']>('idea');
  const [timeline, setTimeline] = useState<(typeof TIMELINE)[number]['value']>('quarter');
  const [budget, setBudget] = useState<string>('Not sure yet');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [times, setTimes] = useState('');

  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  // Honeypot + render timestamp: bots fill hidden fields and submit instantly.
  const honeypot = useRef('');
  const renderedAt = useRef(Date.now());

  const steps: WizardStep[] = useMemo(
    () => [
      {
        title: 'Need',
        heading: 'What do you need?',
        hint: 'This decides how I reply — an intro call gets times, a fire gets an answer.',
        body: <Choice options={TYPES} value={type} onChange={setType} />,
      },
      {
        title: 'Scope',
        heading: 'What is it you are building?',
        hint: 'Pick everything that applies. Most real projects touch two or three.',
        body: (
          <div className="grid gap-8">
            <MultiChoice options={SCOPE} values={scope} onChange={setScope} />
            <div>
              <p className="mb-3 font-mono text-label uppercase text-fg-subtle">Where is it today?</p>
              <Choice options={SCALE} value={scale} onChange={setScale} />
            </div>
          </div>
        ),
        validate: () => (scope.length ? null : 'Pick at least one thing you are building.'),
      },
      {
        title: 'Detail',
        heading: 'Tell me what is actually going on.',
        hint: 'What exists now, what you want instead, and anything that has already failed.',
        body: (
          <div className="grid gap-6">
            <TextField
              label="One-line summary"
              value={topic}
              onChange={setTopic}
              placeholder="e.g. Reforger server keeps wiping player data"
            />
            <TextArea
              label="The situation"
              value={details}
              onChange={setDetails}
              minLength={20}
              placeholder="The more context the better. What exists today, what you want instead, and any deadline."
            />
          </div>
        ),
        validate: () =>
          details.trim().length >= 20 ? null : 'Give me at least a sentence or two to work with.',
      },
      {
        title: 'Shape',
        heading: 'Timeline and budget.',
        hint: 'A band is enough. It tells me what shape of answer is useful — not whether I reply.',
        body: (
          <div className="grid gap-8">
            <Choice options={TIMELINE} value={timeline} onChange={setTimeline} />
            <div>
              <p className="mb-3 font-mono text-label uppercase text-fg-subtle">Budget band</p>
              <Choice
                options={BUDGETS.map((b) => ({ value: b, label: b }))}
                value={budget}
                onChange={setBudget}
                columns={3}
              />
            </div>
          </div>
        ),
      },
      {
        title: 'You',
        heading: 'Where do I send the reply?',
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
            <TextField label="Company or project" value={company} onChange={setCompany} />
            <TextField
              label="Good times to talk"
              value={times}
              onChange={setTimes}
              placeholder="e.g. weekday evenings UK"
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
    [budget, company, details, email, name, scale, scope, timeline, times, topic, type]
  );

  const submit = useCallback(async () => {
    if (honeypot.current) {
      setState('sent'); // Silently accept, so a bot learns nothing.
      return;
    }
    if (Date.now() - renderedAt.current < 3000) {
      setError('That was quick — give it a moment and try again.');
      setState('error');
      return;
    }

    setState('sending');
    setError('');

    // The structured answers are prepended to the free text so the brief survives in
    // one field. `p_details` is capped at 5000 in the database; the block is ~250.
    const brief = [
      `Scope: ${scope.map((s) => labelOf(SCOPE, s)).join(', ')}`,
      `Stage: ${labelOf(SCALE, scale)}`,
      `Timeline: ${labelOf(TIMELINE, timeline)}`,
      '',
      details.trim(),
    ].join('\n');

    const { error: rpcError } = await supabase.rpc('submit_consultation_request', {
      p_name: name.trim(),
      p_email: email.trim(),
      p_company: company.trim() || null,
      p_request_type: type,
      p_topic: topic.trim() || null,
      p_details: brief.slice(0, 5000),
      p_budget_band: budget,
      p_preferred_times: times.trim() || null,
      p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    });

    if (rpcError) {
      setError(rpcError.message);
      setState('error');
      return;
    }
    setState('sent');
  }, [budget, company, details, email, name, scale, scope, timeline, times, topic, type]);

  if (state === 'sent') {
    return (
      <div className="rounded-xl border border-ok/30 bg-ok/10 p-8 md:p-10">
        <p className="font-mono text-label uppercase text-ok">Request received</p>
        <h2 className="mt-4 text-display-md font-medium text-fg">
          Thanks {name.split(' ')[0] || 'for reaching out'} — it is in the queue.
        </h2>
        <p className="mt-4 max-w-prose text-body text-fg-muted">
          I read every one of these personally and will come back to you at{' '}
          <span className="text-fg">{email}</span>. If it is urgent, the Discord in the footer
          is the fastest way to reach me.
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
        submitLabel="Send request"
        aside={
          <div className="rounded-lg border border-line bg-bg-raised p-4">
            <p className="font-mono text-label uppercase text-fg-subtle">Brief so far</p>
            <p className="mt-3 text-body-sm text-fg-muted">
              {scope.length
                ? scope.map((s) => labelOf(SCOPE, s)).join(' · ')
                : 'Nothing selected yet'}
            </p>
            <p className="mt-2 text-body-sm text-fg-faint">{budget}</p>
          </div>
        }
        review={
          <dl>
            <ReviewRow label="Request" value={labelOf(TYPES, type)} />
            <ReviewRow label="Scope" value={scope.map((s) => labelOf(SCOPE, s)).join(', ')} />
            <ReviewRow label="Stage" value={labelOf(SCALE, scale)} />
            <ReviewRow label="Timeline" value={labelOf(TIMELINE, timeline)} />
            <ReviewRow label="Budget" value={budget} />
            <ReviewRow label="Summary" value={topic} />
            <ReviewRow
              label="Detail"
              value={<span className="whitespace-pre-wrap">{details.trim()}</span>}
            />
            <ReviewRow label="Name" value={name} />
            <ReviewRow label="Email" value={email} />
            <ReviewRow label="Company" value={company} />
            <ReviewRow label="Good times" value={times} />
          </dl>
        }
      />

      {/* Honeypot — hidden from people, irresistible to bots. */}
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

      <p className="mt-8 max-w-prose text-body-sm text-fg-faint">
        No account needed and nothing is shared with anyone. Your details are used only to reply
        to this request.
      </p>
    </>
  );
}
