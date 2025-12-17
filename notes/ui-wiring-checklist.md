# UI wiring checklist (backend)

## Credential (Home)
- `/.netlify/functions/issue-rotating-code` should return `{ code, expiresAt, rotationSeconds, credential }` to match `src/hooks/useRotatingCode.ts`.
- Ensure rotating codes are **6 digits** and rotate at the org-configured interval.
- (Optional) Add a `lastVerifiedAt` field to the response if you want the UI to show “Last verified”.

## Guests
- `/.netlify/functions/create-guest-pass` should accept `{ guestName?, validFrom, validTo }` and return `{ guestUrl }` (used by `src/pages/GuestsPage.tsx`).
- Guest URLs should route to `/guest/:token` and resolve the credential + rotating code.

## Verifier Mode (`/verify`)
- `/.netlify/functions/unlock-verifier` should accept `{ pin, deviceId }` and return `{ sessionToken }`.
- Replace `mockVerify()` in `src/pages/VerifierPage.tsx` with the real call (e.g. `/.netlify/functions/validate-rotating-code`) returning `{ result: 'allowed'|'denied', reason }`.
- Validation should enforce checkpoint rules (`allowedTypes`, credential status, validity window) and return clear reasons (`Expired`, `Not permitted`, `Invalid code`).

## Admin
- Set `VITE_ORG_ID` to the admin org context (used by `src/components/AdminDashboard.tsx`).
- Wire CSV import to create/update credentials and surface row-level errors (UI shell is in the Credentials tab).

