# Staging Environment Setup

This guide explains how to test payment flow with Yoco test credentials without affecting production.

## Overview

- **Production (main branch)**: Uses `sk_live_*` keys, goes to `holidaypass.live`
- **Staging (staging branch)**: Uses `sk_test_*` keys, goes to `staging.holidaypass.live`

Test cards work ONLY with test keys and incur NO charges.

## Steps to Set Up Staging

### 1. Switch to staging branch (already done)
```bash
git checkout staging
```

### 2. Create Netlify staging site
- Go to **Netlify Dashboard**
- Create a new site or connect the same repo to a new site
- Name it `staging-holiday-pass` or similar
- Set publish directory: `dist/`
- Set functions directory: `dist/functions`
- **Do NOT deploy yet**

### 3. Set environment variables on staging site

Go to **Staging Site → Site settings → Build & deploy → Environment**

Add these environment variables (get values from Yoco Dashboard in TEST mode):

| Variable | Value | Source |
|----------|-------|--------|
| `SITE_URL` | `https://staging-holiday-pass.netlify.app/` | Netlify |
| `VITE_FIREBASE_API_KEY` | (same as production) | Firebase Console |
| `VITE_FIREBASE_AUTH_DOMAIN` | `holiday-pass-6dc84.firebaseapp.com` | Firebase Console |
| `VITE_FIREBASE_PROJECT_ID` | `holiday-pass-6dc84` | Firebase Console |
| `VITE_FIREBASE_STORAGE_BUCKET` | `holiday-pass-6dc84.firebasestorage.app` | Firebase Console |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `1052646766613` | Firebase Console |
| `VITE_FIREBASE_APP_ID` | `1:1052646766613:web:87010c43d403785ab5361c` | Firebase Console |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-FQN6HQ62JF` | Firebase Console |
| `VITE_ADMIN_EMAIL` | your test email | Create one |
| `YOCO_SECRET_KEY` | `sk_test_xxxxx` | Yoco Dashboard (TEST mode) |
| `YOCO_SIGNING_SECRET` | `whsec_xxxxx` | Yoco Dashboard (TEST Webhook) |
| `FIREBASE_PROJECT_ID` | `holiday-pass-6dc84` | Firebase Service Account |
| `FIREBASE_CLIENT_EMAIL` | service account email | Firebase Service Account |
| `FIREBASE_PRIVATE_KEY` | private key (with `\\n`) | Firebase Service Account |

### 4. Configure Yoco webhook on staging

In Yoco Dashboard (TEST mode):
```bash
curl -X POST https://api.yoco.com/v1/webhooks \
  -H "Authorization: Bearer sk_test_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://staging-holiday-pass.netlify.app/.netlify/functions/yoco-webhook","events":["payment.succeeded"]}'
```

Or manually in Yoco Dashboard add webhook URL:
- **URL**: `https://staging-holiday-pass.netlify.app/.netlify/functions/yoco-webhook`
- **Events**: `payment.succeeded`

Note the webhook secret it provides.

### 5. Deploy staging branch

```bash
git push origin staging
```

Netlify will auto-deploy the staging branch to staging site.

### 6. Test with Yoco test card

1. Go to `https://staging-holiday-pass.netlify.app/`
2. Click "Get the Pass"
3. Fill in email, name, select pass type
4. At checkout, use test card: **4111 1111 1111 1111**
5. Expiry: any future date (e.g., 12/25)
6. CVC: any 3 digits (e.g., 123)
7. Click Pay - should NOT charge your account

### 7. Check function logs

- Go to **Staging Site → Functions**
- Look for `yoco-webhook` logs
- Should see:
  - `Webhook received` ✓
  - `Webhook signature verified successfully` ✓
  - `Processing payment.succeeded event` ✓
  - `Checkout created successfully` ✓

### 8. Verify pass created in Firestore

- Go to **Firebase Console → Firestore → passes collection**
- Should see a new pass doc with `passStatus: 'paid'`
- App should show pass in "My Pass" page

### 9. Once verified, merge to production

```bash
git checkout main
git merge staging
git push origin main
```

Production will redeploy with same code but keep `sk_live_*` keys.

## Test Card Numbers

**Test mode only** (sk_test_):
- Success: `4111 1111 1111 1111`
- Declined: `4000 0000 0000 0002`
- Expired: `4000 0000 0000 0069`

See [Yoco Docs](https://docs.yoco.com) for more test cards.

## Troubleshooting

### Webhook not firing?
- Check Yoco Dashboard webhook URL is correct
- Check signature secret is set in Netlify env vars
- Check function logs for signature verification errors

### Pass not created?
- Check Firestore `passes` collection
- Check webhook function logs
- Verify metadata in payment (passType, userEmail, etc.)

### Still using live key by mistake?
- Verify `YOCO_SECRET_KEY` starts with `sk_test_` in staging Netlify
- Check Netlify env vars are NOT inheriting from production

## Keep Staging Updated

After testing, always keep staging branch in sync with main:
```bash
git checkout staging
git merge main
git push origin staging
```
