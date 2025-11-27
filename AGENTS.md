# AGENTS.md - Development Guidelines

## Build & Commands

- **Dev server**: `npm run dev` (starts on http://localhost:5173)
- **Build**: `npm run build` (compiles TypeScript + Vite + Netlify functions; runs `tsc`, `vite build`, and `tsc --project tsconfig.netlify.json`)
- **Preview**: `npm run preview` (test production build locally)
- **Single test**: No test suite configured (add Jest/Vitest if needed)

## Architecture Overview

**Project**: Port Alfred Holiday Pass (PAHP) - A digital pass marketplace for exclusive deals at local businesses

### Frontend Stack
- **React 18 + TypeScript** (Vite, ES2020 target)
- **Tailwind CSS 3.4** with CSS variables for theming (light/dark mode)
- **React Router v7.9** for SPA navigation
- **State Management**: React Context (AuthContext, ThemeContext, ToastContext)
- **Data Fetching**: TanStack React Query v5 + Firebase SDK v12.5

### Backend & Services
- **Firebase Auth**: Email/password + Google OAuth
- **Firestore**: Real-time database for:
  - `passes` collection (pass records with payment status)
  - `vendors` collection (businesses offering deals)
  - `deals` collection (individual deals with redemption tracking)
  - `redemptions` collection (deal redemptions by pass)
  - `users` collection (user profiles)
  - `config/pricing` (dynamic pricing metadata)
- **Netlify Functions** (`netlify/functions/`):
  - `create-checkout.ts`: Creates Yoco payment checkout
  - `yoco-webhook.ts`: Handles payment.succeeded webhooks, creates/verifies passes, updates pass count
- **Payment Gateway**: Yoco (ZAR) - webhook-based payment processing

### Directory Structure
```
/src
  /components     - React UI components (modals, buttons, cards, etc.)
  /context        - AuthContext (user/pass state), ThemeContext, ToastContext
  /hooks          - useAllDeals, useRedemptions, useTotalSavings, useVendor, useSwipeGesture
  /pages          - HomePage, MyPassPage, AllDealsPage, VipDashboard, ProfilePage, etc.
  /services       - authService (Firebase auth), firestoreService (CRUD operations)
  /server         - validation.ts (localStorage mock DB for pass validation/sharing)
  /utils          - formatting, validation, pricing, haptics, PWA utilities
  App.tsx         - Root component with modal orchestration
  firebase.ts     - Firebase initialization (env-based config)
  types.ts        - TypeScript interfaces (PassType, Vendor, Deal, etc.)
  main.tsx        - Entry point
  index.css       - Global styles
  colors.css      - CSS color variables
/netlify/functions - Serverless functions compiled to dist/functions
/public           - Static assets (manifest.json, service worker)
/server           - Shared validation logic (runs in browser localStorage)
```

## Data Models

### PassDocument (Firestore: passes collection)
```
passId: string
passHolderName: string
email: string
userId: string (Firebase UID)
passType: 'holiday' | 'annual'
passStatus: 'free' | 'paid'
expiryDate: ISO8601 string
createdAt: ISO8601 string
paymentRef?: string (Yoco ID)
paymentStatus?: 'pending' | 'completed' | 'failed'
purchasePrice?: number (Rands, set by webhook)
plusOneName?: string
plusOneAddedBy?: string (email)
plusOneActivatedBy?: string (email)
```

### Vendor (Firestore: vendors collection)
```
vendorId: string
name: string
email: string
phone: string
pin: string (4-digit PIN for redemption verification)
category: 'restaurant' | 'activity' | 'shopping'
city: string
address?: string
mapsUrl?: string
imageUrl?: string
images?: string[]
createdAt: ISO8601 string
isActive: boolean
```

### Deal (Firestore: deals collection)
```
id?: string (Firestore doc ID)
vendorId: string (reference to vendor)
name: string
offer: string
savings?: number (numeric amount)
category?: 'restaurant' | 'activity' | 'shopping'
city?: string
featured?: boolean
imageUrl?: string
images?: string[]
gmapsQuery?: string (fallback for directions)
terms?: string
createdAt?: ISO8601 string
```

### RedemptionDocument (Firestore: redemptions collection)
```
passId: string
dealName: string
vendorId: string
redeemedAt: ISO8601 string
userId?: string
```

## Services & Hooks

### authService (`src/services/authService.ts`)
- `signUpWithEmail(email, password, displayName?)` - Register new user
- `signInWithEmail(email, password)` - Email/password login
- `signInWithGoogle()` - OAuth login, creates/updates user doc
- `signOut()` - Firebase sign out
- `listenToAuthState(callback)` - Real-time auth listener
- `getCurrentUser()` - Get active user
- `updateUserProfile(displayName)` - Update profile in Auth + Firestore

### firestoreService (`src/services/firestoreService.ts`)
**Pass operations**:
- `createPass(pass)` - Create new pass
- `getPassById(passId)` - Fetch single pass
- `getPassesByUserId(userId)` / `getPassesByEmail(email)` - User's passes
- `updatePass(passId, updates)` - Patch pass fields
- `recordRedemption(passId, dealName, vendorId, userId)` - Log deal redemption
- `getRedemptionsByPass(passId)` - Get all redemptions for pass
- `isDealRedeemed(passId, dealName)` - Check redemption status

**Vendor operations**:
- `createVendor(vendor)`, `getVendorById(vendorId)`, `getAllVendors()`
- `getVendorsByCity(city)`, `getVendorsByCategory(category)`, `getVendorsByCityAndCategory(city, category)`
- `verifyVendorPin(vendorId, pin)` - PIN validation for redemption
- `updateVendor(vendorId, updates)`, `deleteVendor(vendorId)`

**Deal operations**:
- `createDeal(deal)`, `getDealById(dealId)`, `getAllDeals()`
- `getDealsByCity(city)`, `getDealsByCategory(category)`, `getDealsByCityAndCategory(city, category)`
- `getDealsByVendor(vendorId)` - Fetch deals for specific vendor
- `updateDeal(dealId, updates)`, `deleteDeal(dealId)`

**Utilities**:
- `getUserProfile(userId)` - Fetch photoURL + displayName

### Custom Hooks
- `useAllDeals()` - TanStack Query hook for deal fetching
- `useRedemptions()` - Track redeemed deals
- `useTotalSavings()` - Calculate total savings from redeemed deals
- `useVendor(vendorId)` - Fetch single vendor
- `useSwipeGesture()` - Detect swipe left/right for tab navigation

## Netlify Functions

### create-checkout.ts
- **Endpoint**: `/.netlify/functions/create-checkout`
- **Method**: POST
- **Body**: `{ amount: number, passType: string, userEmail: string, passHolderName: string, userId: string }`
- **Returns**: `{ checkoutId: string, redirectUrl: string }`
- **Flow**: Validates inputs → Uses SITE_URL env var for callback URLs → Calls Yoco API → Returns checkout redirect

### yoco-webhook.ts
- **Endpoint**: `/.netlify/functions/yoco-webhook`
- **Trigger**: Yoco payment.succeeded webhook
- **Headers**: `webhook-signature`, `webhook-id`, `webhook-timestamp`
- **Signature Verification**: HMAC-SHA256 with YOCO_SIGNING_SECRET (whsec_ format, base64-decoded)
- **Logic**:
  1. Verify webhook HMAC signature
  2. Check for existing completed pass (deduplicate)
  3. Generate passId (`PAHP-<random>`)
  4. Set expiryDate: 30 days for 'holiday', 1 year for 'annual'
  5. Create pass doc with `paymentStatus: 'completed'`
  6. Atomically increment `config/pricing.currentPassCount` (for dynamic pricing)

## Environment Variables

**⚠️ SECURITY WARNING**: Never commit `.env` file to git. It is in `.gitignore`. All values must be set in Netlify dashboard under Site settings → Environment.

### Frontend (Vite, prefixed VITE_)
```
VITE_FIREBASE_API_KEY              - Firebase public API key (safe to expose, read-only)
VITE_FIREBASE_AUTH_DOMAIN          - Firebase auth domain
VITE_FIREBASE_PROJECT_ID           - Google Cloud project ID
VITE_FIREBASE_STORAGE_BUCKET       - Cloud Storage bucket
VITE_FIREBASE_MESSAGING_SENDER_ID  - FCM sender ID
VITE_FIREBASE_APP_ID               - Firebase app ID
VITE_FIREBASE_MEASUREMENT_ID       - Google Analytics ID (optional)
VITE_ADMIN_EMAIL                   - Email for admin dashboard access (with ?admin=true)
```

### Backend (Netlify Functions) - SENSITIVE
```
SITE_URL                           - Production domain (used for Yoco redirect URLs) - CRITICAL: must be set correctly
YOCO_SECRET_KEY                    - Yoco API secret key - KEEP SECRET
YOCO_SIGNING_SECRET                - Yoco webhook signing secret (whsec_<base64>) - KEEP SECRET
FIREBASE_PROJECT_ID                - Admin SDK project ID
FIREBASE_CLIENT_EMAIL              - Admin SDK service account email
FIREBASE_PRIVATE_KEY               - Admin SDK private key (escaped newlines: \\n) - KEEP SECRET
```

**How to set in Netlify**:
1. Go to Site → Site settings → Build & deploy → Environment
2. Click "Edit variables"
3. Add each variable as separate entry
4. For FIREBASE_PRIVATE_KEY: Copy entire key (with \\n), paste as-is
5. Redeploy after adding all variables

## Code Style & Conventions

- **TypeScript**: Strict mode enabled, no unused variables/params, no fallthrough switches
- **Imports**: 
  - Absolute paths from root (e.g., `from '../types'` or `from '../context/AuthContext'`)
  - Relative paths for same-directory imports
  - `.tsx` extension for React components, `.ts` for utilities
- **Naming**:
  - **Components**: PascalCase (e.g., `PurchaseModal.tsx`, `useAllDeals.ts`)
  - **Functions/variables**: camelCase (e.g., `handleRedeemDeal`, `isLoading`)
  - **Constants**: UPPER_SNAKE_CASE (e.g., `DB_KEY`, `ADMIN_EMAIL`)
  - **Types/Interfaces**: PascalCase (e.g., `PassDocument`, `UserState`)
- **React**: 
  - Functional components only, no class components
  - Hooks for state (useState, useEffect, useContext)
  - Props destructuring preferred
- **Error Handling**:
  - Try-catch blocks with console.error for logging
  - Toast notifications for user feedback (via useToast context)
  - Service methods return `{ success: boolean, error?: string, ...data }`
- **Formatting**: 
  - No ESLint/Prettier (manual formatting)
  - 2-space indentation
  - Consistent spacing around operators
  - Single quotes for strings

## Key Patterns

### Authentication Flow
1. User signs in via Firebase Auth (email/password or Google OAuth)
2. AuthContext listens to auth state, fetches user's passes from Firestore
3. Pass with `paymentStatus: 'completed'` is loaded into AuthContext
4. UserState: 'free' (no user) → 'signed-in' (user, no pass) → 'signed-in-with-pass'

### Payment Flow
1. User selects pass type, enters details → Opens PurchaseModal
2. PurchaseModal calls `/.netlify/functions/create-checkout`
3. Yoco checkout page redirects to success/failure URLs
4. App detects payment path, shows PaymentSuccess/PaymentFailure modal
5. Yoco webhook hits `/.netlify/functions/yoco-webhook` → Creates pass in Firestore
6. AuthContext polls passes, detects new pass, updates state

### Deal Redemption Flow
1. User clicks "Redeem Deal" → Opens RedemptionConfirmationModal
2. Confirmation → Opens PinVerificationModal (requires 4-digit PIN)
3. Correct PIN → Calls recordRedemption() → Shows RedemptionSuccessModal
4. Redeemed deals stored in AuthContext.redeemedDeals (used to disable buttons)

### Pass Sharing (+1 Family Member)
- Primary holder can add +1 name to pass
- Secondary user activates pass using Pass ID + Primary Name + email verification
- Uses `activateSharedPass()` from `src/server/validation.ts` (localStorage mock DB)
- Production: Replace with real backend when ready

## Modal Orchestration (App.tsx)
App.tsx manages all modal state. Key modals:
- `AuthModal` - Sign in/sign up
- `PurchaseModal` - Pass purchase flow
- `ActivatePassModal` - Activate shared pass
- `RedemptionConfirmationModal` - Confirm deal redemption
- `PinVerificationModal` - Vendor PIN entry
- `RedemptionSuccessModal` - Redemption success screen
- `PaymentSuccess/Failure/Cancel` - Payment result screens
- `AdminDashboard` - Vendor/deal management (requires admin email + ?admin=true URL param)

## Deployment (Netlify)

**Build command**: `npm run build`
**Publish directory**: `dist/`
**Functions directory**: `dist/functions`

**Security headers** (netlify.toml):
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

**Redirects**:
- All `/payment/*` paths → `/index.html` (200 status for SPA)
- All other routes → `/index.html` (SPA routing)

**Caching**:
- `/assets/*.{js,css}` → 31536000s (1 year), immutable
- `/sw.js` → no-cache, no-store
- `/manifest.json` → max-age=31536000
- `/index.html` → no-cache, no-store

## Common Tasks

### Add a new Firestore collection
1. Define TypeScript interface in `src/types.ts`
2. Add CRUD functions in `src/services/firestoreService.ts`
3. Use `collection()`, `addDoc()`, `getDoc()`, `updateDoc()`, `deleteDoc()` from Firebase SDK

### Add a new Netlify Function
1. Create `netlify/functions/my-function.ts`
2. Export `{ handler: Handler }` from `@netlify/functions`
3. Function is automatically compiled to `dist/functions/my-function.js`
4. Access via `/.netlify/functions/my-function`

### Debug localStorage mock DB
- Open browser DevTools → Application → localStorage
- Find `pass_validation_database` key
- Parse JSON to inspect pass records
- Useful during development without backend

### Test payment flow locally
- Use Yoco test credentials (available in Yoco dashboard)
- Set `SITE_URL=http://localhost:5173` in `.env.local`
- Test cards: 4111111111111111 (success), various others for failures

### Add a new hook
1. Create `src/hooks/useMyHook.ts`
2. Use TanStack Query for async data: `useQuery({ queryKey: [], queryFn: () => ... })`
3. Export hook, use in components: `const { data } = useMyHook()`

## Critical Pre-Launch Checklist (3-Day Launch)

### 1. Netlify Configuration (MUST DO FIRST)
- [ ] All 8 backend environment variables set in Netlify Dashboard (see Environment Variables section)
- [ ] Build command verified: `npm run build`
- [ ] Publish directory verified: `dist/`
- [ ] Functions directory verified: `dist/functions`
- [ ] SITE_URL set to your production domain (e.g., `https://yoursite.com`)
- [ ] Redeploy after setting env vars

### 2. Firebase Setup
- [ ] Firestore security rules are set (NOT in dev mode)
- [ ] Firebase Auth providers enabled: Email + Google OAuth
- [ ] Google Cloud service account created for Admin SDK
- [ ] Firebase Private Key copied correctly with `\\n` escapes (NOT literal newlines)

### 3. Yoco Integration
- [ ] Yoco test credentials working locally (`npm run dev`)
- [ ] YOCO_SECRET_KEY set in Netlify
- [ ] YOCO_SIGNING_SECRET set in Netlify (format: whsec_...)
- [ ] Webhook URL configured in Yoco Dashboard: `https://yoursite.com/.netlify/functions/yoco-webhook`
- [ ] Test webhook delivery from Yoco to ensure signature verification works

### 4. Payment Testing (Required before launch)
- [ ] Test full purchase flow: Select pass → Enter name/email → Complete Yoco checkout
- [ ] Verify pass created in Firestore with `paymentStatus: 'completed'`
- [ ] Verify pass appears in AuthContext and "My Pass" page
- [ ] Test payment failure scenario (use Yoco test card for failure)
- [ ] Verify user can retry payment after failure

### 5. Deal Redemption Testing
- [ ] Create 1 test vendor with PIN (e.g., "1234")
- [ ] Create 1 test deal under vendor
- [ ] Log in with paid pass
- [ ] Click "Redeem Deal" → Enter PIN → Verify success screen
- [ ] Verify redemption recorded in Firestore `redemptions` collection
- [ ] Verify deal button becomes disabled after redemption

### 6. Authentication Testing
- [ ] Email/password sign up works
- [ ] Email/password sign in works
- [ ] Google OAuth sign in works
- [ ] Sign out works and clears pass state
- [ ] Profile page shows user info correctly

### 7. Admin Dashboard
- [ ] Set VITE_ADMIN_EMAIL to your email in Netlify
- [ ] Navigate to `https://yoursite.com/?admin=true`
- [ ] Verify admin dashboard loads (only with correct email + URL param)
- [ ] Test creating vendor
- [ ] Test creating deal
- [ ] Test editing/deleting vendor and deal

### 8. Security Verification
- [ ] No API keys, secrets, or credentials in source code
- [ ] Firebase API key is public (OK to expose)
- [ ] YOCO_SECRET_KEY only in Netlify env (never in code)
- [ ] FIREBASE_PRIVATE_KEY only in Netlify env (never in code)
- [ ] `.env` file NOT committed to git (check `.gitignore`)

### 9. Production Data Setup
- [ ] Vendors created in Firestore with:
  - Valid vendorId, name, email, phone, pin
  - Correct category, city
  - isActive: true
- [ ] At least 5 deals created with:
  - Valid dealId (auto-generated or set)
  - Correct vendorId (reference to vendor)
  - offer and savings fields filled
  - featured: true for homepage deals
- [ ] Test that all deals appear in app

### 10. Performance & UX
- [ ] Dev server loads in <2 seconds (`npm run dev`)
- [ ] Production build size reasonable (run `npm run build`)
- [ ] All modals close properly (no stuck overlays)
- [ ] Auth modal sign-in/sign-up flows complete without errors
- [ ] Pass display shows live clock, expiry date
- [ ] Mobile responsive on iPhone 12 and Android phone

### 11. Final Verification
- [ ] Browser console clean (no errors, only expected warnings)
- [ ] Network tab: all requests successful (200 status)
- [ ] Firestore: All collections populated with test data
- [ ] Yoco: Test payment succeeds and creates pass
- [ ] Netlify: All functions working (check logs)
- [ ] Admin dashboard: Can create/edit/delete vendors and deals

## Gotchas

- **Firebase Rules**: Firestore rules are permissive (dev mode). Set proper rules before production.
- **Webhook Signature**: YOCO_SIGNING_SECRET must be base64-decoded (remove `whsec_` prefix). See `yoco-webhook.ts`.
- **Admin Access**: Requires both `?admin=true` URL param AND matching `VITE_ADMIN_EMAIL` in Firebase Auth.
- **Pass Expiry**: 30 days for 'holiday', 1 year for 'annual' (set in webhook).
- **Undefined fields**: Firestore doesn't support undefined values; always filter before saving.
- **useAuth hook**: Must be used inside `<AuthProvider>` wrapper (set up in main.tsx or App context).
- **SITE_URL critical**: If wrong, payment redirects break. Must match exact domain (with/without www).
- **FIREBASE_PRIVATE_KEY format**: Must have `\\n` (backslash-n) NOT actual newlines. Copy from service account JSON.
- **Test vs Prod credentials**: Keep separate Yoco test and prod keys. Test first, then switch.
- **Netlify redeploy**: Always redeploy after changing env vars—cached builds use old values.
