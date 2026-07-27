'use client';

import { useCallback, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';

const TYPES = [
  { value: 'consultation', label: 'Consultation', hint: 'Paid advice on a specific problem' },
  { value: 'collaboration', label: 'Collaboration', hint: 'Building something together' },
  { value: 'meeting', label: 'Meeting', hint: 'An intro call to work out if there is a fit' },
  { value: 'help', label: 'Help', hint: 'Something is broken and you need a hand' },
];

const BUDGETS = ['Not sure yet', 'Under $1k', '$1k – $5k', '$5k – $20k', '$20k+', 'Equity / rev share'];

export default function ConsultClient() {
  const [type, setType] = useState('consultation');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState('');
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState('Not sure yet');
  const [times, setTimes] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  // Honeypot + render timestamp: bots fill hidden fields and submit instantly.
  const honeypot = useRef('');
  const renderedAt = useRef(Date.now());

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (state === 'sending') return;

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

      const { error: rpcError } = await supabase.rpc('submit_consultation_request', {
        p_name: name.trim(),
        p_email: email.trim(),
        p_company: company.trim() || null,
        p_request_type: type,
        p_topic: topic.trim() || null,
        p_details: details.trim(),
        p_budget_band: budget,
        p_preferred_times: times.trim() || null,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
      });

      if (rpcError) {
        setError(rpcError.message);
        setState('error');
      } else {
        setState('sent');
      }
    },
    [state, name, email, company, type, topic, details, budget, times]
  );

  if (state === 'sent') {
    return (
      <div className="rounded-[1.75rem] border border-emerald-500/30 bg-emerald-500/10 p-8">
        <h2 className="text-xl font-semibold text-white">Request received</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Thanks {name.split(' ')[0] || 'for reaching out'} — it is in the queue. I read every
          one of these personally and will come back to you at{' '}
          <span className="text-white">{email}</span>.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/45">
          If it is urgent, the Discord in the footer is the fastest way to reach me.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 md:p-8">
      <fieldset>
        <legend className="text-xs uppercase tracking-[0.2em] text-white/40">
          What do you need?
        </legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {TYPES.map((t) => (
            <label
              key={t.value}
              className={`cursor-pointer rounded-2xl border px-4 py-3 transition-colors ${
                type === t.value
                  ? 'border-white/50 bg-white/10'
                  : 'border-white/10 bg-black/20 hover:border-white/25'
              }`}
            >
              <input
                type="radio"
                name="request_type"
                value={t.value}
                checked={type === t.value}
                onChange={() => setType(t.value)}
                className="sr-only"
              />
              <span className="block text-sm font-medium text-white">{t.label}</span>
              <span className="mt-0.5 block text-xs text-white/45">{t.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Input label="Your name" required value={name} onChange={setName} autoComplete="name" />
        <Input
          label="Email"
          required
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <Input label="Company or project" value={company} onChange={setCompany} />
        <Input label="Topic" value={topic} onChange={setTopic} placeholder="One line summary" />
      </div>

      <label className="mt-5 grid gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-white/40">
          What are you trying to do?
        </span>
        <textarea
          required
          minLength={20}
          rows={6}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="The more context the better — what exists today, what you want instead, and any deadline."
          className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none focus:border-white/40"
        />
        <span className="text-xs text-white/25">{details.trim().length} characters — 20 minimum</span>
      </label>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-white/40">Budget</span>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
          >
            {BUDGETS.map((b) => (
              <option key={b} value={b} className="bg-[#07070a]">
                {b}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Good times to talk"
          value={times}
          onChange={setTimes}
          placeholder="e.g. weekday evenings"
        />
      </div>

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

      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-7 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-7 py-3 text-sm font-medium text-white transition-all duration-300 hover:border-white/40 hover:bg-white/15 disabled:opacity-50"
      >
        {state === 'sending' ? 'Sending…' : 'Send request'}
      </button>

      {error ? (
        <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <p className="mt-5 text-xs leading-relaxed text-white/30">
        No account needed and nothing is shared with anyone. Your details are used only to
        reply to this request.
      </p>
    </form>
  );
}

function Input({
  label,
  value,
  onChange,
  required,
  type = 'text',
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs uppercase tracking-[0.2em] text-white/40">
        {label}
        {required ? <span className="text-white/25"> *</span> : null}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/40"
      />
    </label>
  );
}
