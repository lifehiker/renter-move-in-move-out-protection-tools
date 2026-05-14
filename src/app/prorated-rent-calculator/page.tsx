import { ProratedCalculator } from "@/components/prorated-calculator";
import { Footer, PublicHeader, SectionCard } from "@/components/ui-shell";

export default function ProratedRentCalculatorPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell space-y-6">
        <section className="hero-panel space-y-4">
          <p className="eyebrow">Utility page</p>
          <h1 className="display-title">Prorated rent calculator for roommate move-outs.</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">
            Use days occupied to split rent and shared utilities when someone moves
            in or out mid-month.
          </p>
        </section>
        <SectionCard title="Calculator" description="Use this live calculator for rent and utilities, then mirror the result in your household agreement.">
          <ProratedCalculator />
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
