const resolvedAppUrl =
  process.env.APP_URL ||
  process.env.AUTH_URL ||
  process.env.NEXTAUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

if (process.env.APP_URL) {
  process.env.AUTH_URL = process.env.APP_URL;
  process.env.NEXTAUTH_URL = process.env.APP_URL;
} else if (!process.env.AUTH_URL) {
  process.env.AUTH_URL = resolvedAppUrl;
  process.env.NEXTAUTH_URL = process.env.AUTH_URL;
} else if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = process.env.AUTH_URL;
}

export const appEnv = {
  appUrl: resolvedAppUrl,
  authSecret: process.env.AUTH_SECRET || "dev-secret-change-me",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripePriceIdPro: process.env.STRIPE_PRICE_ID_PRO,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  s3BucketName: process.env.S3_BUCKET_NAME,
  s3Region: process.env.S3_REGION,
  s3AccessKeyId: process.env.S3_ACCESS_KEY_ID,
  s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  s3Endpoint: process.env.S3_ENDPOINT,
};

export function hasGoogleAuth() {
  return Boolean(appEnv.googleClientId && appEnv.googleClientSecret);
}

export function hasStripe() {
  return Boolean(appEnv.stripeSecretKey && appEnv.stripePriceIdPro);
}

export function hasResend() {
  return Boolean(appEnv.resendApiKey && appEnv.emailFrom);
}

export function hasS3() {
  return Boolean(
    appEnv.s3BucketName &&
      appEnv.s3Region &&
      appEnv.s3AccessKeyId &&
      appEnv.s3SecretAccessKey &&
      appEnv.s3Endpoint,
  );
}
