export type MockVerifyArgs = {
  code: string;
  checkpointId: string;
  sessionToken?: string | null;
};

export type MockVerifyResult = {
  result: 'allowed' | 'denied';
  reason: string;
};

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

export const mockVerify = async ({ code, checkpointId }: MockVerifyArgs): Promise<MockVerifyResult> => {
  const normalized = String(code || '').replace(/\D/g, '');
  if (normalized.length !== 4) {
    return { result: 'denied', reason: 'Invalid code' };
  }

  const hash = hashString(`${checkpointId}:${normalized}`);
  const allowed = hash % 2 === 0;

  if (allowed) {
    return { result: 'allowed', reason: 'Valid' };
  }

  const reasonPick = hash % 3;
  if (reasonPick === 0) return { result: 'denied', reason: 'Expired' };
  if (reasonPick === 1) return { result: 'denied', reason: 'Not permitted' };
  return { result: 'denied', reason: 'Invalid code' };
};
