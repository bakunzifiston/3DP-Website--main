import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

// Fetches `path` from the API and tracks loading / error state. Pass null to skip.
// Returns { data, error, loading, reload, setData } where `data` is the full JSON response.
export function useApi(path, { keepPrevious = false } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: Boolean(path) });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    setState((s) => ({ data: keepPrevious ? s.data : null, error: null, loading: true }));
    api(path, { signal: controller.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') setState({ data: null, error, loading: false });
      });
    return () => controller.abort();
  }, [path, nonce, keepPrevious]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const setData = useCallback((updater) => setState((s) => ({ ...s, data: typeof updater === 'function' ? updater(s.data) : updater })), []);
  return { ...state, reload, setData };
}

// Sets document.title and the meta description for the current page.
export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | 3DP: Data Driven Decisions Partners` : '3DP | Data Driven Decisions Partners';
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.name = 'description';
        document.head.appendChild(tag);
      }
      tag.content = description;
    }
  }, [title, description]);
}

// Scroll reveal is handled globally by RevealManager (lib/motion.jsx), which also picks up late-rendered
// [data-reveal] elements. This hook remains so existing callers keep working; it just returns a ref.
export function useReveal() {
  return useRef(null);
}
