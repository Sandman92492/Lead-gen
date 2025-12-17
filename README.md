# Raffle Tickets (Vite + React + Netlify Functions)

## Deploy to Netlify

1. Push this repo to GitHub (or GitLab).
2. In Netlify: **Add new site → Import an existing project** and select the repo.
3. Build settings (these are already in `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `dist/functions`
4. Set the required environment variables in **Site configuration → Environment variables** (see below).
5. Deploy.

## Environment variables

### Frontend (Vite)
These must be set in Netlify (they are baked in at build time):

- `VITE_DATA_MODE` = `firebase` (or `mock` to run without Firebase)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_ADMIN_EMAIL`

### Netlify Functions (server-side)

- `SITE_URL` (your deployed site URL, e.g. `https://your-site.netlify.app`)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (service account private key, with `\n` escaped newlines)
- `YOCO_SECRET_KEY`
- `YOCO_SIGNING_SECRET`
- `MAILERLITE_API_KEY`
- `GUEST_TOKEN_SECRET`
- `VERIFIER_SESSION_SECRET`
- `VERIFIER_SESSION_TTL_SECONDS` (optional, default `900`)

## Local dev

- Create a local `.env` (or `.env.local`) based on `.env.staging.example`.
- Run `npm install` then `npm run dev`.

