import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const PIN_RE = /^\d{4}$/;

export const hashPin = (pin: string): string => {
  const normalized = String(pin ?? '').trim();
  if (!PIN_RE.test(normalized)) {
    throw new Error('PIN must be 4 digits');
  }

  const salt = randomBytes(16);
  const derived = scryptSync(normalized, salt, 32);
  return `scrypt$${salt.toString('base64')}$${derived.toString('base64')}`;
};

export const verifyPin = (pin: string, stored: string): boolean => {
  const normalized = String(pin ?? '').trim();
  if (!PIN_RE.test(normalized)) return false;
  if (!stored || typeof stored !== 'string') return false;

  if (!stored.startsWith('scrypt$')) {
    const left = Buffer.from(normalized, 'utf-8');
    const right = Buffer.from(stored, 'utf-8');
    return left.length === right.length && timingSafeEqual(left, right);
  }

  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  const saltB64 = parts[1] || '';
  const hashB64 = parts[2] || '';
  if (!saltB64 || !hashB64) return false;

  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(hashB64, 'base64');
  const derived = scryptSync(normalized, salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
};
