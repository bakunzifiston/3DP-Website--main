import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';
import { usePageMeta } from '../../lib/hooks.js';
import Logo from '../../components/site/Logo.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { Field } from '../../components/ui/Form.jsx';
import { Alert, Spinner } from '../../components/ui/Feedback.jsx';

export default function Login() {
  usePageMeta('Admin · Sign in');
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from && location.state.from.startsWith('/admin') ? location.state.from : '/admin';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [fields, setFields] = useState({});
  const [busy, setBusy] = useState(false);

  if (auth.status === 'authed') return <Navigate to={from} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});
    try {
      await auth.login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-bg lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-navy-900 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden="true" />
        <Logo variant="reversed" className="relative h-16" to={null} />
        <div className="relative max-w-[42ch]">
          <p className="eyebrow mb-4 !text-gold-400">Content management</p>
          <h1 className="text-[2rem] !text-white">Manage the 3DP website, programs and enquiries in one place.</h1>
          <p className="mt-4 text-white/65">
            Publish services and insights, review program applications, and respond to new enquiries.
          </p>
        </div>
        <p className="relative text-[0.82rem] text-white/45">Authorised staff only. Sign-in activity is logged.</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <Logo className="h-14" to={null} />
          </div>
          <h2 className="text-[1.6rem]">Sign in</h2>
          <p className="mt-1.5 text-[0.95rem] text-ink-muted">Use your 3DP staff account.</p>

          {location.state?.expired && !error && (
            <Alert tone="info" className="mt-6">
              Your session ended. Please sign in again.
            </Alert>
          )}
          {error && (
            <Alert tone={error.status === 423 ? 'warning' : 'error'} className="mt-6">
              {error.message}
            </Alert>
          )}

          <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
            <Field label="Email address" error={fields.email}>
              {(p) => (
                <input
                  {...p}
                  type="email"
                  autoComplete="username"
                  autoFocus
                  required
                  className="input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              )}
            </Field>
            <Field label="Password" error={fields.password}>
              {(p) => (
                <div className="relative">
                  <input
                    {...p}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input pr-11"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-ink-faint hover:text-ink"
                  >
                    <Icon name={showPassword ? 'eyeOff' : 'eye'} className="h-[18px] w-[18px]" />
                  </button>
                </div>
              )}
            </Field>
            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={busy}>
              {busy ? <Spinner className="h-4 w-4" label="Signing in" /> : <Icon name="lock" className="h-4 w-4" />}
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-[0.85rem] text-ink-faint">
            Forgot your password? Ask a 3DP administrator to reset it.
          </p>
          <p className="mt-3 text-center">
            <Link to="/" className="text-[0.85rem] text-ink-muted no-underline hover:text-navy-800">
              ← Back to website
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
