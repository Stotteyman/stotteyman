import type { ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import type { InputHTMLAttributes } from 'react';

/**
 * Form controls. See BRAND.md §6.
 *
 * Errors render below the control in `--danger`, never as a placeholder swap or a
 * `title` tooltip — both of those hide the message from screen readers and from anyone
 * who has already started typing.
 */

const CONTROL =
  'w-full rounded-sm border border-line bg-bg-raised px-3.5 py-2.5 text-body-sm text-fg ' +
  'placeholder:text-fg-faint transition-colors duration-fast ' +
  'focus:border-accent/50 focus:outline-none ' +
  'disabled:opacity-45 disabled:pointer-events-none';

const ERROR_BORDER = 'border-danger/60';

type FieldShellProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export function FieldShell({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = '',
}: FieldShellProps) {
  return (
    <div className={`grid gap-2 ${className}`.trim()}>
      <label htmlFor={htmlFor} className="font-mono text-label uppercase text-fg-subtle">
        {label}
        {required ? <span className="ml-1 text-accent">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="text-body-sm text-fg-subtle">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-body-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type BaseProps = { label: string; hint?: string; error?: string | null };

export function Input({
  label,
  hint,
  error,
  className = '',
  id,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} required={rest.required}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${CONTROL} ${error ? ERROR_BORDER : ''} ${className}`.trim()}
        {...rest}
      />
    </FieldShell>
  );
}

export function Textarea({
  label,
  hint,
  error,
  className = '',
  id,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} required={rest.required}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${CONTROL} resize-y ${error ? ERROR_BORDER : ''} ${className}`.trim()}
        {...rest}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  error,
  className = '',
  id,
  children,
  ...rest
}: BaseProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint} error={error} required={rest.required}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${CONTROL} ${error ? ERROR_BORDER : ''} ${className}`.trim()}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
}

/** Exported so one-off controls inside larger layouts can match without the shell. */
export const controlClasses = CONTROL;
