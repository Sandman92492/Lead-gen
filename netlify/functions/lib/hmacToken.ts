import { createHmac, timingSafeEqual } from 'crypto';

const base64UrlEncode = (input: Buffer | string): string => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf-8');
  return buffer
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const base64UrlDecode = (input: string): Buffer => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padLength);
  return Buffer.from(padded, 'base64');
};

export type HmacTokenPayload = Record<string, unknown> & { iat: number; exp: number; v: number };

export const signHmacToken = (payload: HmacTokenPayload, secret: string): string => {
  const payloadJson = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadJson);
  const signature = createHmac('sha256', secret).update(payloadB64).digest();
  const signatureB64 = base64UrlEncode(signature);
  return `${payloadB64}.${signatureB64}`;
};

export const verifyHmacToken = <T extends HmacTokenPayload>(
  token: string,
  secret: string
): { ok: true; payload: T } | { ok: false; error: string } => {
  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, error: 'Invalid token format' };

  const [payloadB64, signatureB64] = parts;
  const expected = createHmac('sha256', secret).update(payloadB64).digest();
  const received = base64UrlDecode(signatureB64);

  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return { ok: false, error: 'Invalid token signature' };
  }

  let payload: any;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf-8'));
  } catch {
    return { ok: false, error: 'Invalid token payload' };
  }

  if (!payload || typeof payload !== 'object') return { ok: false, error: 'Invalid token payload' };
  if (payload.v !== 1) return { ok: false, error: 'Unsupported token version' };
  if (typeof payload.exp !== 'number' || typeof payload.iat !== 'number') {
    return { ok: false, error: 'Invalid token timestamps' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) return { ok: false, error: 'Token expired' };

  return { ok: true, payload: payload as T };
};

