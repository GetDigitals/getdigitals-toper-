import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { watchAuthState, registerUser, loginUser, logoutUser, resetPassword, ensureReferralCode } from '../services/authService';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profile, setProfile] = useState(null); // Firestore users/{uid} doc: { email, paymentStatus, ... }
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

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
  //
  // IMPORTANT: this depends on `user?.uid` (a stable string), NOT the
  // whole `user` object. Firebase's onAuthStateChanged can re-emit a new
  // User object reference for the SAME logical session (token refresh,
  // etc.) — depending on the object itself caused this effect to tear
  // down and restart the Firestore listener in a loop every time that
  // happened, so profileLoading kept resetting to true and never got a
  // chance to settle. That was the real "stuck on Payment Pending /
  // flickering" bug, not caching and not a deploy-sync issue.
  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      setProfileError(null);
      return;
    }
    setProfileLoading(true);
    const unsub = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setProfile(snap.exists() ? snap.data() : null);
        setProfileLoading(false);
        setProfileError(null);
      },
      (err) => {
        // If this ever fires (e.g. a Firestore rules mismatch), we want it
        // visible on-screen — silently swallowing it is what made a real
        // rules bug look identical to "the fix doesn't work" from outside.
        console.error('[AuthContext] Firestore profile listener failed:', err.code, err.message);
        setProfileError(`${err.code}: ${err.message}`);
        setProfileLoading(false);
      }
    );
    return unsub;
  }, [user?.uid]);

  const register = useCallback(async (email, password, name, mobile, referredByCode) => {
    const u = await registerUser(email, password, name, mobile, referredByCode);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await loginUser(email, password);
    setUser(u);
    // Backfills a referral code for accounts created before this feature existed. Best-effort, never blocks login.
    ensureReferralCode(u.uid).catch(() => {});
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
      value={{ user, authLoading, profile, profileLoading, profileError, isApproved, register, login, logout, forgotPassword }}
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
