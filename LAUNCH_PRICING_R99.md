# Launch Pricing with R199 & Yoco Payment Links

## Overview
Your app now has a single pricing tier: **R199 per 30-day Holiday Pass**. You can create **Yoco Payment Links** for alternative distribution channels (marketing, WhatsApp, emails, ads) that bypass the in-app flow entirely.

---

## How It Works (Current System)

### In-App Flow: PurchaseModal → Checkout API → Yoco Checkout
1. User clicks "Get Pass" button in app
2. PurchaseModal opens (src/components/PurchaseModal.tsx)
3. User enters name/email, clicks "Pay R199"
4. Calls `create-checkout` Netlify function with amount (19900 cents)
5. Function calls Yoco Checkout API at `https://payments.yoco.com/api/checkouts`
6. Returns `redirectUrl` → user goes to Yoco's hosted payment page
7. After payment, redirects to `/payment/success` or `/payment/failure`
8. Yoco webhook fires → creates pass in Firestore with `purchasePrice: 199`

---

## Optional: Payment Links (Alternative Channels)

### What Are Payment Links?
A **Yoco Payment Link** is a static URL that doesn't require your app or backend. Anyone clicking it goes straight to payment. Useful for WhatsApp campaigns, email blasts, or ads where you want to skip the in-app funnel.

**Example:**
```
https://pay.yoco.com/link/YOUR_LINK_ID
```

### How to Create One

