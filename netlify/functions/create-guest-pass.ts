import type { Handler } from '@netlify/functions';
import { randomUUID } from 'crypto';
import { getFirebaseAdmin } from './lib/firebaseAdmin';
import { signHmacToken } from './lib/hmacToken';

const GUEST_TOKEN_SECRET = process.env.GUEST_TOKEN_SECRET || '';

type CreateGuestBody = {
  guestName?: string;
  validFrom?: string;
  validTo?: string;
};

const sanitize = (value: string): string => value.replace(/[<>]/g, '').trim().slice(0, 120);

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!GUEST_TOKEN_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Guest tokens not configured' }) };
  }

  const authHeader = event.headers.authorization || (event.headers as any).Authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!idToken) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization token' }) };
  }

  let body: CreateGuestBody;
  try {
    body = JSON.parse(event.body || '{}') as CreateGuestBody;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const guestName = sanitize(String(body.guestName || 'Guest'));
  const validFromIso = String(body.validFrom || '');
  const validToIso = String(body.validTo || '');
  const validFromMs = Date.parse(validFromIso);
  const validToMs = Date.parse(validToIso);

  if (!Number.isFinite(validFromMs) || !Number.isFinite(validToMs)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'validFrom and validTo must be ISO timestamps' }) };
  }
  if (validToMs <= validFromMs) {
    return { statusCode: 400, body: JSON.stringify({ error: 'validTo must be after validFrom' }) };
  }

  const maxWindowMs = 7 * 24 * 60 * 60 * 1000;
  if (validToMs - validFromMs > maxWindowMs) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Guest pass window too long (max 7 days)' }) };
  }

  try {
    const { auth, db } = getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const nowMs = Date.now();
    const creatorQuery = await db
      .collection('credentials')
      .where('userId', '==', uid)
      .where('status', '==', 'active')
      .where('credentialType', 'in', ['resident', 'member'])
      .limit(1)
      .get();

    if (creatorQuery.empty) {
      return { statusCode: 403, body: JSON.stringify({ error: 'No active member credential found' }) };
    }

    const creatorDoc = creatorQuery.docs[0];
    const creator = creatorDoc.data() as any;
    const orgId = String(creator.orgId || '');
    if (!orgId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Creator credential missing orgId' }) };
    }

    const guestCredentialId = `guest_${randomUUID().replace(/-/g, '')}`;
    const createdAt = new Date(nowMs).toISOString();

    await db.collection('credentials').doc(guestCredentialId).set({
      credentialId: guestCredentialId,
      orgId,
      userId: null,
      credentialType: 'guest',
      status: 'active',
      validFrom: new Date(validFromMs).toISOString(),
      validTo: new Date(validToMs).toISOString(),
      displayName: guestName,
      createdAt,
      createdByUserId: uid,
      createdByCredentialId: creatorDoc.id,
    });

    const iat = Math.floor(nowMs / 1000);
    const exp = Math.floor((validToMs + 7 * 24 * 60 * 60 * 1000) / 1000);
    const token = signHmacToken(
      {
        v: 1,
        iat,
        exp,
        typ: 'guest',
        orgId,
        credentialId: guestCredentialId,
      },
      GUEST_TOKEN_SECRET
    );

    const baseUrl =
      process.env.SITE_URL ||
      (event.headers.host ? `https://${event.headers.host}` : '');
    const origin = baseUrl ? baseUrl.replace(/\/+$/, '') : '';
    const guestUrl = origin ? `${origin}/guest/${token}` : `/guest/${token}`;

    return {
      statusCode: 200,
      body: JSON.stringify({ credentialId: guestCredentialId, guestToken: token, guestUrl }),
    };
  } catch (error: any) {
    console.error('create-guest-pass error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };

