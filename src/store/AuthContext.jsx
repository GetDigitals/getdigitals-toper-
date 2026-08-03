import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { watchAuthState, registerUser, loginUser, logoutUser, resetPassword } from '../services/authService';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null); // Firestore users/{uid} doc: { email, paymentStatus, ... }
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuthState((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Live-listen to the user's Firestore profile so an approval from the
  // Firebase console (Ashok marking paymentStatus: 'approved') unlocks
  // the app immediately, without the student needing to log out/in again.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setProfile(snap.exists() ? snap.data() : null);
        setProfileLoading(false);
      },
      () => setProfileLoading(false)
    );
    return unsub;
  }, [user]);

  const register = useCallback(async (email, password, name, mobile) => {
    const u = await registerUser(email, password, name, mobile);
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
    setProfile(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    await resetPassword(email);
  }, []);

  const isApproved = profile?.paymentStatus === 'approved';

  return (
    <AuthCtx.Provider
      value={{ user, authLoading, profile, profileLoading, isApproved, register, login, logout, forgotPassword }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
