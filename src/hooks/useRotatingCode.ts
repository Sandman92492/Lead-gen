import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getCredentialById } from '../services/accessService';

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;
const isFirebaseMode = mode === 'firebase';

type RotatingCodeResponse = {
  code: string;
  expiresAt: string;
  rotationSeconds: number;
  credential: {
    credentialId: string;
    orgId: string;
    credentialType: string;
    status: string;
    validFrom: string;
    validTo: string;
    displayName: string;
    memberNo?: string | null;
    unitNo?: string | null;
  };
};

export type RotatingCredentialSummary = RotatingCodeResponse['credential'];

export type UseRotatingCodeArgs = {
  user?: any;
  guestToken?: string;
};

export type UseRotatingCodeResult = {
  isLoading: boolean;
  error: string | null;
  code: string | null;
  expiresAt: string | null;
  secondsRemaining: number | null;
  rotationSeconds: number | null;
  credential: RotatingCredentialSummary | null;
  refresh: () => Promise<void>;
};

const safeParseMs = (iso: string | null): number | null => {
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
};

const randomCode = (): string => Math.floor(Math.random() * 10000).toString().padStart(4, '0');

export const useRotatingCode = ({ user, guestToken }: UseRotatingCodeArgs): UseRotatingCodeResult => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [rotationSeconds, setRotationSeconds] = useState<number | null>(null);
  const [credential, setCredential] = useState<RotatingCredentialSummary | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const refreshTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const expiresAtMs = useMemo(() => safeParseMs(expiresAt), [expiresAt]);

  const refresh = useCallback(async () => {
    setError(null);

    if (isFirebaseMode) {
      const authToken =
        guestToken || !user || typeof user.getIdToken !== 'function' ? null : await user.getIdToken();

      if (!guestToken && !authToken) {
        setIsLoading(false);
        setError('Sign in required to view this credential.');
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/.netlify/functions/issue-rotating-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(guestToken ? { guestToken } : {}),
        });

        const data = (await response.json()) as Partial<RotatingCodeResponse> & { error?: string };
        if (!response.ok) {
          setError(data.error || 'Failed to load rotating code.');
          setIsLoading(false);
          return;
        }

        if (!data.code || !data.expiresAt || !data.rotationSeconds || !data.credential) {
          setError('Unexpected response from server.');
          setIsLoading(false);
          return;
        }

        setCode(data.code);
        setExpiresAt(data.expiresAt);
        setRotationSeconds(data.rotationSeconds);
        setCredential(data.credential as RotatingCredentialSummary);
        setIsLoading(false);
      } catch {
        setError('Network error. Please try again.');
        setIsLoading(false);
      }
      return;
    }

    // Mock/local fallback (no server functions)
    setIsLoading(true);
    try {
      const credentialId = guestToken || 'mock_cred_1';
      const cred = await getCredentialById(credentialId);
      if (!cred) {
        setError('Credential not found (mock).');
        setIsLoading(false);
        return;
      }

      const nextRotationSeconds = 30;
      const nowMs = Date.now();
      const nextExpiresAt = new Date(nowMs + nextRotationSeconds * 1000).toISOString();

      setCredential({
        credentialId: cred.credentialId,
        orgId: cred.orgId,
        credentialType: cred.credentialType,
        status: cred.status,
        validFrom: cred.validFrom,
        validTo: cred.validTo,
        displayName: cred.displayName,
        memberNo: cred.memberNo ?? null,
        unitNo: cred.unitNo ?? null,
      });
      setCode(randomCode());
      setExpiresAt(nextExpiresAt);
      setRotationSeconds(nextRotationSeconds);
      setIsLoading(false);
    } catch {
      setError('Failed to load mock credential.');
      setIsLoading(false);
    }
  }, [guestToken, user]);

  useEffect(() => {
    void refresh();
    return () => {
      if (refreshTimeoutRef.current) {
        window.clearTimeout(refreshTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        window.clearInterval(countdownIntervalRef.current);
      }
    };
  }, [refresh]);

  useEffect(() => {
    if (!expiresAtMs) return;

    if (refreshTimeoutRef.current) {
      window.clearTimeout(refreshTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      window.clearInterval(countdownIntervalRef.current);
    }

    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
      setSecondsRemaining(remaining);
    };

    updateRemaining();
    countdownIntervalRef.current = window.setInterval(updateRemaining, 1000);

    const refreshInMs = Math.max(500, expiresAtMs - Date.now() - 800);
    refreshTimeoutRef.current = window.setTimeout(() => {
      void refresh();
    }, refreshInMs);
  }, [expiresAtMs, refresh]);

  return {
    isLoading,
    error,
    code,
    expiresAt,
    secondsRemaining,
    rotationSeconds,
    credential,
    refresh,
  };
};

