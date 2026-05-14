# Human Input Needed

The app runs fully without any of these — all external services have safe local fallbacks.
Add credentials in your deployment platform (Coolify) environment variables when you are ready.

---

## Google OAuth (optional — enables Google sign-in)

1. Go to https://console.cloud.google.com/
2. Create a project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Copy the Client ID and Client Secret

```
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

Without these, the app uses **Demo mode** — users sign in with any name and email, no password required.

---

## Stripe Payments (optional — enables Pro upgrade checkout)

1. Create a Stripe account at https://stripe.com
2. Create a Product with two prices:
   - Pro Monthly: $5.99/month (recurring)
   - Pro Annual: $29.99/year (recurring)
3. Copy the price IDs (start with `price_`)
4. Add a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
   - Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

```
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Without these, the billing page shows a **"Local Pro preview"** button that activates Pro features for testing.

---

## Resend Email (optional — enables PDF report email delivery)

1. Create an account at https://resend.com
2. Verify your sending domain
3. Create an API key

```
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

Without these, report email delivery stays disabled and the reports page clearly indicates that email fallback mode is active.

---

## S3-compatible Object Storage (optional — enables photo file storage)

Photos are stored as base64 data URLs in SQLite by default. For production scale, configure S3 or Cloudflare R2.

1. Create a Cloudflare R2 bucket (or any S3-compatible service)
2. Create an API token with read/write access

```
S3_BUCKET_NAME=your-bucket-name
S3_REGION=auto
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
```

Without these, photos are stored inline as base64 data URLs in the SQLite database. This works for development and low-volume use but will increase database size with many photos.

---

## Production AUTH_SECRET

Generate a strong random secret for production:

```bash
openssl rand -base64 32
```

```
AUTH_SECRET=your-generated-secret
```

A default is baked into the Dockerfile so the app starts without this set. Override it for real deployments.

---

## Optional runtime base URL

If your deployment platform lets you provide the public app origin at runtime, set:

```bash
APP_URL=https://yourdomain.com
```

The app now treats `APP_URL` as the source of truth for server-generated share links, billing redirects, sitemap URLs, metadata, and Auth.js runtime origin handling. In Docker, runtime startup mirrors `APP_URL` into `AUTH_URL` and `NEXTAUTH_URL` when those are not explicitly set.
