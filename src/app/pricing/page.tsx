import Link from "next/link";
import { Footer, PublicHeader, SectionCard, StatCard } from "@/components/ui-shell";

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell space-y-6">
        <section className="hero-panel space-y-4">
          <p className="eyebrow">Simple pricing</p>
          <h1 className="display-title">Protecting even $100 of your deposit pays for the year.</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Free covers the basics. Pro removes the friction points that matter
            during a real move: photo limits, clean exports, share links, and full
            report history.
          </p>
        </section>
        <section className="surface-grid">
          <StatCard label="Free" value="$0" detail="1 property, 3 roommates, 5 recurring bills, 20 photos, 1 watermarked export." />
          <StatCard label="Pro" value="$5.99 / month" detail="$29.99 yearly. Unlimited photos, exports, recurring bills, roommates, report history, and share links." />
        </section>
        <SectionCard title="What Pro unlocks" description="The upgrade is designed around the most valuable renter moments.">
          <ul className="list-clean text-sm leading-7 text-slate-700">
            <li>Unlimited photo evidence instead of a small free-tier cap.</li>
            <li>Unlimited PDF exports without watermarking.</li>
            <li>Unlimited recurring bills and roommate placeholders for one property.</li>
            <li>Move-in and move-out report history plus read-only share links.</li>
            <li>Email report delivery when Resend is configured.</li>
          </ul>
          <Link href="/sign-in" className="button-primary mt-5">
            Start with the free tier
          </Link>
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
