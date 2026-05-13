import { Footer, PublicHeader, SectionCard } from "@/components/ui-shell";
import { currency } from "@/lib/utils";

function calculateProrated(monthlyAmount: number, daysInMonth: number, occupiedDays: number) {
  return (monthlyAmount / daysInMonth) * occupiedDays;
}

export default function ProratedRentCalculatorPage() {
  const monthlyRent = 2400;
  const utilities = 180;
  const daysInMonth = 30;

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
        <SectionCard title="Example calculations" description="Swap the numbers in-app after sign-in to match your own lease.">
          <div className="three-column">
            <div className="rounded-[18px] bg-white/70 p-5">
              <p className="font-semibold text-slate-950">10 days occupied</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{currency(calculateProrated(monthlyRent, daysInMonth, 10))}</p>
              <p className="mt-2 text-sm text-slate-600">Utilities example: {currency(calculateProrated(utilities, daysInMonth, 10))}</p>
            </div>
            <div className="rounded-[18px] bg-white/70 p-5">
              <p className="font-semibold text-slate-950">17 days occupied</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{currency(calculateProrated(monthlyRent, daysInMonth, 17))}</p>
              <p className="mt-2 text-sm text-slate-600">Utilities example: {currency(calculateProrated(utilities, daysInMonth, 17))}</p>
            </div>
            <div className="rounded-[18px] bg-white/70 p-5">
              <p className="font-semibold text-slate-950">23 days occupied</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{currency(calculateProrated(monthlyRent, daysInMonth, 23))}</p>
              <p className="mt-2 text-sm text-slate-600">Utilities example: {currency(calculateProrated(utilities, daysInMonth, 23))}</p>
            </div>
          </div>
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
