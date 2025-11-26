"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
    try {
        const { amount, passType, userEmail, passHolderName, userId } = JSON.parse(event.body || '{}');
        if (!amount || !passType || !userEmail || !passHolderName || !userId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' }),
            };
        }
        if (!YOCO_SECRET_KEY) {
            console.error('YOCO_SECRET_KEY not configured');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Payment service not configured' }),
            };
        }
        // Create checkout via Yoco API
        const response = await fetch('https://payments.yoco.com/api/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: Math.round(amount), // Yoco expects amount in cents
                currency: 'ZAR',
                returnUrl: 'https://loquacious-arithmetic-f21122.netlify.app/',
                metadata: {
                    passType,
                    userEmail,
                    passHolderName,
                    userId,
                },
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            console.error('Yoco API error:', data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data?.message || 'Payment service error' }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify({
                checkoutId: data?.id,
                redirectUrl: data?.redirectUrl,
            }),
        };
    }
    catch (error) {
        console.error('Checkout creation error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
