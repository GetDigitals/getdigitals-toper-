import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { watchAuthState, registerUser, loginUser, logoutUser, resetPassword } from '../services/authService';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuthState((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const register = useCallback(async (email, password) => {
    const u = await registerUser(email, password);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await loginUser(email, password);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    await resetPassword(email);
  }, []);

  return (
    <AuthCtx.Provider value={{ user, authLoading, register, login, logout, forgotPassword }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
