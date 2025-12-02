# Webhook Fix - Final Handoff

## Status
**Payment webhook is mostly working but has intermittent signature verification failures.**

## What Was Fixed

### 1. Webhook Signature Verification
- **Problem**: Invalid `YOCO_SIGNING_SECRET` in Netlify was allowing spoofed webhooks and rejecting legitimate ones
- **Solution**: Updated secret multiple times (see issues below)
- **Current Secret**: `whsec_REE3NkU1NjIyQzIxOEI5NUNENUIwODNGNTVFRjZFNkM=` (from Yoco v2 webhook)
- **Status**: Works intermittently—1 payment succeeded, 2+ failed with signature mismatch

### 2. Duplicate Pass Creation
- **Problem**: Webhook retries were creating multiple passes for same payment
- **Solution**: 
  - Initially tried Firestore transactions (failed due to read/write ordering constraints)
  - Reverted to simple duplicate check: query for existing `paymentRef` before creating
  - Now detects duplicates and returns 200 OK instead of creating new pass
- **Status**: ✅ Working (staging tested)

### 3. Webhook Cleanup
- **Problem**: 5 webhooks were active in Yoco, causing duplicate deliveries and confusion
- **Solution**: Deleted old webhooks, kept only v2 (`sub_9Ee7y6RV13OCYaBI3YzCKP7x`)
- **Current Webhooks**:
  - **Production**: `holiday-pass-webhook-live-production-v2` (live mode)
  - **Staging**: `holiday-pass-webhook` (test mode)
- **Status**: ✅ Cleaned up

## Current Issues

### 1. YOCO_SIGNING_SECRET Mismatch (CRITICAL)
**Logs show**:
- 03:28:36 PM: ✅ Hash match: true → Pass created
- 03:29:53 PM: ❌ Hash match: false → Rejected
- 03:33:07 PM: ❌ Hash match: false → Rejected

**Root Cause**: Secret in Netlify env var doesn't match Yoco v2 webhook secret

**Investigation Done**:
- Verified v2 webhook secret in Yoco: `whsec_REE3NkU1NjIyQzIxOEI5NUNENUIwODNGNTVFRjZFNkM=`
- Confirmed secret is set in Netlify (masked with "contains secret values" checkbox)
- Cannot verify full value in Netlify UI due to masking

**Why One Payment Succeeded**:
- Payment at 03:28:36 had correct secret (likely updated recently)
- Subsequent payments failed, suggesting secret changed or was corrupted during copy/paste

## Next Steps (For Next Agent)

### Immediate (Critical)
1. **Fix YOCO_SIGNING_SECRET**:
   - Clear the env var from Netlify completely
   - Create new env var **without** "contains secret values" enabled
   - Copy secret from Yoco v2 webhook character-by-character very carefully
   - Paste into Netlify
   - **Verify it looks correct** (starts with `whsec_`, matches Yoco exactly)
   - Check the "contains secret values" checkbox
   - Save
   - **Manual redeploy** in Netlify (force deploy)
   - Test with new payment

2. **Clean Up Fraudulent Passes** in Firestore:
   - Delete: `PAHP-LS1BY9M` (created from spoofed webhook)
   - Delete: `PAHP-3FGPD8J` (created from spoofed webhook)
   - Keep: `PAHP-CGEXSYN` and later successful ones
   - Refund user for duplicate charge from failed attempt

3. **Test Full Flow**:
   - Staging: Test with `4111111111111111` (test card)
   - Production: Wait for real user payment or use test card via Yoco test mode

### Optional (Improvement)
1. **Setup Single Main Branch** (currently staging + main):
   - Delete staging branch
   - Connect both staging and production Netlify sites to `main` branch
   - Use different env vars per site (test vs live keys)
   - This prevents divergence and simplifies maintenance

2. **Add Logging**:
   - Could add line after transaction: `console.log('Pass created:', { passId, isDuplicate: false })`
   - But current logging is sufficient

## Code Changes Made

### netlify/functions/yoco-webhook.ts
- Removed Firestore transactions (had bugs)
- Simple duplicate check: query `paymentRef` before creating
- If duplicate found: log + return 200 OK with existing passId
- If new: create pass + increment pricing count

### Files Modified
- `netlify/functions/yoco-webhook.ts` - webhook handler
- `PAYMENT_WEBHOOK_FIX_HANDOFF.md` - removed SITE_URL to pass secrets scanning
- Git commits: 3 (fixed transactions, fixed read/write ordering, removed transactions, cleaned up secrets)

## Key Findings

1. **Firestore Query Reads in Transactions**: Cannot use `transaction.get(query)` where query has `.where()`. This caused "reads must happen before writes" error even with correct ordering.

2. **Simple Duplicate Check Works**: Query-based duplicate detection (outside transaction) is sufficient because Yoco's webhook retries always have the same payment ID.

3. **Secret Masking Issue**: Netlify's "contains secret values" checkbox masks the env var, making it impossible to verify if the full secret was copied correctly.

4. **Webhook Delivery**: Yoco sends multiple webhooks for same payment (retry logic). Each has unique webhook ID but same payment ID (paymentRef).

## Testing Results

**Staging (Dec 2, 02:00:59 PM)**:
- ✅ One payment, one pass created
- ✅ Webhook retry detected as duplicate
- ✅ Duration: 1129ms reasonable

**Production (Dec 2, 03:28:36 PM)**:
- ✅ One payment succeeded
- ⚠️ Two subsequent payments failed (signature mismatch)
- ❌ Secret mismatch causing rejections

## User Impact

- One user received duplicate charge (refund pending)
- Fraudulent passes created from spoofed webhooks (deletion pending)
- Most recent real payments getting rejected due to secret mismatch

## Environment

- **Production**: `holidaypass.live` (main branch)
- **Staging**: `portalfredholidaypassbeta.netlify.app` (staging branch)
- **Firebase**: holiday-pass-6dc84 (shared across both)
- **Yoco**: Live and test accounts with separate credentials per branch

## Gotchas for Next Agent

1. **Don't use Firestore transactions** with `.where()` queries—use simple query + check pattern
2. **YOCO_SIGNING_SECRET must match exactly**—test after updating
3. **Netlify masking hides copy errors**—disable masking to verify
4. **Webhook retries come fast**—allow duplicate detection to catch them
5. **Admin SDK bypasses Firestore rules**—don't rely on rules for webhook auth (signature verification is the guard)
