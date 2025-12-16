import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { vendorLogin, VendorSummary } from '../services/vendorApi';

interface VendorSessionState {
  sessionId: string;
  vendor: VendorSummary;
  expiresAt: string;
}

interface VendorAuthContextType {
  vendor: VendorSummary | null;
  sessionId: string | null;
  expiresAt: string | null;
  isAuthed: boolean;
  isLoading: boolean;
  login: (vendorId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const STORAGE_KEY = 'pahp_vendor_session_v1';

const VendorAuthContext = createContext<VendorAuthContextType | undefined>(undefined);

export const VendorAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vendor, setVendor] = useState<VendorSummary | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = () => {
    setVendor(null);
    setSessionId(null);
    setExpiresAt(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsLoading(false);
        return;
      }

      const parsed = JSON.parse(raw) as any;
      const sid = String(parsed?.sessionId || '').trim();
      const exp = String(parsed?.expiresAt || '').trim();
      const v = parsed?.vendor;

      if (!sid || !exp || !v || typeof v !== 'object') {
        clearSession();
        setIsLoading(false);
        return;
      }

      const expDate = new Date(exp);
      if (Number.isNaN(expDate.getTime()) || expDate.getTime() <= Date.now()) {
        clearSession();
        setIsLoading(false);
        return;
      }

      const vendorId = String(v.vendorId || '').trim();
      const name = String(v.name || '').trim();
      if (!vendorId || !name) {
        clearSession();
        setIsLoading(false);
        return;
      }

      setSessionId(sid);
      setExpiresAt(exp);
      setVendor({ vendorId, name });
      setIsLoading(false);
    } catch {
      clearSession();
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const expDate = new Date(expiresAt);
    if (Number.isNaN(expDate.getTime())) return;

    const msUntilExpiry = expDate.getTime() - Date.now();
    if (msUntilExpiry <= 0) {
      clearSession();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      clearSession();
    }, msUntilExpiry);

    return () => window.clearTimeout(timeoutId);
  }, [expiresAt]);

  const isAuthed = useMemo(() => {
    if (!vendor || !sessionId || !expiresAt) return false;
    const expDate = new Date(expiresAt);
    if (Number.isNaN(expDate.getTime())) return false;
    return expDate.getTime() > Date.now();
  }, [vendor, sessionId, expiresAt]);

  const login = async (vendorId: string, pin: string) => {
    const result = await vendorLogin(vendorId, pin);
    if (!result.success || !result.sessionId || !result.vendor || !result.expiresAt) {
      clearSession();
      return { success: false, error: result.error || 'Login failed' };
    }

    const nextState: VendorSessionState = {
      sessionId: result.sessionId,
      vendor: result.vendor,
      expiresAt: result.expiresAt,
    };

    setSessionId(nextState.sessionId);
    setVendor(nextState.vendor);
    setExpiresAt(nextState.expiresAt);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
      // Ignore storage errors
    }

    return { success: true };
  };

  const logout = () => clearSession();

  return (
    <VendorAuthContext.Provider value={{ vendor, sessionId, expiresAt, isAuthed, isLoading, login, logout }}>
      {children}
    </VendorAuthContext.Provider>
  );
};

export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within VendorAuthProvider');
  }
  return context;
};

