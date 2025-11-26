# Netlify Environment Variables Setup

## ⚠️ CRITICAL: Complete Before Launch

You must configure these 8 environment variables in Netlify before deploying to production.

### Steps to Configure

1. **Go to Netlify Dashboard**
   - Login at https://app.netlify.com
   - Select your site (or your domain)

2. **Navigate to Environment Settings**
   - Click **Site Settings** (top menu)
   - Click **Build & Deploy** in left sidebar
   - Click **Environment** section

3. **Add Each Variable**
   - Click **Add variable** button
   - Enter Key and Value pairs below
   - Click **Save**

### Required Environment Variables

#### Client-Side Variables (VITE_ prefix)
These are bundled into your frontend build:

```
VITE_FIREBASE_API_KEY = your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN = your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID = your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET = your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID = your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID = your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID = your_firebase_measurement_id
VITE_ADMIN_EMAIL = admin@yourdomain.com
```

**Source**: Firebase Console → Project Settings → General tab
- Copy the entire `firebaseConfig` object values

#### Server-Side Variables (Netlify Functions)
These are only available in your serverless functions:

```
SITE_URL = https://yourdomain.com
YOCO_SECRET_KEY = sk_live_your_secret_key_here
YOCO_SIGNING_SECRET = whsec_your_base64_encoded_secret
FIREBASE_PROJECT_ID = your_firebase_project_id
FIREBASE_CLIENT_EMAIL = your_service_account_email@appspot.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
```

**Sources**:
- **Yoco**: Merchant Dashboard → API Keys section
  - Secret Key: starts with `sk_live_`
  - Signing Secret: starts with `whsec_`, get from Webhooks section
- **Firebase Admin**: Firebase Console → Project Settings → Service Accounts → Generate new private key
  - Copy the JSON key and extract values

### Important Notes

1. **FIREBASE_PRIVATE_KEY Format**
   - The private key must preserve newlines
   - Replace actual newline characters with `\n` literal
   - Example: `-----BEGIN PRIVATE KEY-----\nMIIEvQIBA...\n-----END PRIVATE KEY-----\n`
   - The webhook handler will convert them back to actual newlines

2. **YOCO_SIGNING_SECRET Format**
   - Must start with `whsec_`
   - Is base64-encoded, don't decode it
   - The webhook handler decodes it automatically

3. **SITE_URL**
   - Used for payment success/failure redirects
   - Must match your production domain
   - Example: `https://yoursite.netlify.app` or `https://yourdomain.com`

4. **Testing Before Launch**
   - Deploy to Netlify after setting variables
   - Run: `npm run build` locally to ensure build passes
   - Test payment flow with Yoco test card: `4111 1111 1111 1111`
   - Verify webhook receives payment success events

### Troubleshooting

**Error: "YOCO_SECRET_KEY not configured"**
- Variable is not set in Netlify
- Verify it's under Site Settings → Build & Deploy → Environment
- Check exact spelling (case-sensitive)

**Error: "Webhook signature verification failed"**
- YOCO_SIGNING_SECRET is incorrect or missing
- Verify it starts with `whsec_`
- Get latest from Yoco Dashboard → Webhooks

**Firebase Authentication Errors**
- FIREBASE_PRIVATE_KEY may have formatting issues
- Ensure newlines are `\n` not actual line breaks
- Verify FIREBASE_CLIENT_EMAIL and FIREBASE_PROJECT_ID match

**Payment redirects to wrong URL**
- SITE_URL doesn't match your actual domain
- Update in Netlify and redeploy

### Verification Checklist

- [ ] All 8 VITE_ variables set in Netlify
- [ ] All 6 server-side variables set in Netlify
- [ ] Build passes: `npm run build`
- [ ] Payment flow works with test card
- [ ] Webhook receives payment events
- [ ] Pass created in Firestore after payment
- [ ] No "not configured" errors in Netlify logs
