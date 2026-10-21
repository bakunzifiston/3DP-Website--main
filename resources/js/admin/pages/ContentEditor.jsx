import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePageMeta } from '../../lib/hooks.js';
import { formatDateTime } from '../../lib/format.js';
import Icon from '../../components/ui/Icon.jsx';
import { Alert, ErrorState, LoadingState, Spinner } from '../../components/ui/Feedback.jsx';
import { useAdminApi, useAdminRequest } from '../auth.jsx';
import { useToast } from '../Toast.jsx';
import { ConfirmDialog, PageHeader } from '../ui.jsx';
import { FormField } from '../components/fields.jsx';
import { slugify } from '../contentTypes.js';

function initialValues(type, row) {
  const values = {};
  for (const f of type.fields) {
    const fallback = f.type === 'list' ? [] : f.type === 'switch' ? false : f.type === 'number' ? 0 : f.type === 'select' ? f.options[0].value : '';
    values[f.name] = row ? row[f.name] ?? (f.type === 'list' ? [] : f.type === 'switch' ? false : null) : type.defaults?.[f.name] ?? fallback;
    // The API returns DATE columns as ISO timestamps but accepts only YYYY-MM-DD.
    if (f.type === 'date' && values[f.name]) values[f.name] = String(values[f.name]).slice(0, 10);
  }
  return values;
}

export default function ContentEditor({ typeKey, type }) {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const request = useAdminRequest();
  const toast = useToast();
  const { data, error, loading, reload } = useAdminApi(isNew ? null : `/admin/${typeKey}/${id}`);
  const row = data?.data;

  const [values, setValues] = useState(() => (isNew ? initialValues(type) : null));
  const [saved, setSaved] = useState(() => (isNew ? initialValues(type) : null));
  const [slugEdited, setSlugEdited] = useState(!isNew);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (row) {
      const v = initialValues(type, row);
      setValues(v);
      setSaved(v);
      setSlugEdited(true);
    }
  }, [row, type]);

  usePageMeta(`Admin · ${isNew ? `New ${type.singular.toLowerCase()}` : row?.[type.titleField] || type.singular}`);

  const dirty = useMemo(() => values && saved && JSON.stringify(values) !== JSON.stringify(saved), [values, saved]);

  // Warn before closing or reloading the tab with unsaved changes. (In-app navigation blocking needs a
  // data router; the app uses <BrowserRouter>, so the sidebar shows an unsaved-changes notice instead.)
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [dirty]);

  if (!isNew && error) return <ErrorState error={error} onRetry={reload} />;
  if (!values || (!isNew && loading)) return <LoadingState />;

  const slugField = type.fields.find((f) => f.type === 'slug');
  const set = (name, value) => {
    setValues((v) => {
      const next = { ...v, [name]: value };
      if (slugField && !slugEdited && name === slugField.source) next[slugField.name] = slugify(value);
      return next;
    });
    if (fieldErrors[name]) setFieldErrors((e) => ({ ...e, [name]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});
    try {
      const res = await request(isNew ? `/admin/${typeKey}` : `/admin/${typeKey}/${id}`, { method: isNew ? 'POST' : 'PUT', body: values });
      const v = initialValues(type, res.data);
      setValues(v);
      setSaved(v);
      toast(`${type.singular} ${isNew ? 'created' : 'saved'}`);
      if (isNew) navigate(`/admin/${typeKey}/${res.data.id}`, { replace: true });
    } catch (err) {
      setFieldErrors(err.fields || {});
      setFormError(err.message);
      // Bring the first error into view.
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"], .field-error')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
    } finally {
      setSaving(false);
    }
  };

  const main = type.fields.filter((f) => !f.side);
  const side = type.fields.filter((f) => f.side);
  const publicPath = row && type.publicPath?.(row);

  const renderFields = (fields) => {
    const out = [];
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      if (f.half && fields[i + 1]?.half) {
        const g = fields[i + 1];
        out.push(
          <div key={f.name} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} error={fieldErrors[f.name]} />
            <FormField field={g} value={values[g.name]} onChange={(v) => set(g.name, v)} error={fieldErrors[g.name]} />
          </div>
        );
        i++;
      } else {
        out.push(
          <FormField key={f.name} field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} error={fieldErrors[f.name]} onSlugEdited={() => setSlugEdited(true)} />
        );
      }
    }
    return out;
  };

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        back={{ to: `/admin/${typeKey}`, label: type.plural }}
        title={isNew ? `New ${type.singular.toLowerCase()}` : row?.[type.titleField]}
        description={!isNew && row?.updated_at ? `Last updated ${formatDateTime(row.updated_at)}` : undefined}
        actions={
          <>
            {publicPath && (row.is_published || row.status === 'published') && (
              <a href={publicPath} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                View on site
                <Icon name="external" className="h-4 w-4" />
              </a>
            )}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? 'Saving…' : isNew ? `Create ${type.singular.toLowerCase()}` : dirty ? 'Save changes' : 'Saved'}
            </button>
          </>
        }
      />

      {formError && (
        <Alert tone="error" className="mb-5" onDismiss={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card space-y-6 p-5 sm:p-6">{renderFields(main)}</div>
        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="card space-y-5 p-5">{renderFields(side)}</div>
          {!isNew && (
            <div className="card p-5">
              <h2 className="text-[0.95rem]">Danger zone</h2>
              <p className="mt-1 text-[0.82rem] text-ink-faint">Deleting removes this {type.singular.toLowerCase()} from the website permanently.</p>
              <button type="button" className="btn btn-secondary btn-sm mt-3 text-danger hover:!border-danger" onClick={() => setDeleting(true)}>
                <Icon name="trash" className="h-4 w-4" />
                Delete {type.singular.toLowerCase()}
              </button>
            </div>
          )}
          {dirty && (
            <p className="flex items-center gap-2 text-[0.82rem] text-warning" role="status">
              <span className="h-2 w-2 rounded-full bg-warning" aria-hidden="true" />
              You have unsaved changes
            </p>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        title={`Delete ${type.singular.toLowerCase()}?`}
        message={`"${row?.[type.titleField]}" will be permanently deleted. This cannot be undone.`}
        onConfirm={async () => {
          try {
            await request(`/admin/${typeKey}/${id}`, { method: 'DELETE' });
            toast(`${type.singular} deleted`);
            navigate(`/admin/${typeKey}`, { replace: true });
          } catch (err) {
            toast(err.message, 'error');
          }
        }}
      />
    </form>
  );
}

export function NotFoundAdmin() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-[1.4rem]">Page not found</h1>
      <Link to="/admin" className="btn btn-secondary mt-5">
        Back to dashboard
      </Link>
    </div>
  );
}
