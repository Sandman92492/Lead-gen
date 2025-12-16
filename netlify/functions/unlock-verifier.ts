import type { Handler } from '@netlify/functions';
import { getFirebaseAdmin } from './lib/firebaseAdmin';
import { signHmacToken } from './lib/hmacToken';
import { verifyPin } from './lib/pin';

const VERIFIER_SESSION_SECRET = process.env.VERIFIER_SESSION_SECRET || '';
const VERIFIER_SESSION_TTL_SECONDS = Number.parseInt(process.env.VERIFIER_SESSION_TTL_SECONDS || '900', 10);

type UnlockBody = {
  pin?: string;
  deviceId?: string;
};

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!VERIFIER_SESSION_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Verifier session not configured' }) };
  }

  const authHeader = event.headers.authorization || (event.headers as any).Authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!idToken) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization token' }) };
  }

  let body: UnlockBody;
  try {
    body = JSON.parse(event.body || '{}') as UnlockBody;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const pin = String(body.pin || '').trim();
  const deviceId = String(body.deviceId || '').trim();
  if (!/^\d{4}$/.test(pin)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'PIN must be 4 digits' }) };
  }

  try {
    const { auth, db } = getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const staffQuery = await db.collection('staff').where('userId', '==', uid).limit(1).get();
    if (staffQuery.empty) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized as staff' }) };
    }

    const staffDoc = staffQuery.docs[0];
    const staff = staffDoc.data() as any;
    if (staff.isActive !== true) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Staff account inactive' }) };
    }

    const approvedDeviceIds = Array.isArray(staff.approvedDeviceIds) ? staff.approvedDeviceIds : [];
    if (approvedDeviceIds.length > 0) {
      if (!deviceId || !approvedDeviceIds.includes(deviceId)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Device not approved' }) };
      }
    }

    const pinHash = String(staff.pinHash || '');
    if (!verifyPin(pin, pinHash)) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid PIN' }) };
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + Math.max(60, Number.isFinite(VERIFIER_SESSION_TTL_SECONDS) ? VERIFIER_SESSION_TTL_SECONDS : 900);

    const sessionToken = signHmacToken(
      {
        v: 1,
        iat: now,
        exp,
        staffId: staffDoc.id,
        orgId: String(staff.orgId || ''),
        userId: uid,
        deviceId,
      },
      VERIFIER_SESSION_SECRET
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionToken, expiresAt: new Date(exp * 1000).toISOString() }),
    };
  } catch (error: any) {
    console.error('unlock-verifier error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };

