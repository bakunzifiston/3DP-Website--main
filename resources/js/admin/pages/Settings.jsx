import { useEffect, useState } from 'react';
import { usePageMeta } from '../../lib/hooks.js';
import { Field } from '../../components/ui/Form.jsx';
import { Alert, ErrorState, LoadingState, Spinner } from '../../components/ui/Feedback.jsx';
import { useAdminApi, useAdminRequest, useAuth } from '../auth.jsx';
import { useToast } from '../Toast.jsx';
import { PageHeader } from '../ui.jsx';

// Keys match server/lib/settings.js.
const groups = [
  {
    title: 'Homepage hero',
    description: 'The first thing visitors read on the homepage.',
    fields: [
      { name: 'hero_eyebrow', label: 'Eyebrow line', max: 160 },
      { name: 'hero_title', label: 'Headline', max: 200 },
      { name: 'hero_subtitle', label: 'Supporting text', max: 400, textarea: true },
    ],
  },
  {
    title: 'Contact details',
    description: 'Shown in the footer and on the Contact page.',
    fields: [
      { name: 'contact_email', label: 'Contact email', type: 'email', max: 190 },
      { name: 'contact_phone', label: 'Phone number', type: 'tel', max: 40, placeholder: '+250 7XX XXX XXX' },
      { name: 'address', label: 'Address', max: 200 },
      { name: 'office_hours', label: 'Office hours', max: 120 },
      { name: 'response_time', label: 'Response time note', max: 120, hint: 'e.g. "We usually reply within two working days."' },
    ],
  },
  {
    title: 'Social links',
    description: 'Full https:// links. Leave empty to hide an icon.',
    fields: [
      { name: 'linkedin_url', label: 'LinkedIn', type: 'url' },
      { name: 'x_url', label: 'X (Twitter)', type: 'url' },
      { name: 'instagram_url', label: 'Instagram', type: 'url' },
      { name: 'facebook_url', label: 'Facebook', type: 'url' },
      { name: 'youtube_url', label: 'YouTube', type: 'url' },
    ],
  },
];

export default function Settings() {
  usePageMeta('Admin · Site settings');
  const { isAdmin } = useAuth();
  const { data, error, loading, reload } = useAdminApi('/admin/settings');
  const request = useAdminRequest();
  const toast = useToast();
  const [values, setValues] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.data) setValues(Object.fromEntries(Object.entries(data.data).map(([k, v]) => [k, v ?? ''])));
  }, [data]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading || !values) return <LoadingState />;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setFormError(null);
    try {
      const res = await request('/admin/settings', { method: 'PUT', body: values });
      setValues(Object.fromEntries(Object.entries(res.data).map(([k, v]) => [k, v ?? ''])));
      toast('Settings saved. Changes are live on the website.');
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate>
      <PageHeader
        title="Site settings"
        description="Homepage text, contact details and social links used across the public website."
        actions={
          isAdmin && (
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving && <Spinner className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save settings'}
            </button>
          )
        }
      />
      {!isAdmin && (
        <Alert tone="info" className="mb-5">
          You can view these settings, but only administrators can change them.
        </Alert>
      )}
      {formError && (
        <Alert tone="error" className="mb-5">
          {formError}
        </Alert>
      )}
      <fieldset disabled={!isAdmin} className="space-y-6">
        {groups.map((g) => (
          <section key={g.title} className="card grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[260px_1fr]">
            <div>
              <h2 className="text-[1rem]">{g.title}</h2>
              <p className="mt-1 text-[0.85rem] text-ink-faint">{g.description}</p>
            </div>
            <div className="space-y-5">
              {g.fields.map((f) => (
                <Field key={f.name} label={f.label} hint={f.hint} error={errors[f.name]}>
                  {(p) =>
                    f.textarea ? (
                      <textarea {...p} rows={3} maxLength={f.max} className="input" value={values[f.name]} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} />
                    ) : (
                      <input
                        {...p}
                        type={f.type || 'text'}
                        maxLength={f.max}
                        placeholder={f.placeholder || (f.type === 'url' ? 'https://' : undefined)}
                        className="input"
                        value={values[f.name]}
                        onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
                      />
                    )
                  }
                </Field>
              ))}
            </div>
          </section>
        ))}
      </fieldset>
    </form>
  );
}
