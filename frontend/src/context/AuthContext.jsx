import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, usersApi } from '../services';
import { tokenStore } from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!tokenStore.get());

  const loadUser = useCallback(async () => {
    try {
      const u = await authApi.me();
      setUser(u);
      return u;
    } catch {
      tokenStore.clear();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tokenStore.get()) loadUser();
    else setLoading(false);
  }, [loadUser]);

  // Any 401 from the API clears the session.
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, []);

  // Theme settings (dark is the default brand look).
  useEffect(() => {
    document.documentElement.classList.toggle('light', user?.theme === 'light');
  }, [user?.theme]);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    tokenStore.set(res.access_token);
    const u = await loadUser();
    if (!u) throw new Error('Signed in, but your account could not be loaded. Please try again.');
    return u;
  }, [loadUser]);

  const register = useCallback(async (data) => {
    await authApi.register(data);
    return login(data.email, data.password);
  }, [login]);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* token is dropped client-side regardless */ }
    tokenStore.clear();
    setUser(null);
  }, []);

  const saveProfile = useCallback(async (patch) => {
    const u = await usersApi.updateProfile(patch);
    setUser(u);
    return u;
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout, saveProfile, refresh: loadUser }),
    [user, loading, login, register, logout, saveProfile, loadUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
