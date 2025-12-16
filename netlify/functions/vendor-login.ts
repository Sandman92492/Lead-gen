import { Handler } from '@netlify/functions';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createHash, randomUUID, scryptSync, timingSafeEqual } from 'crypto';

const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
};

let db: any;

const initFirebase = () => {
  if (!db) {
    const existingApps = getApps();
    const app = existingApps.length
      ? existingApps[0]
      : initializeApp({
        credential: cert({
          projectId: FIREBASE_PROJECT_ID,
          privateKey: FIREBASE_PRIVATE_KEY,
          clientEmail: FIREBASE_CLIENT_EMAIL,
        }),
      });
    db = getFirestore(app);
  }
  return db;
};

const isValidPin = (pin: string) => /^\d{4}$/.test(pin);

type PinHashVerificationResult =
  | { ok: true }
  | { ok: false };

const verifyScryptPinHash = (pin: string, pinHash: string): PinHashVerificationResult => {
  // Format: scrypt$<saltB64>$<hashB64>
  const parts = pinHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return { ok: false };

  const salt = Buffer.from(parts[1], 'base64');
  const expectedHash = Buffer.from(parts[2], 'base64');
  if (salt.length < 8 || expectedHash.length < 16) return { ok: false };

  const derived = scryptSync(pin, salt, expectedHash.length);
  if (derived.length !== expectedHash.length) return { ok: false };

  const matches = timingSafeEqual(derived, expectedHash);
  return matches ? { ok: true } : { ok: false };
};

const getIpHash = (event: any) => {
  const ipRaw = String(event.headers['x-forwarded-for'] || event.headers['client-ip'] || '');
  const ip = ipRaw.split(',')[0]?.trim();
  if (!ip) return undefined;
  return createHash('sha256').update(ip).digest('hex');
};

const handler: Handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: JSON_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}') as { vendorId?: string; pin?: string };
    const vendorId = String(body.vendorId || '').trim();
    const pin = String(body.pin || '').trim();

    if (!vendorId || !isValidPin(pin)) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Invalid vendor ID or PIN' }),
      };
    }

    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      return {
        statusCode: 500,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Server not configured' }),
      };
    }

    const firestoreDb = initFirebase();

    const vendorSnap = await firestoreDb.collection('vendors').doc(vendorId).get();
    if (!vendorSnap.exists) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Invalid vendor ID or PIN' }),
      };
    }

    const vendor = vendorSnap.data() as any;
    if (vendor?.isActive === false) {
      return {
        statusCode: 403,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Vendor account is inactive' }),
      };
    }

    let pinValid = false;

    const secretSnap = await firestoreDb.collection('vendorSecrets').doc(vendorId).get();
    const pinHash = secretSnap.exists ? String((secretSnap.data() as any)?.pinHash || '') : '';
    if (pinHash.startsWith('scrypt$')) {
      pinValid = verifyScryptPinHash(pin, pinHash).ok;
    }

    if (!pinValid) {
      const vendorPin = String(vendor?.pin || '');
      pinValid = vendorPin === pin;
    }

    if (!pinValid) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Invalid vendor ID or PIN' }),
      };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const sessionId = randomUUID();

    await firestoreDb.collection('vendorSessions').doc(sessionId).set({
      vendorId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastSeenAt: now.toISOString(),
      userAgent: String(event.headers['user-agent'] || '').slice(0, 300) || undefined,
      ipHash: getIpHash(event),
    });

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        ok: true,
        sessionId,
        vendor: {
          vendorId,
          name: String(vendor?.name || vendorId),
        },
        expiresAt: expiresAt.toISOString(),
      }),
    };
  } catch (error) {
    console.error('vendor-login error:', error);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Internal server error' }),
    };
  }
};

export { handler };

