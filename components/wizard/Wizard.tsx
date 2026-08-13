'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * The shared step-through shell behind every guided flow on the site.
 *
 * Four flows need the same skeleton — a progress rail, one visible step, validation
 * that blocks Next rather than failing at submit, and a review screen. This owns all
 * of that so each flow only writes its own questions.
 *
 * Deliberate behaviours, each of which is a bug in most hand-rolled wizards:
 *
 *  - **Validation gates the step, not the submit.** `step.validate` returns a message
 *    and the Next button says why it is disabled. Discovering on step 5 that step 2
 *    was wrong is the thing that makes people abandon a form.
 *  - **Back never destroys answers.** Every step's state lives in the caller's single
 *    state object, so stepping back and forward again is lossless.
 *  - **The whole flow is one <form>.** Enter advances instead of submitting early,
 *    and browser autofill still works on the fields inside it.
 *  - **Focus moves to the new step heading** on every change, so a keyboard or screen
 *    reader user is not left at the bottom of the page reading the previous step.
 */

export type WizardStep = {
  /** Short label for the rail. Keep to one or two words. */
  title: string;
  /** The question, asked in full, above the fields. */
  heading: string;
  hint?: string;
  body: ReactNode;
  /** Return a message to block Next, or null/undefined to allow it. */
  validate?: () => string | null | undefined;
};

type Props = {
  steps: WizardStep[];
  /** Rendered as the final step. Give people the whole picture before they commit. */
  review: ReactNode;
  submitLabel: string;
  submittingLabel?: string;
  onSubmit: () => Promise<void> | void;
  state: 'idle' | 'sending' | 'error';
  error?: string;
  /** Shown under the rail — e.g. a running price estimate. */
  aside?: ReactNode;
};

