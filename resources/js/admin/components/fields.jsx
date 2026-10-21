// Field widgets for the generic content editor. Each renders from a field config in contentTypes.js.
import { useState } from 'react';
import Icon from '../../components/ui/Icon.jsx';
import { Field, Switch } from '../../components/ui/Form.jsx';
import RichText from '../../components/ui/RichText.jsx';
import { MediaPickerModal } from './MediaLibrary.jsx';

function CharCount({ value, max }) {
  if (!max) return null;
  const len = (value || '').length;
  return <span className={`text-[0.75rem] tabular-nums ${len > max ? 'text-danger' : 'text-ink-faint'}`}>{len}/{max}</span>;
}

export function ListEditor({ value = [], onChange, itemLabel = 'item', max = 20, error }) {
  const [draft, setDraft] = useState('');
  const items = Array.isArray(value) ? value : [];
  const update = (next) => onChange(next);
  const move = (i, dir) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };
  const add = () => {
    const v = draft.trim();
    if (!v || items.length >= max) return;
    update([...items, v]);
    setDraft('');
  };
  return (
    <div>
      {items.length > 0 && (
        <ol className="mb-2 space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="w-5 text-right text-[0.75rem] text-ink-faint tabular-nums">{i + 1}.</span>
              <input
                className="input !py-1.5"
                value={item}
                aria-label={`${itemLabel} ${i + 1}`}
                onChange={(e) => update(items.map((x, k) => (k === i ? e.target.value : x)))}
              />
              <button type="button" className="btn btn-ghost btn-sm !px-1.5" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${itemLabel} ${i + 1} up`}>
                <Icon name="chevronDown" className="h-4 w-4 rotate-180" />
              </button>
              <button type="button" className="btn btn-ghost btn-sm !px-1.5" disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${itemLabel} ${i + 1} down`}>
                <Icon name="chevronDown" className="h-4 w-4" />
              </button>
              <button type="button" className="btn btn-ghost btn-sm !px-1.5 text-danger hover:!bg-danger-bg" onClick={() => update(items.filter((_, k) => k !== i))} aria-label={`Remove ${itemLabel} ${i + 1}`}>
                <Icon name="x" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      )}
      {items.length < max && (
        <div className="flex gap-2">
          <input
            className="input !py-1.5"
            placeholder={`Add ${itemLabel}…`}
            aria-label={`New ${itemLabel}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                add();
              }
            }}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={add} disabled={!draft.trim()}>
            <Icon name="plus" className="h-4 w-4" />
            Add
          </button>
        </div>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function ImageField({ value, onChange, label }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <p className="label">{label}</p>
      {value ? (
        <div className="overflow-hidden rounded-md border border-line">
          <img src={value} alt="" className="aspect-[16/10] w-full bg-surface-2 object-cover" />
          <div className="flex gap-2 border-t border-line p-2">
            <button type="button" className="btn btn-secondary btn-sm flex-1" onClick={() => setOpen(true)}>
              Change
            </button>
            <button type="button" className="btn btn-ghost btn-sm text-danger" onClick={() => onChange(null)}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-line-strong text-[0.85rem] text-ink-muted hover:border-navy-600 hover:bg-navy-50"
        >
          <Icon name="image" className="h-6 w-6 text-ink-faint" />
          Choose or upload an image
        </button>
      )}
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        selected={value}
        onPick={(m) => {
          onChange(m.url);
          setOpen(false);
        }}
      />
    </div>
  );
}

function RichField({ field, value, onChange, error }) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <span className="label !mb-0">
          {field.label}
          {field.required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
        </span>
        <div className="flex rounded-md border border-line p-0.5 text-[0.78rem]" role="group" aria-label="Editor mode">
          {['Write', 'Preview'].map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={(m === 'Preview') === preview}
              onClick={() => setPreview(m === 'Preview')}
              className={`cursor-pointer rounded px-2.5 py-1 font-medium ${(m === 'Preview') === preview ? 'bg-navy-800 text-white' : 'text-ink-muted hover:text-ink'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      {preview ? (
        <div className="min-h-[200px] rounded-md border border-line bg-surface p-5">
          {value?.trim() ? <RichText text={value} /> : <p className="text-[0.9rem] text-ink-faint">Nothing to preview yet.</p>}
        </div>
      ) : (
        <Field error={error} hint="Formatting: blank line = new paragraph · ## Heading · ### Subheading · - bullet · 1. numbered · **bold** · [link text](https://…)">
          {(p) => (
            <textarea
              {...p}
              aria-label={field.label}
              rows={field.rows || 12}
              className="input font-mono text-[0.88rem] leading-relaxed"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
          )}
        </Field>
      )}
    </div>
  );
}

// datetime-local needs "YYYY-MM-DDTHH:mm" in local time.
function toLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FormField({ field, value, onChange, error, onSlugEdited }) {
  const common = { value: value ?? '', onChange: (e) => onChange(e.target.value) };
  switch (field.type) {
    case 'switch':
      return (
        <div>
          <Switch checked={Boolean(value)} onChange={onChange} label={field.label} description={field.description} />
          {error && <p className="field-error">{error}</p>}
        </div>
      );
    case 'image':
      return (
        <div>
          <ImageField value={value} onChange={onChange} label={field.label} />
          {error && <p className="field-error">{error}</p>}
        </div>
      );
    case 'rich':
      return <RichField field={field} value={value} onChange={onChange} error={error} />;
    case 'list':
      return (
        <div>
          <p className="label">{field.label}</p>
          {field.hint && <p className="hint !mt-0 mb-2">{field.hint}</p>}
          <ListEditor value={value} onChange={onChange} itemLabel={field.itemLabel} max={field.max} error={error} />
        </div>
      );
    default:
      break;
  }

  return (
    <Field label={field.label} error={error} hint={field.hint} required={field.required}>
      {(p) => {
        if (field.type === 'textarea')
          return (
            <>
              <textarea {...p} {...common} rows={field.rows || 4} maxLength={field.max ? field.max + 50 : undefined} className="input" />
              {field.max && (
                <div className="mt-1 text-right">
                  <CharCount value={value} max={field.max} />
                </div>
              )}
            </>
          );
        if (field.type === 'select')
          return (
            <select {...p} {...common} className="input cursor-pointer">
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          );
        if (field.type === 'slug')
          return (
            <div className="flex rounded-md shadow-sm">
              {field.prefix && (
                <span className="hidden items-center rounded-l-md border border-r-0 border-line-strong bg-surface-2 px-3 text-[0.85rem] text-ink-faint sm:flex">{field.prefix}</span>
              )}
              <input
                {...p}
                value={value ?? ''}
                onChange={(e) => {
                  onSlugEdited?.();
                  onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
                }}
                className={`input font-mono text-[0.88rem] ${field.prefix ? 'sm:rounded-l-none' : ''}`}
                spellCheck={false}
              />
            </div>
          );
        if (field.type === 'number') return <input {...p} type="number" step="1" {...common} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} className="input" />;
        if (field.type === 'date') return <input {...p} type="date" {...common} value={value ? String(value).slice(0, 10) : ''} className="input" />;
        if (field.type === 'datetime')
          return (
            <input
              {...p}
              type="datetime-local"
              value={toLocalInput(value)}
              onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
              className="input"
            />
          );
        return (
          <input
            {...p}
            type={field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text'}
            placeholder={field.placeholder}
            maxLength={field.max}
            {...common}
            className="input"
          />
        );
      }}
    </Field>
  );
}
