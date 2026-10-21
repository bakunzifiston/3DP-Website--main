import { useState } from 'react';
import { usePageMeta } from '../../lib/hooks.js';
import { Field } from '../../components/ui/Form.jsx';
import { Alert, Badge, Spinner } from '../../components/ui/Feedback.jsx';
import { useAdminRequest, useAuth } from '../auth.jsx';
import { useToast } from '../Toast.jsx';
import { PageHeader } from '../ui.jsx';

export default function Account() {
  usePageMeta('Admin · My account');
  const { user } = useAuth();
  const request = useAdminRequest();
  const toast = useToast();
  const [values, setValues] = useState({ current_password: '', new_password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    if (values.new_password !== values.confirm) return setErrors({ confirm: 'Passwords do not match' });
    setBusy(true);
    try {
      await request('/auth/password', { method: 'PUT', body: { current_password: values.current_password, new_password: values.new_password } });
      setValues({ current_password: '', new_password: '', confirm: '' });
      toast('Password changed. Other devices have been signed out.');
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (e) => setValues({ ...values, [k]: e.target.value });

  return (
    <>
      <PageHeader title="My account" />
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[320px_1fr]">
        <section className="card p-5">
          <h2 className="text-[1rem]">Profile</h2>
          <dl className="mt-4 space-y-3 text-[0.9rem]">
            <div>
              <dt className="text-[0.78rem] text-ink-faint">Name</dt>
              <dd className="text-ink">{user.name}</dd>
            </div>
            <div>
              <dt className="text-[0.78rem] text-ink-faint">Email</dt>
              <dd className="break-all text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[0.78rem] text-ink-faint">Role</dt>
              <dd className="mt-0.5">
                <Badge tone={user.role === 'admin' ? 'navy' : 'neutral'}>{user.role === 'admin' ? 'Admin' : 'Editor'}</Badge>
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.8rem] text-ink-faint">To change your name or email, ask an administrator.</p>
        </section>

        <form onSubmit={submit} noValidate className="card max-w-[560px] space-y-5 p-5 sm:p-6">
          <div>
            <h2 className="text-[1rem]">Change password</h2>
            <p className="mt-1 text-[0.85rem] text-ink-faint">Use at least 10 characters, including a letter and a number.</p>
          </div>
          {formError && <Alert tone="error">{formError}</Alert>}
          <Field label="Current password" required error={errors.current_password}>
            {(p) => <input {...p} type="password" autoComplete="current-password" className="input" value={values.current_password} onChange={set('current_password')} />}
          </Field>
          <Field label="New password" required error={errors.new_password}>
            {(p) => <input {...p} type="password" autoComplete="new-password" className="input" value={values.new_password} onChange={set('new_password')} />}
          </Field>
          <Field label="Confirm new password" required error={errors.confirm}>
            {(p) => <input {...p} type="password" autoComplete="new-password" className="input" value={values.confirm} onChange={set('confirm')} />}
          </Field>
          <button type="submit" className="btn btn-primary" disabled={busy || !values.current_password || !values.new_password}>
            {busy && <Spinner className="h-4 w-4" />}
            Update password
          </button>
        </form>
      </div>
    </>
  );
}
