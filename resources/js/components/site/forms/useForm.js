import { useState } from 'react';
import { post } from '../../../lib/api.js';

// Shared state for public forms: values, per-field server errors, submitting/success flags.
export function useForm(initial, endpoint) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (name) => (e) => {
    const value = e?.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  async function submit(e, transform = (v) => v) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFormError(null);
    setErrors({});
    try {
      await post(endpoint, transform(values));
      setDone(true);
    } catch (err) {
      setErrors(err.fields || {});
      setFormError(err.message);
      // Move focus to the first invalid field so keyboard and screen reader users land on it.
      requestAnimationFrame(() => e.target.querySelector('[aria-invalid="true"]')?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  const reset = () => {
    setValues(initial);
    setDone(false);
  };

  return { values, set, errors, formError, submitting, done, submit, reset };
}
