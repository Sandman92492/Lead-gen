import { Handler } from '@netlify/functions';

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;

interface CheckoutRequest {
  amount: number;
  passType: string;
  userEmail: string;
  passHolderName: string;
  userId: string;
}

const handler: Handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { amount, passType, userEmail, passHolderName, userId } = JSON.parse(
      event.body || '{}'
    ) as CheckoutRequest;

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
    
    console.log('Checkout request:', { amount, passType, userEmail, passHolderName });
    console.log('YOCO_SECRET_KEY first 10 chars:', YOCO_SECRET_KEY.substring(0, 10));
    console.log('SITE_URL:', baseUrl);
    
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

    const data = await response.json() as any;

    console.log('Yoco API response status:', response.status);
    console.log('Yoco API response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('Yoco API error:', { status: response.status, data });
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data?.message || 'Payment service error', details: data }),
      };
    }

    console.log('Checkout created successfully:', { checkoutId: data?.id });
    return {
      statusCode: 200,
      body: JSON.stringify({
        checkoutId: data?.id,
        redirectUrl: data?.redirectUrl,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
