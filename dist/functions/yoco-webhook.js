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
    // Secret is stored as whsec_<base64>, extract and decode the base64 part
    const secretBytes = Buffer.from(YOCO_SIGNING_SECRET, 'utf-8');
    const hmac = (0, crypto_1.createHmac)('sha256', secretBytes);
    hmac.update(signedContent);
    const expectedHash = hmac.digest('base64');
    console.log('Expected hash:', expectedHash.substring(0, 20) + '...');
    console.log('Hash match:', receivedHash === expectedHash);
    return receivedHash === expectedHash;
};
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
        // Use rawBody if available (Netlify provides this for signature verification)
        // If body is parsed as object, stringify it back to original format
        const payload = event.rawBody || (typeof event.body === 'string' ? event.body : JSON.stringify(event.body)) || '';
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
        const yocoEvent = JSON.parse(payload);
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
        // Create pass in Firestore
        const firestoreDb = initFirebase();
        // Check if a pass already exists for this payment (prevent duplicates from webhook retries)
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
        let expiryDate;
        if (passType === 'annual') {
            expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        else {
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
    }
    catch (error) {
        console.error('Webhook processing error:', error instanceof Error ? error.message : String(error));
        console.error('Full error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
