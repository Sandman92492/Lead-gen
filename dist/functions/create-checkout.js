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
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Payment service not configured' }),
            };
        }
        // Get base URL from environment or construct from request headers
        const baseUrl = process.env.SITE_URL ||
            (event.headers.host ? `https://${event.headers.host}` : 'https://localhost:3000');
        const requestBody = {
            amount: Math.round(amount), // Yoco expects amount in cents
            currency: 'ZAR',
            returnUrl: `${baseUrl}/payment/return`,
            successUrl: `${baseUrl}/payment/success`,
            failureUrl: `${baseUrl}/payment/failure`,
            cancelUrl: `${baseUrl}/payment/cancel`,
            metadata: {
                passType,
                userEmail,
                passHolderName,
                userId,
            },
        };
        // Create checkout via Yoco API
        const response = await fetch('https://payments.yoco.com/api/checkouts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        const data = await response.json();
        if (!response.ok) {
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
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};
exports.handler = handler;
