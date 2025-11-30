import { Handler } from '@netlify/functions';
import * as admin from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createHmac } from 'crypto';

// Yoco signing secret format: whsec_<base64-encoded-key>
// Decode the base64 part to get the actual key
const rawSecret = process.env.YOCO_SIGNING_SECRET?.trim() || '';
const YOCO_SIGNING_SECRET = rawSecret.startsWith('whsec_') 
  ? Buffer.from(rawSecret.substring(6), 'base64').toString('utf-8')
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

    // Yoco sends signature as "v1,<base64-hash>" (may have multiple separated by space)
    const signatureList = signature.split(' ');
    const receivedSignature = signatureList[0]; // Take first one
    const parts = receivedSignature.split(',');
    
    if (parts.length !== 2 || parts[0] !== 'v1') {
        console.error('Invalid signature format:', signature);
        return false;
    }

    const receivedHash = parts[1];
    
    // Signed content is: webhook-id.webhook-timestamp.raw-body
    const signedContent = `${webhookId}.${timestamp}.${payload}`;
    
    // Secret is stored as whsec_<base64>, extract and decode the base64 part
    const secretBytes = Buffer.from(YOCO_SIGNING_SECRET, 'utf-8');
    
    const hmac = createHmac('sha256', secretBytes);
    hmac.update(signedContent);
    const expectedHash = hmac.digest('base64');

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
        // Use rawBody if available (Netlify provides this for signature verification)
        const payload = (event as any).rawBody || event.body || '';

        // Verify webhook signature
        if (!verifyWebhook(payload, signature, webhookId, timestamp)) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        }

        const yocoEvent = JSON.parse(payload) as YocoEvent;

        // Only handle succeeded payments
        if (yocoEvent.type !== 'payment.succeeded' || yocoEvent.payload.status !== 'succeeded') {
            return {
                statusCode: 200,
                body: JSON.stringify({ received: true }),
            };
        }

        const { passType, userEmail, passHolderName, userId } = yocoEvent.payload.metadata || {};

        if (!passType || !userEmail || !passHolderName || !userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid metadata' }),
            };
        }

        // Create pass in Firestore
        const firestoreDb = initFirebase();
        
        // Check if a paid pass already exists for this user
        const existingPassQuery = await firestoreDb
            .collection('passes')
            .where('userId', '==', userId)
            .where('paymentStatus', '==', 'completed')
            .limit(1)
            .get();
        
        if (!existingPassQuery.empty) {
            const existingPass = existingPassQuery.docs[0].data();
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
             // Midnight UTC+2 on Jan 31 = 22:00 UTC on Jan 30
             expiryDate = new Date('2026-01-30T22:00:00Z');
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
        // Using admin.firestore.FieldValue.increment() prevents race conditions with concurrent payments
        const pricingRef = firestoreDb.collection('config').doc('pricing');
        await pricingRef.update({
            currentPassCount: admin.firestore.FieldValue.increment(1),
            lastUpdated: new Date().toISOString(),
        }).catch(async () => {
            // If document doesn't exist, create it with increment
            await pricingRef.set({
                currentPassCount: 1,
                lastUpdated: new Date().toISOString(),
            }, { merge: true });
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ received: true, passId }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};

export { handler };
