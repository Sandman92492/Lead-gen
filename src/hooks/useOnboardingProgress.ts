import { useEffect, useState, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import type { OnboardingProgress } from '../types/onboarding';
import { DEFAULT_ONBOARDING_PROGRESS } from '../types/onboarding';

const STORAGE_KEY = 'lw_onboarding_progress';

// Check if we're in Firebase mode
const isFirebaseMode = !!db;

export const useOnboardingProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress>(() => {
    // Try to load from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_ONBOARDING_PROGRESS, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_ONBOARDING_PROGRESS;
      }
    }
    return DEFAULT_ONBOARDING_PROGRESS;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenWizard, setHasSeenWizard] = useState(() => {
    return localStorage.getItem(`${STORAGE_KEY}_seen`) === 'true';
  });

  // Subscribe to Firestore for progress (only in Firebase mode)
  useEffect(() => {
    if (!isFirebaseMode || !user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      const docRef = doc(db, 'users', user.uid, 'meta', 'onboarding');
      const unsub = onSnapshot(
        docRef,
        (snap) => {
          if (snap.exists()) {
            const data = { ...DEFAULT_ONBOARDING_PROGRESS, ...snap.data() } as OnboardingProgress;
            setProgress(data);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        }
      );

      return () => unsub();
    } catch {
      setIsLoading(false);
    }
  }, [user?.uid]);

  const updateProgress = useCallback(
    async (updates: Partial<OnboardingProgress>) => {
      const newProgress = { ...progress, ...updates };
      setProgress(newProgress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));

      if (isFirebaseMode && user?.uid) {
        try {
          const docRef = doc(db, 'users', user.uid, 'meta', 'onboarding');
          await setDoc(docRef, newProgress, { merge: true });
        } catch {
          // Silently fail - localStorage is the fallback
        }
      }
    },
    [user?.uid, progress]
  );

  const markWizardSeen = useCallback(() => {
    localStorage.setItem(`${STORAGE_KEY}_seen`, 'true');
    setHasSeenWizard(true);
  }, []);

  const resetWizard = useCallback(() => {
    localStorage.removeItem(`${STORAGE_KEY}_seen`);
    setHasSeenWizard(false);
  }, []);

  // Calculate completion
  const completedSteps = Object.values(progress).filter(Boolean).length;
  const totalSteps = Object.keys(progress).length;
  const isComplete = completedSteps === totalSteps;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);

  // Should show wizard on first open (not seen + not complete)
  const shouldShowWizard = !hasSeenWizard && !isComplete && !isLoading;

  return {
    progress,
    isLoading,
    updateProgress,
    completedSteps,
    totalSteps,
    isComplete,
    progressPercent,
    hasSeenWizard,
    shouldShowWizard,
    markWizardSeen,
    resetWizard,
  };
};
