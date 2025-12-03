import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createHmac } from 'crypto';

// Yoco signing secret format: whsec_<base64-encoded-key>
// Decode the base64 part to get the actual key
const rawSecret = process.env.YOCO_SIGNING_SECRET?.trim() || '';
const YOCO_SIGNING_SECRET = rawSecret.startsWith('whsec_')
    ? Buffer.from(rawSecret.substring(6), 'base64')
    : rawSecret;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;

// Initialize Firebase Admin
let db: any;

const initFirebase = () => {
    if (!db) {
        const app = initializeApp({
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

// Verify webhook signature using HMAC
const verifyWebhook = (payload: string, signature: string, webhookId: string, timestamp: string): boolean => {
    if (!YOCO_SIGNING_SECRET) {
        console.error('YOCO_SIGNING_SECRET not configured');
        return false;
    }

    console.log('Signature verification - YOCO_SIGNING_SECRET present:', !!YOCO_SIGNING_SECRET);
    console.log('Signature verification - Secret length:', YOCO_SIGNING_SECRET.length);

    // Yoco sends signature as "v1,<base64-hash>" (may have multiple separated by space)
    const signatureList = signature.split(' ');
    const receivedSignature = signatureList[0]; // Take first one
    const parts = receivedSignature.split(',');

    if (parts.length !== 2 || parts[0] !== 'v1') {
        console.error('Invalid signature format:', signature);
        return false;
    }

    const receivedHash = parts[1];
    console.log('Received hash:', receivedHash.substring(0, 20) + '...');

    // Signed content is: webhook-id.webhook-timestamp.raw-body
    const signedContent = `${webhookId}.${timestamp}.${payload}`;
    console.log('Signed content:', signedContent.substring(0, 50) + '...');

    // YOCO_SIGNING_SECRET is already a Buffer from initial extraction
    const hmac = createHmac('sha256', YOCO_SIGNING_SECRET);
    hmac.update(signedContent);
    const expectedHash = hmac.digest('base64');

    console.log('Expected hash:', expectedHash.substring(0, 20) + '...');
    console.log('Hash match:', receivedHash === expectedHash);

    return receivedHash === expectedHash;
};

interface YocoPayload {
    amount: number;
    createdDate: string;
    currency: string;
    id: string;
    mode: string;
    status: string;
    type: string;
    metadata: {
        passType?: string;
        userEmail?: string;
        passHolderName?: string;
        userId?: string;
    };
}

interface YocoEvent {
    createdDate: string;
    id: string;
    type: string;
    payload: YocoPayload;
}

const handler: Handler = async (event: any) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        const signature = event.headers['webhook-signature'] || '';
        const webhookId = event.headers['webhook-id'] || '';
        const timestamp = event.headers['webhook-timestamp'] || '';

        // Enhanced Debug Logging
        console.log('--- Webhook Request Debug Info ---');
        console.log('Headers:', JSON.stringify(event.headers, null, 2));
        console.log('Is Base64 Encoded:', event.isBase64Encoded);

        // Get the raw body for signature verification
        let payload = (event as any).rawBody;
        let decodedPayload = '';

        if (!payload) {
            if (event.isBase64Encoded) {
                console.log('Body is Base64 encoded, decoding...');
                decodedPayload = Buffer.from(event.body, 'base64').toString('utf-8');
                payload = decodedPayload;
            } else {
                console.log('Body is not Base64 encoded');
                payload = typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
            }
        }

        // Ensure payload is a string
        payload = payload || '';

        console.log('Payload Length:', payload.length);
        console.log('Payload Preview (first 100 chars):', payload.substring(0, 100));
        if (decodedPayload) {
            console.log('Decoded Payload Preview:', decodedPayload.substring(0, 100));
        }
        console.log('--- End Debug Info ---');

        console.log('Webhook received:', { webhookId, timestamp, signaturePresent: !!signature, payloadLength: payload.length });

        // Verify webhook signature
        if (!verifyWebhook(payload, signature, webhookId, timestamp)) {
            console.error('Webhook signature verification failed');
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        }

        console.log('Webhook signature verified successfully');

        const yocoEvent = JSON.parse(payload) as YocoEvent;

        // Webhook signature already verified, so trust the payload
        // Yoco webhook is already authenticated and payload is verified
        console.log('Webhook verified, trusting Yoco payload');

        // Only handle succeeded payments
        if (yocoEvent.type !== 'payment.succeeded' || yocoEvent.payload.status !== 'succeeded') {
            console.log('Webhook event not payment.succeeded:', { type: yocoEvent.type, status: yocoEvent.payload.status });
            return {
                statusCode: 200,
                body: JSON.stringify({ received: true }),
            };
        }

        console.log('Processing payment.succeeded event');

        const paymentId = yocoEvent.payload.id;
        const { passType, userEmail, passHolderName, userId } = yocoEvent.payload.metadata || {};

        if (!passType || !userEmail || !passHolderName || !userId) {
            console.error('Missing required metadata:', { passType, userEmail, passHolderName, userId });
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid metadata' }),
            };
        }

        // Initialize Firestore first
        const firestoreDb = initFirebase();

        // Check if a pass already exists for this payment (prevent duplicates from webhook retries)
        // Do this READ operation first, before any writes
        const existingPassQuery = await firestoreDb
            .collection('passes')
            .where('paymentRef', '==', paymentId)
            .limit(1)
            .get();

        if (!existingPassQuery.empty) {
            const existingPass = existingPassQuery.docs[0].data();
            console.log('Duplicate payment detected. paymentRef:', paymentId, 'existing passId:', existingPass.passId);
            return {
                statusCode: 200,
                body: JSON.stringify({ received: true, passId: existingPass.passId, isDuplicate: true }),
            };
        }

        const passId = 'PAHP-' + Math.random().toString(36).substring(2, 9).toUpperCase();

        let expiryDate: Date;
        if (passType === 'annual') {
            expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        } else {
            // Holiday pass: valid until Jan 31, 2026 23:59:59 South African Time (UTC+2)
            // Midnight UTC+2 on Jan 31 = 22:00 UTC on Jan 31
            expiryDate = new Date('2026-01-31T22:00:00Z');
            console.log('Using fixed Jan 31 expiry date:', expiryDate.toISOString());
        }

        await firestoreDb.collection('passes').doc(passId).set({
            passId,
            passHolderName,
            email: userEmail,
            passType,
            passStatus: 'paid',
            expiryDate: expiryDate.toISOString(),
            userId,
            createdAt: new Date().toISOString(),
            paymentRef: yocoEvent.payload.id,
            paymentStatus: 'completed',
            purchasePrice: Math.round(yocoEvent.payload.amount / 100), // Convert cents to Rands
        });

        // Atomically increment pass count in config/pricing for dynamic pricing
        // We use a direct update with FieldValue.increment which is atomic and doesn't require a transaction
        const pricingRef = firestoreDb.collection('config').doc('pricing');
        try {
            await pricingRef.update({
                currentPassCount: admin.firestore.FieldValue.increment(1),
                lastUpdated: new Date().toISOString(),
            });
        } catch (err) {
            // If document doesn't exist (error code 5), create it
            console.log('Pricing config not found, creating new one...');
            await pricingRef.set({
                currentPassCount: 1,
                lastUpdated: new Date().toISOString(),
            }, { merge: true });
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true, passId }),
        };
    } catch (error) {
        console.error('Webhook processing error:', error instanceof Error ? error.message : String(error));
        console.error('Full error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

export { handler };