export default function Wizard({
  steps,
  review,
  submitLabel,
  submittingLabel = 'Sending…',
  onSubmit,
  state,
  error,
  aside,
}: Props) {
  const [index, setIndex] = useState(0);
  const [touched, setTouched] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const total = steps.length + 1; // + review
  const onReview = index === steps.length;
  const current = steps[index];

  const blocker = useMemo(() => {
    if (onReview) return null;
    return current?.validate?.() ?? null;
  }, [current, onReview]);

  useEffect(() => {
    // Skip the initial mount: stealing focus on page load drops a visitor into the
    // middle of the page before they have read the heading above it.
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [index]);

  const next = useCallback(() => {
    if (blocker) {
      setTouched(true);
      return;
    }
    setTouched(false);
    setIndex((i) => Math.min(i + 1, steps.length));
  }, [blocker, steps.length]);

  const back = useCallback(() => {
    setTouched(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (state === 'sending') return;
      if (!onReview) {
        next();
        return;
      }
      void onSubmit();
    },
    [next, onReview, onSubmit, state]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
      {/* ── Rail ────────────────────────────────────────────────────────────── */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ol className="flex gap-2 lg:flex-col lg:gap-0">
          {[...steps.map((s) => s.title), 'Review'].map((title, i) => {
            const done = i < index;
            const now = i === index;
            return (
              <li key={title} className="flex-1 lg:flex-none">
                <button
                  type="button"
                  // Jumping forward past an unanswered step would land on a review
                  // screen full of blanks, so only completed steps are clickable.
                  disabled={i > index}
                  onClick={() => setIndex(i)}
                  className={`group flex w-full items-center gap-3 rounded-md py-2 text-left transition-colors duration-fast lg:px-2 ${
                    i > index ? 'cursor-default' : 'hover:bg-surface'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors duration-fast ${
                      now
                        ? 'border-accent bg-accent text-accent-ink'
                        : done
                          ? 'border-accent-line bg-accent-soft text-accent'
                          : 'border-line text-fg-faint'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <span
                    className={`hidden text-body-sm lg:block ${
                      now ? 'text-fg' : done ? 'text-fg-muted' : 'text-fg-faint'
                    }`}
                  >
                    {title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        <p className="mt-4 font-mono text-label uppercase text-fg-faint lg:px-2">
          Step {index + 1} of {total}
        </p>

        {aside ? <div className="mt-6">{aside}</div> : null}
      </div>

      {/* ── Panel ───────────────────────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="min-w-0">
        <div className="rounded-xl border border-line bg-bg-raised p-6 md:p-9">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-display-md font-medium text-fg outline-none"
          >
            {onReview ? 'Check it over' : current.heading}
          </h2>
          {!onReview && current.hint ? (
            <p className="mt-3 max-w-prose text-body-sm text-fg-muted">{current.hint}</p>
          ) : null}
          {onReview ? (
            <p className="mt-3 max-w-prose text-body-sm text-fg-muted">
              Nothing has been sent yet. Change anything by clicking a step on the left.
            </p>
          ) : null}

          <div className="mt-8">{onReview ? review : current.body}</div>

          {touched && blocker ? (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-warn/30 bg-warn/10 px-4 py-3 text-body-sm text-warn"
            >
              {blocker}
            </p>
          ) : null}

          {state === 'error' && error ? (
            <p
              role="alert"
              className="mt-6 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-body-sm text-danger"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-line pt-7">
            {index > 0 ? (
              <button
                type="button"
                onClick={back}
                className="rounded-full border border-line px-5 py-2.5 text-body-sm text-fg-muted transition-colors duration-fast hover:border-line-strong hover:text-fg"
              >
                Back
              </button>
            ) : null}

            <button
              type="submit"
              disabled={state === 'sending'}
              // Not `disabled` when blocked: a disabled button gives no reason, cannot
              // be focused, and leaves people clicking a dead control. It is clickable
              // and explains itself instead.
              aria-disabled={Boolean(blocker) || undefined}
              className={`rounded-full px-6 py-2.5 text-body-sm font-medium transition-all duration-fast disabled:opacity-50 ${
                blocker
                  ? 'border border-line bg-surface text-fg-subtle'
                  : 'bg-accent text-accent-ink hover:bg-accent-hover'
              }`}
            >
              {state === 'sending' ? submittingLabel : onReview ? submitLabel : 'Continue'}
            </button>

            {blocker && touched ? null : blocker ? (
              <span className="text-body-sm text-fg-faint">{blocker}</span>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}

/* ── Field primitives, shared by all four flows ────────────────────────────── */

export function Choice<T extends string>({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: readonly { value: T; label: string; hint?: string }[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
}) {
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columns];
  return (
    <div className={`grid gap-3 ${cols}`.trim()}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <label
            key={o.value}
            className={`cursor-pointer rounded-lg border px-4 py-3.5 transition-colors duration-fast ${
              on
                ? 'border-accent-line bg-accent-soft'
                : 'border-line bg-bg hover:border-line-strong'
            }`}
          >
            <input
              type="radio"
              checked={on}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span className={`block text-body-sm font-medium ${on ? 'text-accent' : 'text-fg'}`}>
              {o.label}
            </span>
            {o.hint ? <span className="mt-1 block text-body-sm text-fg-subtle">{o.hint}</span> : null}
          </label>
        );
      })}
    </div>
  );
}

export function MultiChoice<T extends string>({
  options,
  values,
  onChange,
  columns = 2,
}: {
  options: readonly { value: T; label: string; hint?: string }[];
  values: readonly T[];
  onChange: (v: T[]) => void;
  columns?: 1 | 2 | 3;
}) {
  const cols = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3' }[columns];
  const toggle = (v: T) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <div className={`grid gap-3 ${cols}`.trim()}>
      {options.map((o) => {
        const on = values.includes(o.value);
        return (
          <label
            key={o.value}
            className={`flex cursor-pointer gap-3 rounded-lg border px-4 py-3.5 transition-colors duration-fast ${
              on
                ? 'border-accent-line bg-accent-soft'
                : 'border-line bg-bg hover:border-line-strong'
            }`}
          >
            <input type="checkbox" checked={on} onChange={() => toggle(o.value)} className="sr-only" />
            <span
              aria-hidden
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                on ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong text-transparent'
              }`}
            >
              ✓
            </span>
            <span>
              <span className={`block text-body-sm font-medium ${on ? 'text-accent' : 'text-fg'}`}>
                {o.label}
              </span>
              {o.hint ? <span className="mt-1 block text-body-sm text-fg-subtle">{o.hint}</span> : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-label uppercase text-fg-subtle">
        {label}
        {required ? <span className="text-accent"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-bg px-4 py-3 text-body-sm text-fg outline-none transition-colors duration-fast placeholder:text-fg-faint focus:border-accent-line"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 6,
  placeholder,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
  minLength?: number;
}) {
  const count = value.trim().length;
  return (
    <label className="grid gap-2">
      <span className="font-mono text-label uppercase text-fg-subtle">{label}</span>
      <textarea
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-bg px-4 py-3 text-body-sm leading-relaxed text-fg outline-none transition-colors duration-fast placeholder:text-fg-faint focus:border-accent-line"
      />
      {minLength ? (
        <span className={`text-body-sm ${count >= minLength ? 'text-fg-faint' : 'text-fg-subtle'}`}>
          {count} / {minLength} characters minimum
        </span>
      ) : null}
    </label>
  );
}

/** One line of the review screen. */
export function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <dt className="font-mono text-label uppercase text-fg-subtle">{label}</dt>
      <dd className="text-body-sm text-fg">{value || <span className="text-fg-faint">—</span>}</dd>
    </div>
  );
}
