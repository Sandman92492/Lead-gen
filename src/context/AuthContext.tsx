import React, { createContext, useContext, useState, useEffect } from 'react';
import { listenToAuthState } from '../services/authService';

export type UserState = 'free' | 'signed-in' | 'signed-in-with-pass';

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
        // Lead Wallet MVP: no pass purchase gating.
        setPass(null);
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