**Via Yoco Dashboard (Easiest):**
1. Go to [Yoco Dashboard](https://dashboard.yoco.com)
2. Click "Payment Links" (left sidebar)
3. Click "Create Link"
4. Fill in:
   - **Amount**: R199.00
   - **Description**: "Holiday Pass - 30 day access"
   - **Customer reference**: Leave blank (customers can enter names)
5. Click "Create"
6. Copy the link: `https://pay.yoco.com/link/ABC123XYZ`

**Via Yoco API (For Automation):**
```bash
curl -X POST https://api.yoco.com/v1/payment_links \
  -H "Authorization: Bearer YOUR_YOCO_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": {
      "currency": "ZAR",
      "value": 19900
    },
    "customer_reference": "Holiday Pass",
    "customer_description": "30-day access to all Port Alfred deals"
  }'
```

**Response:**
```json
{
  "id": "link_abc123xyz",
  "url": "https://pay.yoco.com/link/abc123xyz",
  "amount": {
    "value": 19900,
    "currency": "ZAR"
  },
  "created_at": "2025-11-25T10:00:00Z"
}
```

---

## System Impact Analysis

### What Changes?
**Nothing in your app code** — Payment Links are entirely external.

### What Stays the Same?
- PurchaseModal works at R199
- All checkout flows unchanged
- In-app redemption/pass activation logic unchanged
- Firestore schema unchanged

### What's New?
- Payment Links: Optional R199 URLs for direct-to-payment channels (WhatsApp, email, ads)
- Direct-to-payment URLs bypass the app signup flow
- Webhook still captures payments and creates passes the same way

---

## Implementation Strategy

### Option 1: Use Dashboard-Created Link (Simplest)
**Best for**: Quick launch, small campaigns

1. Create link in Yoco Dashboard once (amount: R199)
2. Share static URL:
   - WhatsApp broadcast messages
   - Email campaigns
   - Direct marketing
   - Affiliate links
3. Customers pay R199 → pass created automatically via webhook

**No code changes required.** Your in-app flow stays at R199.

---

### Option 2: Programmatic Links (Future Enhancement)
**Best for**: Multiple pricing tiers, A/B testing, automated campaigns

If you need to generate links dynamically later (e.g., different campaign channels), create a Netlify function. For now, static links work fine for launch.

**Future example:**
```typescript
// Create R199 link for specific campaign
const response = await fetch('/.netlify/functions/create-payment-link', {
  method: 'POST',
  body: JSON.stringify({
    amount: 199,
    description: 'Holiday Pass - WhatsApp Campaign',
  }),
});
const { url } = await response.json();
```

---

## Webhook Handling (Same for Both)

Your existing `yoco-webhook.ts` already handles payment links correctly:

```typescript
// Webhook receives payment.succeeded event
// Metadata is missing (payment links don't have custom metadata)
const { passType, userEmail, passHolderName, userId } = yocoEvent.payload.metadata || {};

// For payment links, metadata will be empty
// You have 2 options:
```

### Option A: Require Manual Activation
For R99 link purchases:
1. Payment succeeds, webhook receives event
2. Create pass with `passStatus: 'pending'` and `passType: 'holiday'` (default)
3. User signs in → ActivatePassModal guides them to activate
4. Webhook webhook already creates passes with metadata from the initial checkout

### Option B: Auto-Create with Defaults
Modify webhook to default to holiday pass if metadata missing:

```typescript
// In yoco-webhook.ts, around line 121:
const passType = yocoEvent.payload.metadata?.passType || 'holiday';
const userEmail = yocoEvent.payload.metadata?.userEmail;
const passHolderName = yocoEvent.payload.metadata?.passHolderName;
const userId = yocoEvent.payload.metadata?.userId;

// If no email/name in metadata, create pass but mark as needing activation
if (!userEmail || !passHolderName || !userId) {
  // Store payment but wait for user to claim it
  // This requires additional UX (pass claiming flow)
}
```

---

## Recommended Approach for Launch

### Phase 1: Quick Launch (No Code Changes)
1. Your app now has one price: **R199** (automatically set in all flows)
2. Optional: Create R199 payment link in Yoco Dashboard for direct-to-payment channels
3. Share link via:
   - WhatsApp broadcast messages
   - Email campaigns
   - Affiliate/referral links
4. Customers clicking link → direct payment → webhook creates pass
5. Pass gets `passType: 'holiday'` (automatically)

**Timeline:** 5 minutes to create optional payment links

---

### Phase 2: Advanced (After Launch)
If you want programmatic links or multiple pricing tiers:
1. Add `create-payment-link` Netlify function
2. Add link generation UI to AdminDashboard
3. Track which link each purchase came from (add metadata)

**Timeline:** 1-2 hours development

---

## Key Differences: Payment Links vs. Checkouts

| Feature | Payment Link | Checkout API |
|---------|-------------|--------------|
| **Setup** | Dashboard or API | API only |
| **Customer Entry** | Name/email on payment page | Pre-filled from app |
| **Price** | Fixed per link | Dynamic per request |
| **Metadata** | Optional (limited) | Full custom metadata |
| **Use Case** | Marketing, ads, static URLs | In-app purchases, dynamic pricing |
| **Webhook** | Yes, receives `payment.succeeded` | Yes, receives `payment.succeeded` |

---

## Webhook Payload Comparison

### Checkout API (In-App)
```json
{
  "payload": {
    "id": "chk_abc123",
    "amount": 19900,
    "status": "succeeded",
    "metadata": {
      "passType": "holiday",
      "userEmail": "user@example.com",
      "passHolderName": "John Doe",
      "userId": "user123"
    }
  }
}
```

### Payment Link (External)
```json
{
  "payload": {
    "id": "pmt_xyz789",
    "amount": 19900,
    "status": "succeeded",
    "metadata": {} // Empty - payment links don't capture metadata
  }
}
```

**Current webhook** defaults `passType` to `'holiday'` and handles missing email/name, so both work automatically.

---

## Migration Checklist

- [ ] Create R99 payment link in Yoco Dashboard
- [ ] Test payment link by making test purchase
- [ ] Verify webhook fires and pass is created
- [ ] Share link on marketing channels
- [ ] (Optional) Add `create-payment-link` Netlify function for future pricing tiers
- [ ] (Optional) Update webhook to handle missing metadata gracefully

---

## Code Changes Needed

### If Using Dashboard Link Only
**No code changes.** Just create the link and share.

### If Automating Link Creation
Add to `netlify/functions/create-payment-link.ts` (full code above).

### Webhook Improvements (Optional)
Update `yoco-webhook.ts` line 121-128:

```typescript
// Handle both checkout API (full metadata) and payment links (no metadata)
let passType = yocoEvent.payload.metadata?.passType || 'holiday'; // Default to holiday
let userEmail = yocoEvent.payload.metadata?.userEmail;
let passHolderName = yocoEvent.payload.metadata?.passHolderName;
let userId = yocoEvent.payload.metadata?.userId;

if (!userEmail || !passHolderName || !userId) {
  // Payment link payment without pre-filled user data
  // Create unclaimed pass or require user activation
  return {
    statusCode: 200,
    body: JSON.stringify({ received: true, requiresActivation: true }),
  };
}
```

---

## Summary

**TL;DR:**
1. ✅ App pricing updated to R199 single tier (all code changes done)
2. Optional: Create R199 payment links in Yoco Dashboard for WhatsApp/email campaigns
3. Same webhook handles both in-app and payment link purchases
4. All passes get `passType: 'holiday'` automatically
5. No additional code changes needed for launch
6. Payment links work immediately, no development required

**Cost:** Same Yoco fees (2.5-2.7% online rate)
