/**
 * authService.js — Email/Password auth + single-device enforcement.
 *
 * How the device-lock works:
 *   1. Every browser install gets a random deviceId, generated once and
 *      stored in localStorage (survives reloads, but a fresh install /
 *      cleared browser data / different browser looks like a new device).
 *   2. On REGISTER, we save { email, deviceId } to Firestore under
 *      users/{uid} — that device becomes the "bound" device.
 *   3. On LOGIN, after Firebase Auth succeeds, we fetch users/{uid} and
 *      compare its stored deviceId to this browser's deviceId. If they
 *      don't match, we silently REBIND the account to this device (update
 *      the stored deviceId) rather than blocking the login. A hard block
 *      here caused false positives: localStorage — where deviceId lives —
 *      gets wiped by clearing browser data, private/incognito mode, or
 *      opening the app via an in-app browser (WhatsApp, etc.), which made
 *      the SAME physical phone look like a "new device" and locked out
 *      genuine students. lastLoginAt + a lastDeviceChangeAt timestamp are
 *      still recorded on every rebind, so unusually frequent device
 *      changes remain visible for manual review in Firestore if needed.
 *   4. If a student genuinely gets a new phone, the fix today is manual:
 *      Ashok opens the Firestore console → users/{uid} → clears/edits
 *      the deviceId field. (A self-serve "reset device" flow can be
 *      added later as a small Cloud Function if this becomes frequent.)
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const DEVICE_ID_KEY = 'gd-topper-device-id';

export function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

/** Short, shareable code derived from the uid — unique because the uid is. */
function codeFromUid(uid) {
  return uid.slice(0, 6).toUpperCase();
}

/**
 * Registers a new student and, if they arrived via a friend's referral
 * link (`?ref=CODE`, resolved by Login.jsx and passed in as
 * `referredByCode`), links the two accounts.
 *
 * How referral linking works (all client-side, no backend):
 *   1. `referralCodes/{code}` is a tiny lookup collection: code -> uid.
 *      Every student gets their own entry, written once at registration.
 *      Anyone signed in can read it (needed to resolve a friend's code),
 *      but a student can only ever CREATE the entry for their own code.
 *   2. `referrals/{autoId}` is an append-only log: { referrerUid,
 *      referredUid, createdAt }. A student can only create a row where
 *      referredUid is their own uid (i.e. you can only log yourself being
 *      referred, never fake a referral for someone else), and it can
 *      never be edited or deleted afterwards. The Refer & Earn screen
 *      counts these rows to show how many people you've brought in.
 *   3. We deliberately do NOT let a new student write anything onto the
 *      referrer's own users/{uid} document — Firestore rules only allow
 *      you to touch your own doc, which is what actually keeps this safe
 *      from anyone inflating their own or someone else's stats.
 */
export async function registerUser(email, password, name, mobile, referredByCode) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const deviceId = getDeviceId();
  const ownCode = codeFromUid(cred.user.uid);

  let referredByUid = null;
  const cleanedRefCode = referredByCode?.trim().toUpperCase() || null;
  if (cleanedRefCode && cleanedRefCode !== ownCode) {
    try {
      const refDoc = await getDoc(doc(db, 'referralCodes', cleanedRefCode));
      if (refDoc.exists() && refDoc.data().uid !== cred.user.uid) {
        referredByUid = refDoc.data().uid;
      }
    } catch (e) {
      console.error('[authService] referral code lookup failed:', e);
    }
  }

  await setDoc(doc(db, 'users', cred.user.uid), {
    email,
    name: name?.trim() || '',
    mobile: mobile?.trim() || '',
    deviceId,
    paymentStatus: 'pending', // student cannot access lessons until Ashok approves in Firestore console
    referralCode: ownCode,
    referredByCode: referredByUid ? cleanedRefCode : null,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });

  // Claim our own referral code in the lookup table (best-effort — if this
  // fails the student can still use the app, they just can't refer others
  // until it's retried, e.g. on next login via ensureReferralCode below).
  try {
    await setDoc(doc(db, 'referralCodes', ownCode), { uid: cred.user.uid, createdAt: serverTimestamp() });
  } catch (e) {
    console.error('[authService] claiming own referral code failed:', e);
  }

  if (referredByUid) {
    try {
      await addDoc(collection(db, 'referrals'), {
        referrerUid: referredByUid,
        referredUid: cred.user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error('[authService] logging referral failed:', e);
    }
  }

  return cred.user;
}

/** Called on login for older accounts that registered before referralCode existed, so everyone eventually has one. */
export async function ensureReferralCode(uid) {
  const ownCode = codeFromUid(uid);
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (snap.exists() && !snap.data().referralCode) {
    await setDoc(userRef, { referralCode: ownCode }, { merge: true });
    try {
      await setDoc(doc(db, 'referralCodes', ownCode), { uid, createdAt: serverTimestamp() });
    } catch (e) {
      console.error('[authService] backfilling referral code failed:', e);
    }
  }
  return ownCode;
}

/**
 * Returns { user } on success, or throws an Error with a friendly
 * message (DEVICE_MISMATCH is a special code the UI checks for).
 */
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const deviceId = getDeviceId();
  const userRef = doc(db, 'users', cred.user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    // First login after account existed without a device record — bind it now.
    await setDoc(userRef, { email, deviceId, paymentStatus: 'pending', createdAt: serverTimestamp(), lastLoginAt: serverTimestamp() });
    return cred.user;
  }

  const data = snap.data();
  if (data.deviceId && data.deviceId !== deviceId) {
    // Rebind silently instead of blocking — see the note at the top of
    // this file for why a hard block here does more harm than good.
    // (paymentStatus is deliberately left untouched — Firestore rules
    // require it to stay unchanged on any client-side update.)
    await setDoc(
      userRef,
      { deviceId, lastLoginAt: serverTimestamp(), lastDeviceChangeAt: serverTimestamp() },
      { merge: true }
    );
    return cred.user;
  }

  await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
  return cred.user;
}

/** Fetches { email, paymentStatus, ... } for the current user's Firestore profile. */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}
