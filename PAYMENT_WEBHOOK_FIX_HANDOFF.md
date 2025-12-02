# Payment Webhook Fix - Handoff Summary

## Issue Fixed
**Webhook was not creating passes after successful Yoco payments.**

Root cause: Payment verification endpoint was returning 401 errors. Removed payment verification since webhook signature is already cryptographically verified.

## Changes Made

### Code Changes
1. **netlify/functions/yoco-webhook.ts**
   - Removed external payment verification (was failing with 401)
   - Now trusts Yoco webhook signature verification
   - Added logging for debugging: signature verification, event processing, pass creation
   - Pass creation now happens immediately after signature verification

2. **netlify/functions/create-checkout.ts**
   - Added detailed logging for SITE_URL and redirect URLs
   - Logs show exactly what baseUrl is being used for payment redirects

3. **src/components/TestPaymentButton.tsx** (staging only)
   - Test button for manual payment flow testing with test card `4111 1111 1111 1111`
   - Only visible on staging when `VITE_SHOW_TEST_BUTTON=true`

4. **src/components/HowItWorks.tsx**
   - Changed "unlimited access" to "access" in copy

### Branches
- **main**: Production code, uses live Yoco key (`sk_live_*`), deploys to holidaypass.live
- **staging**: Test code, uses test Yoco key (`sk_test_*`), deploys to portalfredholidaypassbeta.netlify.app

### Netlify Setup
**Production (holidaypass.live)**:
- Connected repo: main branch
- YOCO_SECRET_KEY: sk_live_* (live key)
- YOCO_SIGNING_SECRET: whsec_* (live webhook secret)
- SITE_URL: [production-domain]

**Staging (portalfredholidaypassbeta.netlify.app)**:
- Connected repo: staging branch
- Branch deploys override:
  - YOCO_SECRET_KEY: sk_test_* (test key)
  - YOCO_SIGNING_SECRET: whsec_* (test webhook secret)
- SITE_URL: https://portalfredholidaypassbeta.netlify.app/
- VITE_SHOW_TEST_BUTTON: true

## Testing Results
**Staging webhook test (Dec 2, 01:08:08 PM)**:
- ✓ Webhook received successfully
- ✓ Signature verification passed (`Hash match: true`)
- ✓ Event type: `payment.succeeded`
- ✓ Pass created with expiry date: 2026-01-31T22:00:00.000Z
- ✓ Duration: 1262ms (reasonable)

Pass should exist in Firestore with `passStatus: 'completed'`.

## User Communication
Message sent explaining payment issue is fixed and users should:
1. Sign in to check if pass appears
2. Reply with payment confirmation if still missing (for manual activation)

## Next Steps

### If payment still not creating passes in production:
1. Check Netlify function logs for production webhook calls
2. Look for:
   - `Hash match: true` (signature verified)
   - `Processing payment.succeeded event`
   - Any errors in Firestore write
3. Verify Firestore security rules allow writes from function
4. Check that `YOCO_SIGNING_SECRET` is correct (must be in `whsec_` format, base64-decoded)

### If users report missing passes:
1. Get their payment confirmation from Yoco
2. Check webhook logs for that payment ID
3. Check if pass exists in Firestore `passes` collection
4. If missing, manually create pass in Firestore with:
   ```
   passId: "PAHP-" + random string
   paymentRef: [yoco_payment_id]
   paymentStatus: "completed"
   passStatus: "paid"
   passHolderName: [from payment metadata]
   email: [from payment metadata]
   userId: [from payment metadata]
   expiryDate: "2026-01-31T22:00:00.000Z"
   createdAt: [current ISO date]
   ```

### For further debugging:
- Check webhook logs with filters for payment IDs
- Verify Firebase credentials (FIREBASE_PRIVATE_KEY, etc.) are correct
- Test locally with test key if issues persist

## Documentation
- **STAGING_SETUP.md** - Complete guide for testing with Yoco test credentials
- **.env.staging.example** - Environment variable placeholders for staging
