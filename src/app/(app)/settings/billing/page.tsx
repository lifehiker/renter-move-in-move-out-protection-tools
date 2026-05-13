import { startUpgradeCheckout } from "@/app/actions/app-actions";
import { SectionCard, StatCard } from "@/components/ui-shell";
import { FREE_LIMITS, PRO_PLAN } from "@/lib/plans";
import { requireCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireCurrentUser();
  const params = await searchParams;
  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <section className="hero-panel space-y-4">
        <p className="eyebrow">Billing</p>
        <h1 className="display-title">Upgrade when the free tier starts getting in your way.</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Without Stripe credentials, this page can still activate a local Pro
          preview so the rest of the app remains fully testable.
        </p>
      </section>
      <section className="surface-grid">
        <StatCard label="Current plan" value={subscription?.plan || "FREE"} detail={`Status: ${subscription?.status || "FREE"}`} />
        <StatCard label="Annual plan" value={`$${PRO_PLAN.yearly}`} detail="Best default for seasonal moving workflows." />
      </section>
      {(params.limit || params.mode || params.checkout) ? (
        <SectionCard title="Billing note" description="The app redirects here when a free-tier limit is hit or when checkout changes state.">
          <p className="text-sm text-slate-700">
            {String(params.limit || params.mode || params.checkout)}
          </p>
        </SectionCard>
      ) : null}
      <SectionCard title="Free tier limits" description="These are enforced with graceful redirects into billing.">
        <ul className="list-clean text-sm leading-7 text-slate-700">
          <li>{FREE_LIMITS.properties} property</li>
          <li>{FREE_LIMITS.roommates} roommates</li>
          <li>{FREE_LIMITS.recurringBills} recurring bills</li>
          <li>{FREE_LIMITS.photos} photos</li>
          <li>{FREE_LIMITS.pdfExports} PDF export</li>
        </ul>
        <form action={startUpgradeCheckout} className="mt-5">
          <button className="button-primary" type="submit">
            {subscription?.status === "PRO_PREVIEW" ? "Refresh Pro preview" : "Upgrade to Pro"}
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
