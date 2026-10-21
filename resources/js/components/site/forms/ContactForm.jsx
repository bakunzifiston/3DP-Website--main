import { Link } from 'react-router-dom';
import { Field, Checkbox, Honeypot } from '../../ui/Form.jsx';
import { Alert, Spinner } from '../../ui/Feedback.jsx';
import Icon from '../../ui/Icon.jsx';
import { interestOptions } from '../../../lib/format.js';
import { useForm } from './useForm.js';

export default function ContactForm({ initialInterest = 'other', responseTime }) {
  const validInterest = interestOptions.some((o) => o.value === initialInterest) ? initialInterest : 'other';
  const { values, set, errors, formError, submitting, done, submit, reset } = useForm(
    { name: '', email: '', phone: '', organization: '', interest: validInterest, message: '', consent: false, website: '' },
    '/public/inquiries'
  );

  if (done) {
    return (
      <div className="card p-8 text-center sm:p-10" role="status">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success">
          <Icon name="checkCircle" className="h-7 w-7" />
        </span>
        <h2 className="text-[1.5rem]">Thank you, your message has been sent</h2>
        <p className="mx-auto mt-3 max-w-[44ch] text-ink-muted">
          {responseTime || 'We will get back to you shortly.'} We will reply to <strong className="text-ink">{values.email}</strong>.
        </p>
        <button type="button" onClick={reset} className="btn btn-secondary mt-7">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate data-reveal="fade" className="card relative p-6 sm:p-8">
      <h2 className="text-[1.35rem]">Send us a message</h2>
      <p className="mt-1.5 mb-6 text-[0.92rem] text-ink-muted">Fields marked * are required.</p>

      {formError && (
        <Alert tone="error" className="mb-6">
          {formError}
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.name}>
          {(p) => <input {...p} className="input" autoComplete="name" value={values.name} onChange={set('name')} maxLength={120} />}
        </Field>
        <Field label="Email address" required error={errors.email}>
          {(p) => <input {...p} type="email" className="input" autoComplete="email" value={values.email} onChange={set('email')} maxLength={190} />}
        </Field>
        <Field label="Phone number" optional error={errors.phone}>
          {(p) => <input {...p} type="tel" className="input" autoComplete="tel" value={values.phone} onChange={set('phone')} maxLength={40} />}
        </Field>
        <Field label="Organization" optional error={errors.organization}>
          {(p) => (
            <input {...p} className="input" autoComplete="organization" value={values.organization} onChange={set('organization')} maxLength={160} />
          )}
        </Field>
        <Field label="What can we help with?" error={errors.interest} className="sm:col-span-2">
          {(p) => (
            <select {...p} className="input" value={values.interest} onChange={set('interest')}>
              {interestOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field
          label="Message"
          required
          error={errors.message}
          hint="A few sentences about your team, your data, or the program you are interested in."
          className="sm:col-span-2"
        >
          {(p) => <textarea {...p} rows={6} className="input resize-y" value={values.message} onChange={set('message')} maxLength={5000} />}
        </Field>
      </div>

      <Checkbox
        className="mt-6"
        checked={values.consent}
        onChange={set('consent')}
        error={errors.consent}
        label={
          <>
            I agree that 3DP may use these details to respond to my enquiry, as described in the{' '}
            <Link to="/privacy" className="link">
              privacy policy
            </Link>
            .
          </>
        }
      />
      <Honeypot value={values.website} onChange={set('website')} />

      <button type="submit" disabled={submitting} className="btn btn-primary btn-lg mt-7 w-full sm:w-auto">
        {submitting ? <Spinner className="h-4 w-4" label="Sending" /> : null}
        {submitting ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
