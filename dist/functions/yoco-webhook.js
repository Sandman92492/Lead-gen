"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const admin = __importStar(require("firebase-admin"));
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const crypto_1 = require("crypto");
// MailerLite configuration
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';
const PASS_HOLDERS_GROUP_ID = '172957060431873572';
// Yoco signing secret - read fresh on each request to avoid stale warm instance issues
const getSigningSecret = () => {
    const rawSecret = process.env.YOCO_SIGNING_SECRET?.trim() || '';
    return rawSecret.startsWith('whsec_')
        ? Buffer.from(rawSecret.substring(6), 'base64')
        : rawSecret;
};
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
// Initialize Firebase Admin
let db;
const initFirebase = () => {
    if (!db) {
        const app = (0, app_1.initializeApp)({
            credential: (0, app_1.cert)({
                projectId: FIREBASE_PROJECT_ID,
                privateKey: FIREBASE_PRIVATE_KEY,
                clientEmail: FIREBASE_CLIENT_EMAIL,
            }),
        });
        db = (0, firestore_1.getFirestore)(app);
    }
    return db;
};
// Verify webhook signature using HMAC
const verifyWebhook = (payload, signature, webhookId, timestamp) => {
    const signingSecret = getSigningSecret();
    if (!signingSecret) {
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
    // signingSecret is already a Buffer from getSigningSecret()
    const hmac = (0, crypto_1.createHmac)('sha256', signingSecret);
    hmac.update(signedContent);
    const expectedHash = hmac.digest('base64');
    return receivedHash === expectedHash;
};
// Sanitize user input to prevent XSS
const sanitize = (str) => str.replace(/[<>]/g, '').trim().slice(0, 200);
const handler = async (event) => {
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
        // Get the raw body for signature verification
        let payload = event.rawBody;
        let decodedPayload = '';
        if (!payload) {
            if (event.isBase64Encoded) {
                decodedPayload = Buffer.from(event.body, 'base64').toString('utf-8');
                payload = decodedPayload;
            }
            else {
                payload = typeof event.body === 'string' ? event.body : JSON.stringify(event.body);
            }
        }
        // Ensure payload is a string
        payload = payload || '';
        // Verify webhook signature
        if (!verifyWebhook(payload, signature, webhookId, timestamp)) {
            console.error('Webhook signature verification failed');
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        }
        const yocoEvent = JSON.parse(payload);
        // Only handle succeeded payments
        if (yocoEvent.type !== 'payment.succeeded' || yocoEvent.payload.status !== 'succeeded') {
            return {
                statusCode: 200,
                body: JSON.stringify({ received: true }),
            };
        }
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
            return {
                statusCode: 200,
                body: JSON.stringify({ received: true, passId: existingPass.passId, isDuplicate: true }),
            };
        }
        const passId = 'PAHP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        let expiryDate;
        if (passType === 'annual') {
            expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        else {
            // Holiday pass: valid until Jan 31, 2026 23:59:59 South African Time (UTC+2)
            // Midnight UTC+2 on Jan 31 = 22:00 UTC on Jan 31
            expiryDate = new Date('2026-01-31T22:00:00Z');
        }
        await firestoreDb.collection('passes').doc(passId).set({
            passId,
            passHolderName: sanitize(passHolderName),
            email: sanitize(userEmail),
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
        }
        catch (err) {
            // If document doesn't exist (error code 5), create it
            // Pricing config not found, creating new one
            await pricingRef.set({
                currentPassCount: 1,
                lastUpdated: new Date().toISOString(),
            }, { merge: true });
        }
        // Trigger MailerLite welcome email (fire-and-forget, don't block response)
        if (MAILERLITE_API_KEY) {
            fetch(`${MAILERLITE_API_URL}/subscribers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
                },
                body: JSON.stringify({
                    email: sanitize(userEmail),
                    fields: {
                        name: sanitize(passHolderName),
                        pass_id: passId,
                        purchase_date: new Date().toISOString(),
                    },
                    groups: [PASS_HOLDERS_GROUP_ID],
                }),
            }).catch(err => console.error('MailerLite error:', err));
        }
        return {
            statusCode: 200,
            body: JSON.stringify({ received: true, passId }),
        };
    }
    catch (error) {
        console.error('Webhook processing error:', error instanceof Error ? error.message : 'Unknown error');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
