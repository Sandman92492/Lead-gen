"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
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
    console.log('Webhook ID:', webhookId);
    console.log('Webhook timestamp:', timestamp);
    console.log('Signed content length:', signedContent.length);
    // Secret is stored as whsec_<base64>, extract and decode the base64 part
    const secretBytes = Buffer.from(YOCO_SIGNING_SECRET, 'utf-8');
    const hmac = (0, crypto_1.createHmac)('sha256', secretBytes);
    hmac.update(signedContent);
    const expectedHash = hmac.digest('base64');
    console.log('Received hash:', receivedHash);
    console.log('Expected hash:', expectedHash);
    console.log('Hashes match:', receivedHash === expectedHash);
    return receivedHash === expectedHash;
};
const handler = async (event) => {
    console.log('Webhook received - method:', event.httpMethod);
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
        const payload = event.rawBody || event.body || '';
        console.log('Webhook signature header exists:', !!signature);
        console.log('Webhook ID header exists:', !!webhookId);
        console.log('Webhook timestamp header exists:', !!timestamp);
        console.log('Webhook payload length:', payload.length);
        // Verify webhook signature
        if (!verifyWebhook(payload, signature, webhookId, timestamp)) {
            console.warn('Invalid webhook signature - verification failed');
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' }),
            };
        }
        console.log('Webhook signature verified successfully');
        const yocoEvent = JSON.parse(payload);
        console.log('Parsed event type:', yocoEvent.type);
        console.log('Parsed payload status:', yocoEvent.payload.status);
        // Only handle succeeded payments
        if (yocoEvent.type !== 'payment.succeeded' || yocoEvent.payload.status !== 'succeeded') {
            console.log('Event type or status not payment.succeeded, ignoring');
            return {
                statusCode: 200,
                body: JSON.stringify({ received: true }),
            };
        }
        const { passType, userEmail, passHolderName, userId } = yocoEvent.payload.metadata || {};
        console.log('Extracted metadata:', { passType, userEmail, passHolderName, userId });
        if (!passType || !userEmail || !passHolderName || !userId) {
            console.error('Missing required metadata in webhook');
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid metadata' }),
            };
        }
        // Create pass in Firestore
        const firestoreDb = initFirebase();
        // Check if a paid pass already exists for this user
        console.log('Checking for existing paid pass for userId:', userId);
        const existingPassQuery = await firestoreDb
            .collection('passes')
            .where('userId', '==', userId)
            .where('paymentStatus', '==', 'completed')
            .limit(1)
            .get();
        if (!existingPassQuery.empty) {
            console.log('Paid pass already exists for this user, skipping duplicate creation');
            const existingPass = existingPassQuery.docs[0].data();
            return {
                statusCode: 200,
                body: JSON.stringify({ received: true, passId: existingPass.passId, isDuplicate: true }),
            };
        }
        const passId = 'PAHP-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        console.log('Creating new pass with ID:', passId);
        let expiryDate;
        if (passType === 'annual') {
            expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        }
        else {
            expiryDate = new Date('2025-01-31T23:59:59');
        }
        console.log('Writing to Firestore...');
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
        });
        console.log('Pass created successfully in Firestore');
        return {
            statusCode: 200,
            body: JSON.stringify({ received: true, passId }),
        };
    }
    catch (error) {
        console.error('Webhook processing error:', error);
        console.error('Error stack:', error.stack);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
