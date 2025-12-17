import { Handler } from '@netlify/functions';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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

const parseIsoDate = (value: unknown) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const clampLimit = (value: unknown) => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 100;
  return Math.max(1, Math.min(200, Math.floor(n)));
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
    const body = JSON.parse(event.body || '{}') as {
      sessionId?: string;
      from?: string;
      to?: string;
      limit?: number;
    };

    const sessionId = String(body.sessionId || '').trim();
    if (!sessionId) {
      return {
        statusCode: 400,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Missing sessionId' }),
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

    const sessionSnap = await firestoreDb.collection('vendorSessions').doc(sessionId).get();
    if (!sessionSnap.exists) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Session expired' }),
      };
    }

    const session = sessionSnap.data() as any;
    const vendorId = String(session?.vendorId || '').trim();
    const expiresAt = parseIsoDate(session?.expiresAt);
    if (!vendorId || !expiresAt || expiresAt.getTime() <= Date.now()) {
      return {
        statusCode: 401,
        headers: JSON_HEADERS,
        body: JSON.stringify({ ok: false, error: 'Session expired' }),
      };
    }

    const limit = clampLimit(body.limit);
    const from = parseIsoDate(body.from);
    const to = parseIsoDate(body.to);

    let q = firestoreDb
      .collection('redemptions')
      .where('vendorId', '==', vendorId);

    if (from) q = q.where('redeemedAt', '>=', from.toISOString());
    if (to) q = q.where('redeemedAt', '<=', to.toISOString());

    q = q.orderBy('redeemedAt', 'desc').limit(limit);

    const redemptionsSnap = await q.get();
    const redemptionRows = redemptionsSnap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));

    const uniquePassIds = Array.from(new Set(redemptionRows.map((r: any) => String(r.passId || '')).filter(Boolean)));
    const passSnaps = await Promise.all(
      uniquePassIds.map((passId) => firestoreDb.collection('passes').doc(passId).get())
    );

    const passById = new Map<string, any>();
    passSnaps.forEach((snap: any) => {
      if (!snap.exists) return;
      const data = snap.data() as any;
      const passId = String(data?.passId || snap.id);
      if (passId) passById.set(passId, data);
    });

    const uniqueUserIds = Array.from(
      new Set(
        redemptionRows
          .map((r: any) => String(r.userId || ''))
          .filter(Boolean)
      )
    );
    const userSnaps = await Promise.all(
      uniqueUserIds.map((uid) => firestoreDb.collection('users').doc(uid).get())
    );

    const userById = new Map<string, any>();
    userSnaps.forEach((snap: any) => {
      if (!snap.exists) return;
      userById.set(snap.id, snap.data() as any);
    });

    const redemptions = redemptionRows.map((r: any) => {
      const passId = String(r.passId || '');
      const userId = String(r.userId || '');
      const pass = passId ? passById.get(passId) : undefined;
      const user = userId ? userById.get(userId) : undefined;

      return {
        redeemedAt: String(r.redeemedAt || ''),
        dealName: String(r.dealName || ''),
        passId,
        userId,
        customer: {
          name: String(pass?.passHolderName || user?.displayName || ''),
          email: String(pass?.email || user?.email || ''),
          photoURL: user?.photoURL ? String(user.photoURL) : undefined,
        },
      };
    });

    try {
      await firestoreDb.collection('vendorSessions').doc(sessionId).update({
        lastSeenAt: new Date().toISOString(),
      });
    } catch {
      // Ignore session update errors
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: true, vendorId, redemptions }),
    };
  } catch (error: any) {
    console.error('vendor-redemptions error:', error);

    const message = String(error?.message || '');
    if (message.toLowerCase().includes('requires an index')) {
      return {
        statusCode: 500,
        headers: JSON_HEADERS,
        body: JSON.stringify({
          ok: false,
          error: 'Missing Firestore index for redemptions query (vendorId + redeemedAt). Create the suggested composite index in Firestore.',
        }),
      };
    }

    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Internal server error' }),
    };
  }
};

export { handler };
