import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { getCheckpointsByOrgId } from '../services/accessService';
import VerifierUnlockModal from '../components/VerifierUnlockModal';
import VerifierResultCard from '../components/VerifierResultCard';
import QrScanModal from '../components/QrScanModal';
import { copy } from '../copy';
import { mockVerify } from '../services/mockVerify';

const mode = ((import.meta as any).env.VITE_DATA_MODE ?? 'mock') as string;
const isFirebaseMode = mode === 'firebase';
const verifierPin = String(((import.meta as any).env.VITE_VERIFIER_PIN ?? '1234') as string);

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
  const [showUnlockModal, setShowUnlockModal] = useState(true);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

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

    setIsUnlocking(true);
    try {
      if (!isFirebaseMode || !user || typeof user.getIdToken !== 'function') {
        // Mock/local fallback
        if (pin !== verifierPin) {
          setSessionError('Invalid PIN.');
          setIsUnlocking(false);
          return;
        }
        const mockPayload = {
          v: 1,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 900,
          staffId: 'mock_staff_1',
          orgId: 'mock_org_1',
          userId: user?.uid || 'mock_user_1',
          deviceId,
        };
        setSessionToken(`${btoa(JSON.stringify(mockPayload))}.mock_signature`);
        setShowUnlockModal(false);
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
      setShowUnlockModal(false);
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
      if (isFirebaseMode) {
        const response = await fetch('/.netlify/functions/validate-rotating-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Verifier-Session': `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ code, checkpointId }),
        });
        const data = (await response.json()) as { result?: 'allowed' | 'denied'; reason?: string; error?: string };
        if (!response.ok || !data.result) {
          setResult({ result: 'denied', reason: data.error || 'Verification failed' });
        } else {
          setResult({ result: data.result, reason: data.reason || '—' });
        }
      } else {
        const data = await mockVerify({ code, checkpointId, sessionToken });
        setResult({ result: data.result, reason: data.reason });
      }
      setIsVerifying(false);
      setCode('');
    } catch {
      setResult({ result: 'denied', reason: 'Invalid code' });
      setIsVerifying(false);
    }
  }, [checkpointId, code, sessionToken]);

  const locked = !sessionToken;

  return (
    <main className="min-h-screen bg-bg-primary px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-black text-text-primary">{copy.verifier.title}</h1>
          <p className="text-text-secondary mt-1">{copy.verifier.subtitle}</p>
        </div>

        {!user && isFirebaseMode && (
          <div className="bg-bg-card border border-border-subtle rounded-[var(--r-lg)] p-5">
            <p className="text-text-primary font-semibold">Sign in required</p>
            <p className="text-text-secondary text-sm mt-1"><span className="font-mono">/verify</span></p>
          </div>
        )}

        {(!isFirebaseMode || user) && (
          <div className="bg-bg-card border border-border-subtle rounded-[var(--r-lg)] shadow-[var(--shadow)] p-5">
            {locked ? (
              <div className="space-y-3">
                <Button variant="primary" className="w-full" onClick={() => setShowUnlockModal(true)}>
                  {copy.verifier.unlock}
                </Button>
              </div>
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
                      setShowUnlockModal(true);
                    }}
                    className="text-xs font-semibold text-text-secondary hover:text-text-primary"
                  >
                    Lock
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">{copy.verifier.checkpointLabel}</div>
                    {checkpoints.length > 0 ? (
                      <select
                        value={checkpointId}
                        onChange={(e) => setCheckpointId(e.target.value)}
                        className="w-full rounded-[var(--r-lg)] bg-bg-primary border border-border-subtle px-4 py-3 text-sm text-text-primary transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
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
                        className="w-full rounded-[var(--r-lg)] bg-bg-primary border border-border-subtle px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/60 transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                      />
                    )}
                  </div>

                  <div>
                    <div className="text-xs uppercase tracking-widest text-text-secondary mb-2">{copy.verifier.codeLabel}</div>
                    <input
                      inputMode="numeric"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="1234"
                      className="w-full rounded-[var(--r-lg)] bg-bg-primary border border-border-subtle px-4 py-3 text-center text-2xl font-mono text-text-primary placeholder:text-text-secondary/60 transition focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent"
                      disabled={isVerifying}
                    />
                  </div>

                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setIsScanModalOpen(true)}
                    disabled={isVerifying}
                  >
                    Scan QR code
                  </Button>

                  <Button
                    variant="primary"
                    className="w-full text-lg"
                    onClick={handleVerify}
                    disabled={isVerifying || code.length !== 4 || !checkpointId}
                  >
                    {isVerifying ? copy.verifier.verifying : copy.verifier.verify}
                  </Button>

                  {result && (
                    <VerifierResultCard
                      result={result.result}
                      reason={result.reason}
                      onNext={() => {
                        setResult(null);
                        setCode('');
                      }}
                    />
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

      <VerifierUnlockModal
        isOpen={locked && showUnlockModal && (!isFirebaseMode || !!user)}
        pin={pin}
        onPinChange={setPin}
        onUnlock={handleUnlock}
        isUnlocking={isUnlocking}
        error={sessionError}
        onClose={() => setShowUnlockModal(false)}
      />

      <QrScanModal
        isOpen={!locked && isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onDetected={(next) => setCode(next)}
      />
    </main>
  );
};

export default VerifierPage;
