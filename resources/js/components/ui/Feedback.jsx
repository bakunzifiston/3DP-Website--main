import Icon from './Icon.jsx';

const alertStyles = {
  success: { box: 'border-success/25 bg-success-bg text-success', icon: 'checkCircle' },
  error: { box: 'border-danger/25 bg-danger-bg text-danger', icon: 'alert' },
  warning: { box: 'border-warning/25 bg-warning-bg text-warning', icon: 'alert' },
  info: { box: 'border-navy-600/20 bg-navy-50 text-navy-700', icon: 'info' },
};

export function Alert({ tone = 'info', title, children, className = '', onDismiss }) {
  const s = alertStyles[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-md border px-4 py-3 text-[0.9rem] ${s.box} ${className}`}>
      <Icon name={s.icon} className="mt-0.5 h-[18px] w-[18px]" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-0.5 opacity-90' : ''}>{children}</div>}
      </div>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="-mr-1 h-6 w-6 cursor-pointer rounded opacity-70 hover:opacity-100" aria-label="Dismiss">
          <Icon name="x" className="mx-auto h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function Spinner({ className = 'h-5 w-5', label = 'Loading' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" role="status" aria-label={label}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function LoadingState({ label = 'Loading…', className = 'py-20' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-ink-faint ${className}`}>
      <Spinner className="h-6 w-6 text-navy-600" label={label} />
      <p className="text-[0.9rem]">{label}</p>
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title, children, action, className = 'py-16' }) {
  return (
    <div className={`flex flex-col items-center px-6 text-center ${className}`}>
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-600">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="text-[1.05rem]">{title}</h3>
      {children && <p className="mt-1.5 max-w-[42ch] text-[0.92rem] text-ink-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry, className = 'py-16' }) {
  const notFound = error?.status === 404;
  return (
    <div className={`flex flex-col items-center px-6 text-center ${className}`} role="alert">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger-bg text-danger">
        <Icon name="alert" className="h-6 w-6" />
      </span>
      <h3 className="text-[1.05rem]">{notFound ? 'We could not find that' : 'Something went wrong'}</h3>
      <p className="mt-1.5 max-w-[46ch] text-[0.92rem] text-ink-muted">
        {notFound ? 'It may have been moved or is no longer available.' : error?.message || 'Please try again in a moment.'}
      </p>
      {onRetry && !notFound && (
        <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-5">
          Try again
        </button>
      )}
    </div>
  );
}

const badgeTones = {
  neutral: 'bg-surface-2 text-ink-muted',
  navy: 'bg-navy-100 text-navy-700',
  gold: 'bg-gold-100 text-gold-700',
  teal: 'bg-teal-100 text-teal-600',
  success: 'bg-success-bg text-success',
  danger: 'bg-danger-bg text-danger',
  warning: 'bg-warning-bg text-warning',
};

export function Badge({ tone = 'neutral', children, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.75rem] font-semibold whitespace-nowrap ${badgeTones[tone]} ${className}`}>
      {children}
    </span>
  );
}
