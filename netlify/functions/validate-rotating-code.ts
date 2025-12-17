import type { Handler } from '@netlify/functions';
import { Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './lib/firebaseAdmin';
import { verifyHmacToken } from './lib/hmacToken';

const VERIFIER_SESSION_SECRET = process.env.VERIFIER_SESSION_SECRET || '';
const VERIFIER_MOCK_MODE = (process.env.VERIFIER_MOCK_MODE || '').toLowerCase() === 'true';

type SessionPayload = {
  v: 1;
  iat: number;
  exp: number;
  staffId: string;
  orgId: string;
  userId: string;
  deviceId?: string;
};

type ValidateBody = {
  code?: string;
  checkpointId?: string;
};

const CODE_RE = /^\d{4}$/;

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  if (!VERIFIER_SESSION_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Verifier session not configured' }) };
  }

  const sessionHeader =
    event.headers['x-verifier-session'] ||
    (event.headers as any)['X-Verifier-Session'] ||
    event.headers.authorization ||
    (event.headers as any).Authorization ||
    '';
  const sessionToken = sessionHeader.startsWith('Bearer ') ? sessionHeader.slice(7).trim() : String(sessionHeader || '').trim();
  if (!sessionToken) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing verifier session token' }) };
  }

  const session = verifyHmacToken<SessionPayload>(sessionToken, VERIFIER_SESSION_SECRET);
  if (!session.ok) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid verifier session' }) };
  }

  let body: ValidateBody;
  try {
    body = JSON.parse(event.body || '{}') as ValidateBody;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const code = String(body.code || '').trim();
  const checkpointId = String(body.checkpointId || '').trim();
  if (!CODE_RE.test(code)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Code must be 4 digits' }) };
  }
  if (!checkpointId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'checkpointId is required' }) };
  }

  try {
    if (VERIFIER_MOCK_MODE) {
      const hash = hashString(`${checkpointId}:${code}`);
      const allowed = hash % 2 === 0;
      return {
        statusCode: 200,
        body: JSON.stringify({
          result: allowed ? 'allowed' : 'denied',
          reason: allowed ? 'mock_ok' : 'mock_denied',
          checkpoint: { checkpointId, name: '' },
          credential: null,
        }),
      };
    }

    const { db } = getFirebaseAdmin();
    const nowMs = Date.now();
    const orgId = String(session.payload.orgId || '');
    const staffId = String(session.payload.staffId || '');
    const deviceId = String(session.payload.deviceId || '');

    const staffSnap = await db.collection('staff').doc(staffId).get();
    if (!staffSnap.exists) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Staff not found' }) };
    }
    const staff = staffSnap.data() as any;
    if (staff.isActive !== true) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Staff account inactive' }) };
    }
    if (String(staff.orgId || '') !== orgId) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Org mismatch' }) };
    }

    const approvedDeviceIds = Array.isArray(staff.approvedDeviceIds) ? staff.approvedDeviceIds : [];
    if (approvedDeviceIds.length > 0) {
      if (!deviceId || !approvedDeviceIds.includes(deviceId)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Device not approved' }) };
      }
    }

    const checkpointSnap = await db.collection('checkpoints').doc(checkpointId).get();
    if (!checkpointSnap.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Checkpoint not found' }) };
    }
    const checkpoint = checkpointSnap.data() as any;
    if (checkpoint.isActive !== true) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Checkpoint inactive' }) };
    }
    if (String(checkpoint.orgId || '') !== orgId) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Checkpoint org mismatch' }) };
    }

    const codeDoc = await db.collection('rotatingCodes').doc(`${orgId}_${code}`).get();
    const codeData = codeDoc.exists ? (codeDoc.data() as any) : null;
    const expiresAtValue = codeData?.expiresAt as Timestamp | string | undefined;
    let expiresAtMs = 0;
    if (expiresAtValue && typeof (expiresAtValue as any).toMillis === 'function') {
      expiresAtMs = Number((expiresAtValue as any).toMillis());
    } else if (typeof expiresAtValue === 'string') {
      const parsed = Date.parse(expiresAtValue);
      expiresAtMs = Number.isFinite(parsed) ? parsed : 0;
    }

    let credentialId: string | null = null;
    let result: 'allowed' | 'denied' = 'denied';
    let reason = 'invalid_code';
    let credentialSummary: any = null;

    if (!codeData || expiresAtMs <= nowMs) {
      reason = 'code_expired_or_invalid';
    } else {
      credentialId = String(codeData.credentialId || '');
      if (!credentialId) {
        reason = 'invalid_code_mapping';
      } else {
        const credentialSnap = await db.collection('credentials').doc(credentialId).get();
        if (!credentialSnap.exists) {
          reason = 'credential_not_found';
        } else {
          const credential = credentialSnap.data() as any;
          const credentialOrgId = String(credential.orgId || '');
          const status = String(credential.status || '');
          const credentialType = String(credential.credentialType || '');
          const validFromMs = Date.parse(String(credential.validFrom || ''));
          const validToMs = Date.parse(String(credential.validTo || ''));

          if (credentialOrgId !== orgId) {
            reason = 'credential_org_mismatch';
          } else if (status !== 'active') {
            reason = status === 'suspended' ? 'credential_suspended' : 'credential_inactive';
          } else if (!Number.isFinite(validFromMs) || !Number.isFinite(validToMs)) {
            reason = 'credential_invalid_dates';
          } else if (nowMs < validFromMs || nowMs > validToMs) {
            reason = nowMs > validToMs ? 'credential_expired' : 'credential_not_yet_valid';
          } else {
            const allowedTypes = Array.isArray(checkpoint.allowedTypes) ? checkpoint.allowedTypes.map(String) : [];
            if (allowedTypes.length > 0 && !allowedTypes.includes(credentialType)) {
              reason = 'credential_type_not_allowed';
            } else {
              result = 'allowed';
              reason = 'ok';
            }
          }

          credentialSummary = {
            credentialId,
            credentialType,
            status,
            validFrom: String(credential.validFrom || ''),
            validTo: String(credential.validTo || ''),
            displayName: String(credential.displayName || ''),
            memberNo: credential.memberNo ?? null,
            unitNo: credential.unitNo ?? null,
          };
        }
      }
    }

    await db.collection('checkins').add({
      orgId,
      credentialId: credentialId || 'unknown',
      checkpointId,
      staffId,
      deviceId,
      result,
      reason,
      createdAt: new Date(nowMs).toISOString(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        result,
        reason,
        checkpoint: { checkpointId, name: String(checkpoint.name || '') },
        credential: credentialSummary,
      }),
    };
  } catch (error: any) {
    console.error('validate-rotating-code error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
