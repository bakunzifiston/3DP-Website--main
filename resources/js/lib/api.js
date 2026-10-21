// Thin fetch wrapper for the 3DP API. Errors are thrown as ApiError with the server's message and
// per-field validation messages (err.fields), so forms can show them next to the right input.

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields || {};
  }
}

// Laravel sets an XSRF-TOKEN cookie; state-changing requests must echo it back in the X-XSRF-TOKEN header.
function xsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function send(path, { method, body, signal }) {
  const isForm = body instanceof FormData;
  const headers = { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' };
  if (body && !isForm) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') {
    const token = xsrfToken();
    if (token) headers['X-XSRF-TOKEN'] = token;
  }
  return fetch(`/api${path}`, {
    method,
    signal,
    credentials: 'same-origin',
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  });
}

export async function api(path, { method = 'GET', body, signal, raw = false } = {}) {
  let res;
  try {
    res = await send(path, { method, body, signal });
    // 419 = missing or expired CSRF token (e.g. the tab was open for a long time): refresh it and retry once.
    if (res.status === 419) {
      await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' });
      res = await send(path, { method, body, signal });
    }
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'We could not reach the server. Check your connection and try again.');
  }

  if (raw) {
    if (!res.ok) throw new ApiError(res.status, 'Request failed');
    return res;
  }
  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || 'Something went wrong. Please try again.', data?.fields);
  }
  return data;
}

export const get = (path, opts) => api(path, opts);
export const post = (path, body) => api(path, { method: 'POST', body });
export const put = (path, body) => api(path, { method: 'PUT', body });
export const patch = (path, body) => api(path, { method: 'PATCH', body });
export const del = (path) => api(path, { method: 'DELETE' });

export function toQuery(params) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') q.set(k, v);
  const s = q.toString();
  return s ? `?${s}` : '';
}
