import { prisma } from "@/lib/db";
import { verifyStripeSignature } from "@/lib/payments";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ ok: true, skipped: "missing signature" });
  }

  const payload = await request.text();
  const event = verifyStripeSignature(payload, signature);

  if (!event) {
    return Response.json({ ok: true, skipped: "stripe not configured" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

    if (userId) {
      await prisma.subscription.upsert({
        where: { id: `sub-${userId}` },
        update: {
          userId,
          provider: "STRIPE",
          status: "ACTIVE",
          plan: "PRO",
          interval: "year",
          stripeCustomerId: session.customer?.toString(),
          stripeSubscriptionId: session.subscription?.toString(),
        },
        create: {
          id: `sub-${userId}`,
          userId,
          provider: "STRIPE",
          status: "ACTIVE",
          plan: "PRO",
          interval: "year",
          stripeCustomerId: session.customer?.toString(),
          stripeSubscriptionId: session.subscription?.toString(),
        },
      });
    }
  }

  return Response.json({ received: true });
}
