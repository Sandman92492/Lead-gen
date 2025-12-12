import React, { createContext, useContext, useState, useEffect } from 'react';
import { listenToAuthState } from '../services/authService';
import { getPassesByUserId } from '../services/firestoreService';

export type UserState = 'free' | 'signed-in' | 'signed-in-with-pass';

const PAHP_CACHED_PASS_KEY = 'pahp_cached_pass_v1';

export interface PassInfo {
  passId: string;
  passHolderName: string;
  passType: 'holiday' | 'annual';
  expiryDate: string;
  paymentStatus?: 'completed' | 'pending' | 'failed';
  purchasePrice?: number; // Actual price paid in Rands
}

interface AuthContextType {
  user: any; // Firebase user or null
  userState: UserState;
  pass: PassInfo | null;
  isLoading: boolean;
  userPhotoURL?: string;
  redeemedDeals: string[];
  setRedeemedDeals: (deals: string[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [pass, setPass] = useState<PassInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhotoURL, setUserPhotoURL] = useState<string | undefined>(undefined);
  const [redeemedDeals, setRedeemedDeals] = useState<string[]>([]);

  // Determine user state based on auth and pass status
  const userState: UserState = !user ? 'free' : pass ? 'signed-in-with-pass' : 'signed-in';

  // Listen to auth state changes
  useEffect(() => {
    const getCachedPass = (uid: string): PassInfo | null => {
      try {
        const raw = localStorage.getItem(PAHP_CACHED_PASS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as any;
        const passCandidate: any = parsed?.pass ? parsed.pass : parsed;
        const cachedUid: any = parsed?.uid;

        if (cachedUid && typeof cachedUid === 'string' && cachedUid !== uid) return null;
        if (!passCandidate || typeof passCandidate !== 'object') return null;
        if (typeof passCandidate.passId !== 'string') return null;
        if (typeof passCandidate.passHolderName !== 'string') return null;
        if (passCandidate.passType !== 'holiday' && passCandidate.passType !== 'annual') return null;
        if (typeof passCandidate.expiryDate !== 'string') return null;
        return passCandidate as PassInfo;
      } catch {
        return null;
      }
    };

    const setCachedPass = (uid: string, nextPass: PassInfo) => {
      try {
        localStorage.setItem(PAHP_CACHED_PASS_KEY, JSON.stringify({ uid, pass: nextPass }));
      } catch {
        // Ignore cache errors
      }
    };

    // Set a timeout to force hide loading after 3 seconds even if auth check hasn't completed
    const loadingTimeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const unsubscribe = listenToAuthState(async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Use photoURL directly from Firebase user object, with caching to avoid rate limits
        if (currentUser.photoURL) {
          setUserPhotoURL(currentUser.photoURL);
          // Cache the photoURL for this user to avoid repeated requests
          localStorage.setItem(`photoURL_${currentUser.uid}`, currentUser.photoURL);
        }

        // Fetch user's pass
        try {
          const passes = await getPassesByUserId(currentUser.uid);
          const activePass = passes.find(p => p.paymentStatus === 'completed');
          
          if (activePass) {
            const nextPass: PassInfo = {
              passId: activePass.passId,
              passHolderName: activePass.passHolderName,
              passType: activePass.passType,
              expiryDate: activePass.expiryDate,
              paymentStatus: activePass.paymentStatus,
              purchasePrice: activePass.purchasePrice,
            };
            setPass(nextPass);
            setCachedPass(currentUser.uid, nextPass);
          } else {
            const isNavigatorOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
            if (isNavigatorOffline) {
              const cachedPass = getCachedPass(currentUser.uid);
              if (cachedPass) {
                setPass(cachedPass);
              } else {
                setPass(null);
              }
            } else {
              setPass(null);
            }
          }
        } catch {
          const cachedPass = getCachedPass(currentUser.uid);
          if (cachedPass) {
            setPass(cachedPass);
          } else {
            setPass(null);
          }
        }
      } else {
        setUserPhotoURL(undefined);
        setPass(null);
        setRedeemedDeals([]);
      }

      setIsLoading(false);
      clearTimeout(loadingTimeoutId);
    });

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeoutId);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userState,
        pass,
        isLoading,
        userPhotoURL,
        redeemedDeals,
        setRedeemedDeals,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
