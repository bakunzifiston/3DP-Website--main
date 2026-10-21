import { Link } from 'react-router-dom';
import { Field, Checkbox, Honeypot } from '../../ui/Form.jsx';
import { Alert, Spinner } from '../../ui/Feedback.jsx';
import Icon from '../../ui/Icon.jsx';
import { experienceOptions } from '../../../lib/format.js';
import { useForm } from './useForm.js';

export default function ApplicationForm({ program }) {
  const tracks = program.tracks || [];
  const { values, set, errors, formError, submitting, done, submit } = useForm(
    {
      program_slug: program.slug,
      track: '',
      full_name: '',
      email: '',
      phone: '',
      occupation: '',
      experience_level: 'none',
      motivation: '',
      consent: false,
      website: '',
    },
    '/public/applications'
  );

  if (done) {
    return (
      <div className="card p-8 text-center sm:p-10" role="status">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-success">
          <Icon name="checkCircle" className="h-7 w-7" />
        </span>
        <h3 className="text-[1.5rem]">Application received</h3>
        <p className="mx-auto mt-3 max-w-[46ch] text-ink-muted">
          Thank you for applying to the {program.title}. Our team will review your application and contact you at{' '}
          <strong className="text-ink">{values.email}</strong> with next steps.
        </p>
        <Link to="/programs" className="btn btn-secondary mt-7">
          Back to programs
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate data-reveal="fade" className="card relative p-6 sm:p-8">
      {formError && (
        <Alert tone="error" className="mb-6">
          {formError}
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" required error={errors.full_name}>
          {(p) => <input {...p} className="input" autoComplete="name" value={values.full_name} onChange={set('full_name')} maxLength={120} />}
        </Field>
        <Field label="Email address" required error={errors.email}>
          {(p) => <input {...p} type="email" className="input" autoComplete="email" value={values.email} onChange={set('email')} maxLength={190} />}
        </Field>
        <Field label="Phone number" required error={errors.phone}>
          {(p) => <input {...p} type="tel" className="input" autoComplete="tel" value={values.phone} onChange={set('phone')} maxLength={40} />}
        </Field>
        <Field label="Current occupation" optional error={errors.occupation} hint="e.g. student, accountant, programme officer">
          {(p) => <input {...p} className="input" value={values.occupation} onChange={set('occupation')} maxLength={160} />}
        </Field>
        {tracks.length > 1 && (
          <Field label="Preferred track" optional error={errors.track}>
            {(p) => (
              <select {...p} required={false} className="input" value={values.track} onChange={set('track')}>
                <option value="">Not sure yet</option>
                {tracks.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
          </Field>
        )}
        <Field label="Experience with data" error={errors.experience_level} className={tracks.length > 1 ? '' : 'sm:col-span-2'}>
          {(p) => (
            <select {...p} className="input" value={values.experience_level} onChange={set('experience_level')}>
              {experienceOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
        </Field>
        <Field
          label="Why do you want to join?"
          optional
          error={errors.motivation}
          hint="Tell us briefly about your goals and what you hope to get from the program."
          className="sm:col-span-2"
        >
          {(p) => <textarea {...p} rows={5} className="input resize-y" value={values.motivation} onChange={set('motivation')} maxLength={3000} />}
        </Field>
      </div>

      <Checkbox
        className="mt-6"
        checked={values.consent}
        onChange={set('consent')}
        error={errors.consent}
        label={
          <>
            I agree that 3DP may use these details to process my application, as described in the{' '}
            <Link to="/privacy" className="link">
              privacy policy
            </Link>
            .
          </>
        }
      />
      <Honeypot value={values.website} onChange={set('website')} />

      <button type="submit" disabled={submitting} className="btn btn-accent btn-lg mt-7 w-full sm:w-auto">
        {submitting ? <Spinner className="h-4 w-4" label="Submitting" /> : null}
        {submitting ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  );
}
