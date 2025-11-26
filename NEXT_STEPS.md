# 🎯 Next Steps (Before Launch)

## TODAY - Configure Netlify (30 minutes)

### Step 1: Gather Production Credentials
Get these values from your service accounts:

**From Firebase Console:**
1. Go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy these 6 values:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (with \n for newlines)
   - `VITE_FIREBASE_PROJECT_ID` (same as above)
   - Other VITE_FIREBASE_* values from your web app config

**From Yoco Merchant Dashboard:**
1. Go to API Keys section
2. Copy:
   - `YOCO_SECRET_KEY` (starts with `sk_live_`)
3. Go to Webhooks section
4. Copy:
   - `YOCO_SIGNING_SECRET` (starts with `whsec_`)

### Step 2: Configure in Netlify (5 minutes)
1. Login to https://app.netlify.com
2. Select your site
3. Site Settings → Build & Deploy → Environment
4. Click "Add variable" 8 times and paste:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_MEASUREMENT_ID=...
   VITE_ADMIN_EMAIL=your@email.com
   SITE_URL=https://yourdomain.com
   YOCO_SECRET_KEY=sk_live_...
   YOCO_SIGNING_SECRET=whsec_...
   FIREBASE_PROJECT_ID=...
   FIREBASE_CLIENT_EMAIL=...
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   ```

### Step 3: Test Payment Flow (10 minutes)
1. Deploy to Netlify (it will auto-deploy on git push or manual deploy)
2. Test card: `4111 1111 1111 1111`
3. Check:
   - Yoco checkout loads
   - Payment processes
   - Pass appears in Firestore
   - Webhook fires in Yoco logs

## WEEK 1 - Testing (Daily)

### Daily Checklist
- [ ] Test full redemption flow (deal → PIN → success)
- [ ] Verify no errors in Netlify function logs
- [ ] Check Firebase security rules are correct
- [ ] Test on mobile (iOS + Android)
- [ ] Verify WhatsApp support number works
- [ ] Test admin dashboard access

### Mobile Testing
```
Must test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] iPad (Safari) - optional but good to verify
- [ ] Different network conditions (4G, WiFi, offline)
```

## LAUNCH DAY

### Final Verification (1 hour)
- [ ] Build passes: `npm run build`
- [ ] No errors in Netlify UI
- [ ] Payment flow works (test card)
- [ ] Redemption flow works (test PIN)
- [ ] Admin can access dashboard
- [ ] All vendors + deals populated in Firestore
- [ ] WhatsApp number is correct

### Monitoring First Hour
- [ ] Watch Netlify function logs for errors
- [ ] Check Yoco dashboard for payment failures
- [ ] Monitor Firebase for Firestore errors
- [ ] Be ready to rollback if critical issue

---

## File Reference

| File | Purpose | When Needed |
|------|---------|-------------|
| `CRITICAL_FIXES_COMPLETED.md` | Summary of what was fixed | Now (for understanding) |
| `NETLIFY_SETUP.md` | Step-by-step config guide | NOW |
| `LAUNCH_CHECKLIST.md` | Full pre-launch checklist | During testing |
| `.env.example` | Environment variable template | Reference |

---

## Red Flags (Stop and Fix Before Launch)

🛑 **DO NOT LAUNCH IF:**
- [ ] Any Netlify environment variables are missing
- [ ] `npm run build` shows errors
- [ ] Payment webhook isn't firing
- [ ] Pass doesn't appear in Firestore after payment
- [ ] Admin dashboard shows "You don't have access"
- [ ] Redemption PIN doesn't verify
- [ ] No vendors/deals in Firestore

---

## Support Resources

- Netlify Logs: Netlify UI → Logs → Tail logs
- Yoco Webhook Logs: Yoco Dashboard → Webhooks → Event deliveries
- Firebase Errors: Firebase Console → Firestore → Review logs
- Browser Console: F12 → Console tab (should show no errors)

**Support Contact**: WhatsApp 065 806 2198

---

Good luck! 🚀
