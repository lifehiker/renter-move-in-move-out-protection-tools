import Stripe from "stripe";
import { appEnv, hasStripe } from "@/lib/env";

function getStripeClient() {
  if (!hasStripe()) {
    return null;
  }

  return new Stripe(appEnv.stripeSecretKey!);
}

export async function createCheckoutSession(input: {
  userId: string;
  userEmail?: string | null;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripeClient();

  if (!stripe) {
    return null;
  }

  return stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.userEmail ?? undefined,
    line_items: [
      {
        price: appEnv.stripePriceIdPro!,
        quantity: 1,
      },
    ],
    metadata: {
      userId: input.userId,
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });
}

export function verifyStripeSignature(payload: string, signature: string) {
  const stripe = getStripeClient();
  if (!stripe || !appEnv.stripeWebhookSecret) {
    return null;
  }

  return stripe.webhooks.constructEvent(payload, signature, appEnv.stripeWebhookSecret);
}
