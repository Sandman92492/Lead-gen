import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { triggerAccountCreatedEmail } from './emailService';
import { generateMockId, readMockDb, writeMockDb } from './mockDb';

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;
const isFirebaseMode = mode === 'firebase';

type MockAuthUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
};

const MOCK_AUTH_USER_KEY = 'raffle_mock_auth_user_v1';
const MOCK_AUTH_SIGNED_OUT_KEY = 'raffle_mock_auth_signed_out_v1';

let mockCurrentUser: MockAuthUser | null = null;
const mockListeners = new Set<(user: MockAuthUser | null) => void>();

const hasLocalStorage = (): boolean => typeof localStorage !== 'undefined';

const safeParseUser = (raw: string): MockAuthUser | null => {
  try {
    const parsed = JSON.parse(raw) as any;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.uid !== 'string') return null;
    if (typeof parsed.email !== 'string') return null;
    if (parsed.displayName !== undefined && typeof parsed.displayName !== 'string') return null;
    if (parsed.photoURL !== undefined && typeof parsed.photoURL !== 'string') return null;
    return parsed as MockAuthUser;
  } catch {
    return null;
  }
};

const notifyMockListeners = () => {
  for (const listener of mockListeners) {
    listener(mockCurrentUser);
  }
};

const setMockSignedOut = (signedOut: boolean) => {
  if (!hasLocalStorage()) return;
  try {
    localStorage.setItem(MOCK_AUTH_SIGNED_OUT_KEY, signedOut ? 'true' : 'false');
  } catch {
    // Ignore persistence errors
  }
};

const upsertMockUserProfile = (user: MockAuthUser) => {
  const state = readMockDb();
  const existing = state.users.find((u) => u.uid === user.uid);
  const now = new Date().toISOString();
  const nextUsers = existing
    ? state.users.map((u) =>
        u.uid === user.uid
          ? { ...u, email: user.email, displayName: user.displayName, photoURL: user.photoURL }
          : u
      )
    : [...state.users, { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL, createdAt: now }];

  writeMockDb({ ...state, users: nextUsers });
};

const setMockCurrentUser = (user: MockAuthUser | null) => {
  mockCurrentUser = user;

  if (hasLocalStorage()) {
    try {
      if (!user) {
        localStorage.removeItem(MOCK_AUTH_USER_KEY);
      } else {
        localStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(user));
        upsertMockUserProfile(user);
      }
    } catch {
      // Ignore persistence errors
    }
  }

  notifyMockListeners();
};

const getOrCreateMockUser = (): MockAuthUser | null => {
  if (mockCurrentUser) return mockCurrentUser;

  if (hasLocalStorage()) {
    const signedOut = localStorage.getItem(MOCK_AUTH_SIGNED_OUT_KEY) === 'true';
    const raw = localStorage.getItem(MOCK_AUTH_USER_KEY);
    if (raw) {
      const parsed = safeParseUser(raw);
      if (parsed) {
        mockCurrentUser = parsed;
        upsertMockUserProfile(parsed);
        return parsed;
      }
    }

    if (signedOut) {
      mockCurrentUser = null;
      return null;
    }
  }

  const defaultUser: MockAuthUser = {
    uid: 'mock_user_1',
    email: 'mock.user@example.com',
    displayName: 'Mock User',
  };
  setMockSignedOut(false);
  setMockCurrentUser(defaultUser);
  return defaultUser;
};

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  if (!isFirebaseMode) {
    const user: MockAuthUser = {
      uid: generateMockId('user'),
      email,
      displayName: displayName || email.split('@')[0] || 'User',
    };
    setMockSignedOut(false);
    setMockCurrentUser(user);
    return { success: true, user: user as unknown as User };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: email,
      displayName: displayName || '',
      createdAt: new Date().toISOString(),
    });

    // Trigger welcome email for new account (fire-and-forget)
    triggerAccountCreatedEmail(email, displayName);

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
  if (!isFirebaseMode) {
    const existing = getOrCreateMockUser();
    if (existing && existing.email === email) {
      setMockSignedOut(false);
      setMockCurrentUser(existing);
      return { success: true, user: existing as unknown as User };
    }

    const user: MockAuthUser = {
      uid: generateMockId('user'),
      email,
      displayName: email.split('@')[0] || 'User',
    };
    setMockSignedOut(false);
    setMockCurrentUser(user);
    return { success: true, user: user as unknown as User };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
  if (!isFirebaseMode) {
    const prior = getOrCreateMockUser();
    const user: MockAuthUser = prior || {
      uid: generateMockId('user'),
      email: 'mock.google.user@example.com',
      displayName: 'Mock Google User',
    };

    const isNewUser = !prior;
    setMockSignedOut(false);
    setMockCurrentUser(user);
    return { success: true, user: user as unknown as User, isNewUser };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    const isNewUser = !userDocSnap.exists();

    // Create user document if it doesn't exist, or update photoURL if it changed
    if (isNewUser) {
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
      });

      // Trigger welcome email for new account (fire-and-forget)
      triggerAccountCreatedEmail(user.email || '', user.displayName || '');
    } else {
      // Update photoURL for existing users (in case they changed their profile picture)
      await setDoc(userDocRef, {
        photoURL: user.photoURL,
        displayName: user.displayName,
      }, { merge: true });
    }

    return { success: true, user, isNewUser };
  } catch (error: any) {
    // Handle popup closed by user gracefully
    if (error.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Sign-in was cancelled. Please try again.', isNewUser: false };
    }
    return { success: false, error: error.message, isNewUser: false };
  }
};

// Sign out
export const signOut = async () => {
  if (!isFirebaseMode) {
    setMockSignedOut(true);
    setMockCurrentUser(null);
    return { success: true };
  }

  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Listen to auth state changes
export const listenToAuthState = (callback: (user: User | null) => void) => {
  if (!isFirebaseMode) {
    const user = getOrCreateMockUser();
    const wrapped = (nextUser: MockAuthUser | null) => callback(nextUser as unknown as User | null);
    mockListeners.add(wrapped);
    wrapped(user);
    return () => {
      mockListeners.delete(wrapped);
    };
  }

  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  if (!isFirebaseMode) {
    return getOrCreateMockUser() as unknown as User | null;
  }
  return auth.currentUser;
};

// Update user profile with display name
export const updateUserProfile = async (displayName: string) => {
  if (!isFirebaseMode) {
    const user = getOrCreateMockUser();
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }
    setMockSignedOut(false);
    setMockCurrentUser({ ...user, displayName });
    return { success: true };
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No user logged in' };
    }

    // Update Firebase Auth profile
    await updateProfile(user, { displayName });

    // Update Firestore user document
    await updateDoc(doc(db, 'users', user.uid), {
      displayName: displayName,
      profileCompletedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
