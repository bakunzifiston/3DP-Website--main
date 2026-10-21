// Admin-only UI primitives built on the shared design system.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import { Badge, Spinner } from '../components/ui/Feedback.jsx';

export function PageHeader({ title, description, back, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link to={back.to} className="mb-2 inline-flex items-center gap-1 text-[0.85rem] text-ink-faint no-underline hover:text-navy-800">
            <Icon name="arrowLeft" className="h-4 w-4" />
            {back.label}
          </Link>
        )}
        <h1 className="text-[1.6rem] leading-tight">{title}</h1>
        {description && <p className="mt-1 text-[0.92rem] text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Accessible modal dialog: traps Tab focus, closes on Escape / backdrop, restores focus on close.
export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const el = ref.current;
    (el.querySelector('[data-autofocus]') || el.querySelector(FOCUSABLE) || el).focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        const items = [...el.querySelectorAll(FOCUSABLE)];
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  const widths = { sm: 'max-w-[440px]', md: 'max-w-[600px]', lg: 'max-w-[920px]' };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 p-0 sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`flex max-h-[92vh] w-full ${widths[size]} animate-fade-up flex-col rounded-t-lg bg-surface shadow-lg outline-none sm:rounded-lg`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id="modal-title" className="text-[1.1rem]">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-ink-faint hover:bg-surface-2 hover:text-ink">
            <Icon name="x" className="h-[18px] w-[18px]" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}

// Confirmation dialog for destructive actions. onConfirm may return a promise; the button shows progress.
export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Delete', tone = 'danger' }) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={busy} data-autofocus>
            Cancel
          </button>
          <button type="button" className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={run} disabled={busy}>
            {busy && <Spinner className="h-4 w-4" />}
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-[0.95rem] text-ink-muted">{message}</p>
    </Modal>
  );
}

// Search box that reports its value after the user pauses typing.
export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  const [text, setText] = useState(value || '');
  useEffect(() => setText(value || ''), [value]);
  useEffect(() => {
    if (text === (value || '')) return;
    const t = setTimeout(() => onChange(text), 300);
    return () => clearTimeout(t);
  }, [text, value, onChange]);
  return (
    <div className={`relative ${className}`}>
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      <input type="search" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="input !py-2 pl-9" />
    </div>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div role="tablist" aria-label={label} className="-mb-px flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={`flex cursor-pointer items-center gap-2 border-b-2 px-3 py-2.5 text-[0.88rem] font-medium whitespace-nowrap transition-colors ${
              active ? 'border-navy-800 text-navy-800' : 'border-transparent text-ink-faint hover:text-ink'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`rounded-full px-1.5 text-[0.72rem] ${active ? 'bg-navy-800 text-white' : 'bg-surface-2 text-ink-muted'}`}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function Pagination({ page, pageSize, total, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 text-[0.85rem] text-ink-faint">
      <span>
        {from}–{to} of {total}
      </span>
      <div className="flex gap-2">
        <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <Icon name="chevronLeft" className="h-4 w-4" />
          Previous
        </button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
          Next
          <Icon name="chevronRight" className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}

export const statusTones = {
  // inquiries
  new: 'gold',
  read: 'neutral',
  replied: 'success',
  archived: 'neutral',
  // applications
  reviewing: 'navy',
  accepted: 'success',
  waitlisted: 'warning',
  rejected: 'danger',
  // content
  published: 'success',
  draft: 'neutral',
};

export function StatusBadge({ status }) {
  return <Badge tone={statusTones[status] || 'neutral'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
}

// Table wrapper: horizontal scroll on small screens, consistent cell styles.
export function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[0.9rem]">
        <thead>
          <tr className="border-b border-line bg-surface-2/60">
            {columns.map((c) => (
              <th key={c.label} scope="col" className={`px-4 py-2.5 text-[0.75rem] font-semibold tracking-wide text-ink-faint uppercase ${c.className || ''}`}>
                {c.srOnly ? <span className="sr-only">{c.label}</span> : c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function SkeletonRows({ rows = 5 }) {
  return (
    <div className="space-y-3 p-4" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton h-9" />
      ))}
    </div>
  );
}
