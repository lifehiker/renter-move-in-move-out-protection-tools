import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionCard, StatCard, Pill } from "@/components/ui-shell";
import { calculateBalances, getPrimaryPropertyForUser, getUpcomingOccurrences, getUsageSummary } from "@/lib/app-data";
import { currency, shortDate } from "@/lib/utils";
import { requireCurrentUser } from "@/lib/session";

export default async function DashboardPage() {
  const user = await requireCurrentUser();
  const property = await getPrimaryPropertyForUser(user.id);

  if (!property) {
    redirect("/onboarding");
  }

  const [balances, upcoming, usage] = await Promise.all([
    calculateBalances(property.id),
    getUpcomingOccurrences(property.id),
    getUsageSummary(property.id),
  ]);

  return (
    <div className="space-y-6">
      <section className="hero-panel space-y-4">
        <p className="eyebrow">Dashboard</p>
        <h1 className="display-title">{property.address}</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Keep your deposit documentation and roommate finances in one place. The
          overview below shows current household balances, upcoming recurring
          bills, and how close the property is to free-tier limits.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="button-primary" href={`/properties/${property.id}/checklist`}>
            Continue checklist
          </Link>
          <Link className="button-secondary" href={`/properties/${property.id}/expenses`}>
            Manage bills and expenses
          </Link>
        </div>
      </section>

      <section className="metrics-grid">
        <StatCard label="Monthly rent" value={currency(property.monthlyRent)} detail={`Security deposit: ${currency(property.securityDepositAmount)}`} />
        <StatCard label="Roommates" value={String(usage.memberCount)} detail="Placeholders count toward the household limit." />
        <StatCard label="Recurring bills" value={String(usage.recurringBillCount)} detail="The dashboard auto-generates monthly occurrences for active templates." />
        <StatCard label="Photos" value={String(usage.photoCount)} detail={`Reports created: ${usage.reportCount}`} />
      </section>

      <section className="two-column">
        <SectionCard title="Household balances" description="Net reflects shared expenses paid versus current month obligations.">
          <ul className="list-clean">
            {balances.map((entry) => (
              <li key={entry.memberId} className="flex items-center justify-between rounded-[18px] bg-white/70 p-4">
                <div>
                  <p className="font-semibold text-slate-950">{entry.name}</p>
                  <p className="text-sm text-slate-600">
                    Owes {currency(entry.owes)} • Paid {currency(entry.paid)}
                  </p>
                </div>
                <Pill tone={entry.net >= 0 ? "success" : "warning"}>
                  {entry.net >= 0 ? `Owed ${currency(entry.net)}` : `Needs ${currency(Math.abs(entry.net))}`}
                </Pill>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Upcoming recurring charges" description="Auto-generated from recurring templates for this month and next.">
          <ul className="list-clean">
            {upcoming.map((occurrence) => (
              <li key={occurrence.id} className="rounded-[18px] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{occurrence.recurringBill.name}</p>
                    <p className="text-sm text-slate-600">
                      Due {shortDate(occurrence.dueDate)} • {occurrence.recurringBill.splitMethod.toLowerCase()} split
                    </p>
                  </div>
                  <Pill>{currency(occurrence.totalAmount)}</Pill>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    </div>
  );
}
