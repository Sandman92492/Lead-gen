/**
 * Email Service - Triggers MailerLite automations
 * All methods are fire-and-forget and won't throw errors
 */

type EmailTrigger = 'pass_purchased' | 'account_created' | 'first_redemption';

interface TriggerEmailParams {
  trigger: EmailTrigger;
  email: string;
  name?: string;
  fields?: Record<string, string>;
}

const triggerEmail = async (params: TriggerEmailParams): Promise<void> => {
  try {
    const response = await fetch('/.netlify/functions/mailerlite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email trigger failed:', error);
    }
  } catch (error) {
    // Silent fail - don't break the app if email fails
    console.error('Email service error:', error);
  }
};

/**
 * Trigger welcome email when user purchases a pass
 */
export const triggerPassPurchasedEmail = async (
  email: string,
  name?: string,
  passId?: string
): Promise<void> => {
  await triggerEmail({
    trigger: 'pass_purchased',
    email,
    name,
    fields: {
      pass_id: passId || '',
      purchase_date: new Date().toISOString(),
    },
  });
};

/**
 * Trigger welcome email when user creates an account (no pass yet)
 */
export const triggerAccountCreatedEmail = async (
  email: string,
  name?: string
): Promise<void> => {
  await triggerEmail({
    trigger: 'account_created',
    email,
    name,
  });
};

/**
 * Trigger congratulations email on first deal redemption
 */
export const triggerFirstRedemptionEmail = async (
  email: string,
  name?: string,
  dealName?: string
): Promise<void> => {
  await triggerEmail({
    trigger: 'first_redemption',
    email,
    name,
    fields: {
      first_deal_name: dealName || '',
      first_redemption_date: new Date().toISOString(),
    },
  });
};
