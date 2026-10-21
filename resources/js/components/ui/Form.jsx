import { useId } from 'react';

// Accessible form field: wires label, hint and error to the control through aria attributes.
// Usage: <Field label="Email" error={errors.email}>{(props) => <input {...props} className="input" />}</Field>
export function Field({ label, hint, error, required, optional, className = '', children }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const control = children({
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [errorId, hintId].filter(Boolean).join(' ') || undefined,
    required,
  });
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
          {optional && <span className="ml-1.5 font-normal text-ink-faint">(optional)</span>}
        </label>
      )}
      {control}
      {error && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="hint">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Checkbox({ label, error, className = '', ...props }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-[0.9rem] text-ink-muted">
        <input
          id={id}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-[3px] h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-line-strong accent-navy-800"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && (
        <p id={`${id}-error`} className="field-error pl-[30px]">
          {error}
        </p>
      )}
    </div>
  );
}

// Toggle switch for booleans (e.g. "Published").
export function Switch({ checked, onChange, label, description, disabled }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="block cursor-pointer text-[0.9rem] font-medium text-ink">
          {label}
        </label>
        {description && <p className="text-[0.8rem] text-ink-faint">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
          checked ? 'bg-navy-800' : 'bg-line-strong'
        }`}
      >
        <span
          className={`inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[23px]' : 'translate-x-[3px]'
          }`}
        />
      </button>
    </div>
  );
}

// Visually hidden field that bots fill in and people never see (spam protection).
export function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
      </label>
    </div>
  );
}
