import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getCheckpointsByOrgId } from '../services/accessService';

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;
const isFirebaseMode = mode === 'firebase';

const DEVICE_ID_KEY = 'access_device_id_v1';

const getOrCreateDeviceId = (): string => {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const next =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
    localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return 'unknown_device';
  }
};

const decodeTokenPayload = (token: string): Record<string, any> | null => {
  try {
    const [payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + '='.repeat(padLength);
    const json = atob(padded);
    const parsed = JSON.parse(json) as any;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const VerifierPage: React.FC = () => {
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [checkpoints, setCheckpoints] = useState<{ checkpointId: string; name: string }[]>([]);
  const [checkpointId, setCheckpointId] = useState<string>('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{ result: 'allowed' | 'denied'; reason: string } | null>(null);

  const deviceId = useMemo(() => getOrCreateDeviceId(), []);

  const sessionPayload = useMemo(() => (sessionToken ? decodeTokenPayload(sessionToken) : null), [sessionToken]);
  const orgId = String(sessionPayload?.orgId || '');

  const loadCheckpoints = useCallback(async () => {
    if (!orgId) return;
    try {
      const items = await getCheckpointsByOrgId(orgId);
      const mapped = items
        .filter((c) => c.isActive)
        .map((c) => ({ checkpointId: c.checkpointId, name: c.name }));
      setCheckpoints(mapped);
      if (!checkpointId && mapped.length > 0) {
        setCheckpointId(mapped[0].checkpointId);
      }
    } catch {
      setCheckpoints([]);
    }
  }, [checkpointId, orgId]);

  useEffect(() => {
    void loadCheckpoints();
  }, [loadCheckpoints]);

  const handleUnlock = useCallback(async () => {
    setSessionError(null);
    setResult(null);
    if (!/^\d{4}$/.test(pin)) {
      setSessionError('PIN must be 4 digits.');
      return;
    }

    if (!user) {
      setSessionError('Sign in required.');
      return;
    }

    setIsUnlocking(true);
    try {
      if (!isFirebaseMode || typeof user.getIdToken !== 'function') {
        // Mock/local fallback
        if (pin !== '1234') {
          setSessionError('Invalid PIN (mock: use 1234).');
          setIsUnlocking(false);
          return;
        }
        const mockPayload = {
          v: 1,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 900,
          staffId: 'mock_staff_1',
          orgId: 'mock_org_1',
          userId: user.uid || 'mock_user_1',
          deviceId,
        };
        setSessionToken(`${btoa(JSON.stringify(mockPayload))}.mock_signature`);
        setIsUnlocking(false);
        return;
      }

      const idToken = await user.getIdToken();
      const response = await fetch('/.netlify/functions/unlock-verifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ pin, deviceId }),
      });

      const data = (await response.json()) as { sessionToken?: string; error?: string };
      if (!response.ok || !data.sessionToken) {
        setSessionError(data.error || 'Failed to unlock verifier.');
        setIsUnlocking(false);
        return;
      }

      setSessionToken(data.sessionToken);
      setPin('');
      setIsUnlocking(false);
    } catch {
      setSessionError('Network error. Please try again.');
      setIsUnlocking(false);
    }
  }, [deviceId, pin, user]);

  const handleVerify = useCallback(async () => {
    setResult(null);
    if (!sessionToken) return;
    if (!/^\d{4}$/.test(code)) return;
    if (!checkpointId) return;

    setIsVerifying(true);
    try {
      const response = await fetch('/.netlify/functions/validate-rotating-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Verifier-Session': sessionToken,
        },
        body: JSON.stringify({ code, checkpointId }),
      });
      const data = (await response.json()) as { result?: 'allowed' | 'denied'; reason?: string; error?: string };
      if (!response.ok) {
        setResult({ result: 'denied', reason: data.error || 'Request failed' });
        setIsVerifying(false);
        return;
      }
      setResult({ result: data.result || 'denied', reason: data.reason || 'unknown' });
      setIsVerifying(false);
      setCode('');
    } catch {
      setResult({ result: 'denied', reason: 'network_error' });
      setIsVerifying(false);
    }
  }, [checkpointId, code, sessionToken]);

  const locked = !sessionToken;

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-black text-action-primary">Verifier Mode</h1>
          <p className="text-text-secondary mt-1">Unlock with staff PIN, then verify codes</p>
        </div>

        {!user && (
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-5">
            <p className="text-text-primary font-semibold">Sign in required</p>
            <p className="text-text-secondary text-sm mt-1">
              Open the main app and sign in, then return to <span className="font-mono">/verifier</span>.
            </p>
          </div>
        )}

        {user && (
          <div className="bg-bg-card border border-border-subtle rounded-2xl shadow-[var(--shadow)] p-5">
            {locked ? (
              <>
                <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Staff PIN</div>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="••••"
                  className="w-full px-4 py-3 text-center text-2xl font-mono bg-bg-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-action-primary"
                  disabled={isUnlocking}
                />
                {sessionError && (
                  <div className="bg-urgency-high/10 border border-urgency-high rounded-lg p-3 mt-4">
                    <p className="text-sm font-semibold text-urgency-high">{sessionError}</p>
                  </div>
                )}
                <div className="mt-4">
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleUnlock}
                    disabled={isUnlocking || pin.length !== 4}
                  >
                    {isUnlocking ? 'Unlocking…' : 'Unlock Verifier'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold tracking-widest px-3 py-1 rounded-full border bg-success/15 border-success text-success">
                    UNLOCKED
                  </div>
                  <button
                    onClick={() => {
                      setSessionToken(null);
                      setResult(null);
                      setCode('');
                    }}
                    className="text-xs font-semibold text-text-secondary hover:text-text-primary"
                  >
                    Lock
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Checkpoint</div>
                    {checkpoints.length > 0 ? (
                      <select
                        value={checkpointId}
                        onChange={(e) => setCheckpointId(e.target.value)}
                        className="w-full px-4 py-3 bg-bg-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-action-primary"
                      >
                        {checkpoints.map((c) => (
                          <option key={c.checkpointId} value={c.checkpointId}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={checkpointId}
                        onChange={(e) => setCheckpointId(e.target.value)}
                        placeholder="checkpointId"
                        className="w-full px-4 py-3 bg-bg-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-action-primary"
                      />
                    )}
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">Enter 4-digit code</div>
                    <input
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="1234"
                      className="w-full px-4 py-3 text-center text-2xl font-mono bg-bg-primary border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-action-primary"
                      disabled={isVerifying}
                    />
                  </div>

                  <Button
                    variant="redeem"
                    className="w-full text-lg"
                    onClick={handleVerify}
                    disabled={isVerifying || code.length !== 4 || !checkpointId}
                  >
                    {isVerifying ? 'Verifying…' : 'Verify'}
                  </Button>

                  {result && (
                    <div
                      className={`rounded-2xl p-4 border ${
                        result.result === 'allowed'
                          ? 'bg-success/10 border-success'
                          : 'bg-urgency-high/10 border-urgency-high'
                      }`}
                    >
                      <p
                        className={`text-2xl font-display font-black ${
                          result.result === 'allowed' ? 'text-success' : 'text-urgency-high'
                        }`}
                      >
                        {result.result === 'allowed' ? 'ALLOWED' : 'DENIED'}
                      </p>
                      <p className="text-sm text-text-secondary mt-1">Reason: {result.reason}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {orgId && (
          <p className="text-center text-xs text-text-secondary mt-4">
            Org: <span className="font-mono">{orgId}</span> • Device: <span className="font-mono">{deviceId}</span>
          </p>
        )}
      </div>
    </main>
  );
};

export default VerifierPage;

