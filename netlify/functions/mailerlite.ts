import { Handler } from '@netlify/functions';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

// Group IDs from MailerLite
const GROUPS = {
  PASS_HOLDERS: '172957060431873572',
  FREE_USERS: '172957077927364244',
  FIRST_REDEMPTION: '172957071064434389',
};

interface MailerLiteRequest {
  trigger: 'pass_purchased' | 'account_created' | 'first_redemption';
  email: string;
  name?: string;
  fields?: Record<string, string>;
}

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (!MAILERLITE_API_KEY) {
    console.error('MAILERLITE_API_KEY not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Email service not configured' }),
    };
  }

  try {
    const body: MailerLiteRequest = JSON.parse(event.body || '{}');
    const { trigger, email, name, fields } = body;

    if (!email || !trigger) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email and trigger are required' }),
      };
    }

    // Determine which group to add subscriber to based on trigger
    let groupId: string;
    switch (trigger) {
      case 'pass_purchased':
        groupId = GROUPS.PASS_HOLDERS;
        break;
      case 'account_created':
        groupId = GROUPS.FREE_USERS;
        break;
      case 'first_redemption':
        groupId = GROUPS.FIRST_REDEMPTION;
        break;
      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid trigger' }),
        };
    }

    // Create/update subscriber with the group
    const response = await fetch(`${MAILERLITE_API_URL}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email,
        fields: {
          name: name || '',
          last_trigger: trigger,
          trigger_date: new Date().toISOString(),
          ...fields,
        },
        groups: [groupId],
      }),
    });

    const data = await response.json() as { message?: string };

    if (!response.ok) {
      console.error('MailerLite API error:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: data.message || 'MailerLite API error' }),
      };
    }

    console.log(`MailerLite: ${trigger} triggered for ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('MailerLite function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
