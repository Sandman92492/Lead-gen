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

// Sign up with email and password
export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
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
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in with Google
export const signInWithGoogle = async () => {
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
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Listen to auth state changes
export const listenToAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Update user profile with display name
export const updateUserProfile = async (displayName: string) => {
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
