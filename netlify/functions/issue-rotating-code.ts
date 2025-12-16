import type { Handler } from '@netlify/functions';
import { Timestamp } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './lib/firebaseAdmin';
import { verifyHmacToken } from './lib/hmacToken';

const GUEST_TOKEN_SECRET = process.env.GUEST_TOKEN_SECRET || '';

type GuestTokenPayload = {
  v: 1;
  iat: number;
  exp: number;
  orgId: string;
  credentialId: string;
  typ: 'guest';
};

type IssueBody = {
  credentialId?: string;
  guestToken?: string;
};

const CODE_RE = /^\d{4}$/;

const randomCode = (): string => Math.floor(Math.random() * 10000).toString().padStart(4, '0');

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body: IssueBody;
  try {
    body = JSON.parse(event.body || '{}') as IssueBody;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const guestToken = String(body.guestToken || '').trim();
  const requestedCredentialId = String(body.credentialId || '').trim();

  const authHeader = event.headers.authorization || (event.headers as any).Authorization || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  try {
    const { auth, db } = getFirebaseAdmin();

    let credentialId = requestedCredentialId;
    let uid: string | null = null;
    let orgIdFromToken: string | null = null;

    if (guestToken) {
      if (!GUEST_TOKEN_SECRET) {
        return { statusCode: 500, body: JSON.stringify({ error: 'Guest tokens not configured' }) };
      }
      const verified = verifyHmacToken<GuestTokenPayload>(guestToken, GUEST_TOKEN_SECRET);
      if (!verified.ok) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid guest token' }) };
      }
      if (verified.payload.typ !== 'guest') {
        return { statusCode: 401, body: JSON.stringify({ error: 'Invalid guest token' }) };
      }
      orgIdFromToken = verified.payload.orgId;
      credentialId = credentialId || verified.payload.credentialId;
    } else {
      if (!idToken) {
        return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization token' }) };
      }
      const decoded = await auth.verifyIdToken(idToken);
      uid = decoded.uid;
    }

    if (!credentialId) {
      if (!uid) {
        return { statusCode: 400, body: JSON.stringify({ error: 'credentialId is required' }) };
      }

      const candidate = await db
        .collection('credentials')
        .where('userId', '==', uid)
        .where('status', '==', 'active')
        .limit(1)
        .get();

      if (candidate.empty) {
        return { statusCode: 404, body: JSON.stringify({ error: 'No active credential found' }) };
      }
      credentialId = candidate.docs[0].id;
    }

    const credentialRef = db.collection('credentials').doc(credentialId);

    const result = await db.runTransaction(async (tx) => {
      const credentialSnap = await tx.get(credentialRef);
      if (!credentialSnap.exists) {
        return { ok: false as const, statusCode: 404, body: { error: 'Credential not found' } };
      }

      const credential = credentialSnap.data() as any;
      const orgId = String(credential.orgId || orgIdFromToken || '');
      if (!orgId) {
        return { ok: false as const, statusCode: 400, body: { error: 'Credential missing orgId' } };
      }

      if (orgIdFromToken && orgIdFromToken !== orgId) {
        return { ok: false as const, statusCode: 401, body: { error: 'Guest token org mismatch' } };
      }

      if (uid && credential.userId && String(credential.userId) !== uid) {
        return { ok: false as const, statusCode: 403, body: { error: 'Credential does not belong to user' } };
      }

      const nowMs = Date.now();
      const validFromMs = Date.parse(String(credential.validFrom || ''));
      const validToMs = Date.parse(String(credential.validTo || ''));

      if (!Number.isFinite(validFromMs) || !Number.isFinite(validToMs)) {
        return { ok: false as const, statusCode: 400, body: { error: 'Credential has invalid validity dates' } };
      }

      const orgSnap = await tx.get(db.collection('orgs').doc(orgId));
      const rotationSecondsCandidate = Number(orgSnap.data()?.settings?.codeRotationSeconds);
      const rotationSeconds =
        Number.isFinite(rotationSecondsCandidate) && rotationSecondsCandidate >= 20 && rotationSecondsCandidate <= 60
          ? rotationSecondsCandidate
          : 30;

      const credentialSummary = {
        credentialId,
        orgId,
        credentialType: String(credential.credentialType || ''),
        status: String(credential.status || ''),
        validFrom: String(credential.validFrom || ''),
        validTo: String(credential.validTo || ''),
        displayName: String(credential.displayName || ''),
        memberNo: credential.memberNo ?? null,
        unitNo: credential.unitNo ?? null,
      };

      const canVerify = credential.status === 'active' && nowMs >= validFromMs && nowMs <= validToMs;
      if (!canVerify) {
        const status = String(credential.status || '');
        const reason =
          status === 'suspended'
            ? 'credential_suspended'
            : nowMs < validFromMs
              ? 'credential_not_yet_valid'
              : nowMs > validToMs
                ? 'credential_expired'
                : 'credential_inactive';

        return {
          ok: true as const,
          code: null,
          expiresAt: null,
          rotationSeconds,
          credential: credentialSummary,
          canVerify: false,
          reason,
        };
      }

      const currentCode = String(credential.currentCode || '');
      const currentExpiresAt = Date.parse(String(credential.currentCodeExpiresAt || ''));
      if (CODE_RE.test(currentCode) && Number.isFinite(currentExpiresAt) && currentExpiresAt > nowMs) {
        return {
          ok: true as const,
          code: currentCode,
          expiresAt: new Date(currentExpiresAt).toISOString(),
          rotationSeconds,
          credential: credentialSummary,
          canVerify: true,
        };
      }

      const expiresAtMs = nowMs + rotationSeconds * 1000;
      const expiresAtIso = new Date(expiresAtMs).toISOString();
      const issuedAtIso = new Date(nowMs).toISOString();

      const prevCode = CODE_RE.test(currentCode) ? currentCode : null;

      for (let attempt = 0; attempt < 25; attempt += 1) {
        const code = randomCode();
        const codeRef = db.collection('rotatingCodes').doc(`${orgId}_${code}`);
        const codeSnap = await tx.get(codeRef);
        const expiresAtValue = codeSnap.exists ? (codeSnap.data() as any).expiresAt : null;
        let existingExpiresAtMs = 0;
        if (expiresAtValue && typeof expiresAtValue.toMillis === 'function') {
          existingExpiresAtMs = Number(expiresAtValue.toMillis());
        } else if (typeof expiresAtValue === 'string') {
          const parsed = Date.parse(expiresAtValue);
          existingExpiresAtMs = Number.isFinite(parsed) ? parsed : 0;
        }

        if (codeSnap.exists && existingExpiresAtMs > nowMs) {
          continue;
        }

        if (prevCode) {
          const prevRef = db.collection('rotatingCodes').doc(`${orgId}_${prevCode}`);
          const prevSnap = await tx.get(prevRef);
          if (prevSnap.exists && String((prevSnap.data() as any).credentialId || '') === credentialId) {
            tx.delete(prevRef);
          }
        }

        tx.set(codeRef, {
          orgId,
          code,
          credentialId,
          issuedAt: Timestamp.fromMillis(nowMs),
          expiresAt: Timestamp.fromMillis(expiresAtMs),
        });

        tx.update(credentialRef, {
          currentCode: code,
          currentCodeIssuedAt: issuedAtIso,
          currentCodeExpiresAt: expiresAtIso,
        });

        return {
          ok: true as const,
          code,
          expiresAt: expiresAtIso,
          rotationSeconds,
          credential: credentialSummary,
          canVerify: true,
        };
      }

      return { ok: false as const, statusCode: 503, body: { error: 'Failed to issue code (try again)' } };
    });

    if (!result.ok) {
      return { statusCode: result.statusCode, body: JSON.stringify(result.body) };
    }

    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (error: any) {
    console.error('issue-rotating-code error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

export { handler };
