import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';
import { LoadingState } from '../components/ui/Feedback.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, status: 'loading', expired: false });

  useEffect(() => {
    api('/auth/me')
      .then((res) => setState({ user: res.data, status: 'authed', expired: false }))
      .catch(() => setState({ user: null, status: 'anon', expired: false }));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api('/auth/login', { method: 'POST', body: { email, password } });
    setState({ user: res.data, status: 'authed', expired: false });
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } finally {
      setState({ user: null, status: 'anon', expired: false });
    }
  }, []);

  // Called when any request returns 401: the session ended (expired, revoked, or password changed elsewhere).
  const expire = useCallback(() => setState((s) => (s.status === 'authed' ? { user: null, status: 'anon', expired: true } : s)), []);

  const value = useMemo(
    () => ({ ...state, isAdmin: state.user?.role === 'admin', login, logout, expire }),
    [state, login, logout, expire]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function RequireAuth({ children, role }) {
  const auth = useAuth();
  const location = useLocation();
  if (auth.status === 'loading') return <LoadingState className="min-h-screen" label="Checking your session…" />;
  if (auth.status !== 'authed') {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname + location.search, expired: auth.expired }} />;
  }
  if (role && auth.user.role !== role) return <Navigate to="/admin" replace />;
  return children;
}

// useApi wrapper that signs the user out when the session has ended.
export function useAdminApi(path, opts) {
  const result = useApi(path, opts);
  const { expire } = useAuth();
  useEffect(() => {
    if (result.error?.status === 401) expire();
  }, [result.error, expire]);
  return result;
}

// Returns an api() caller for mutations that also handles session expiry.
export function useAdminRequest() {
  const { expire } = useAuth();
  return useCallback(
    async (path, opts) => {
      try {
        return await api(path, opts);
      } catch (err) {
        if (err.status === 401) expire();
        throw err;
      }
    },
    [expire]
  );
}
