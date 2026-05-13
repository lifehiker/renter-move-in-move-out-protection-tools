import { notFound } from "next/navigation";
import { saveExpense, saveRecurringBill } from "@/app/actions/app-actions";
import { SectionCard, Pill } from "@/components/ui-shell";
import { calculateBalances, getPropertyForUser, getUpcomingOccurrences } from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/session";
import { currency, shortDate } from "@/lib/utils";

function ShareInputs({ members }: { members: Array<{ id: string; name: string }> }) {
  return (
    <div className="three-column">
      {members.map((member) => (
        <label className="field" key={member.id}>
          <span>{member.name}</span>
          <input defaultValue="0" min="0" name={`share_${member.id}`} step="0.01" type="number" />
        </label>
      ))}
    </div>
  );
}

export default async function ExpensesPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;
  const user = await requireCurrentUser();
  const property = await getPropertyForUser(propertyId, user.id);

  if (!property) {
    notFound();
  }

  const [balances, upcoming] = await Promise.all([
    calculateBalances(property.id),
    getUpcomingOccurrences(property.id),
  ]);

  return (
    <div className="space-y-6">
      <section className="hero-panel space-y-4">
        <p className="eyebrow">Recurring bills and reimbursements</p>
        <h1 className="display-title">Split rent and utilities like a real household.</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Add recurring housing bills with equal, fixed, or percentage splits. Use
          one-off expenses for supplies, repairs, or shared purchases.
        </p>
      </section>

      <section className="two-column">
        <SectionCard title="Add recurring bill" description="Templates auto-generate monthly occurrences for the dashboard.">
          <form action={saveRecurringBill} className="space-y-4">
            <input name="propertyId" type="hidden" value={property.id} />
            <div className="inline-form-grid">
              <label className="field"><span>Name</span><input name="name" placeholder="Rent" required /></label>
              <label className="field"><span>Category</span><input name="category" placeholder="Housing" required /></label>
              <label className="field"><span>Amount</span><input name="amount" step="0.01" type="number" required /></label>
              <label className="field"><span>Due day</span><input defaultValue="1" max="28" min="1" name="dueDay" type="number" required /></label>
            </div>
            <label className="field">
              <span>Split method</span>
              <select name="splitMethod">
                <option value="EQUAL">Equal split</option>
                <option value="FIXED">Fixed amounts</option>
                <option value="PERCENTAGE">Percentage split</option>
              </select>
            </label>
            <ShareInputs members={property.members.map((member) => ({ id: member.id, name: member.name }))} />
            <button className="button-primary" type="submit">Save recurring bill</button>
          </form>
        </SectionCard>

        <SectionCard title="Add one-off expense" description="Track who paid and how the cost should be shared.">
          <form action={saveExpense} className="space-y-4">
            <input name="propertyId" type="hidden" value={property.id} />
            <div className="inline-form-grid">
              <label className="field"><span>Description</span><input name="description" placeholder="Cleaning supplies" required /></label>
              <label className="field"><span>Category</span><input name="category" placeholder="Household" required /></label>
              <label className="field"><span>Amount</span><input name="amount" step="0.01" type="number" required /></label>
              <label className="field"><span>Date</span><input name="incurredAt" type="date" /></label>
            </div>
            <label className="field">
              <span>Paid by</span>
              <select name="paidByMemberId">
                <option value="">No payer recorded</option>
                {property.members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Split method</span>
              <select name="splitMethod">
                <option value="EQUAL">Equal split</option>
                <option value="FIXED">Fixed amounts</option>
                <option value="PERCENTAGE">Percentage split</option>
              </select>
            </label>
            <ShareInputs members={property.members.map((member) => ({ id: member.id, name: member.name }))} />
            <label className="field"><span>Note</span><textarea name="note" /></label>
            <button className="button-primary" type="submit">Save expense</button>
          </form>
        </SectionCard>
      </section>

      <section className="two-column">
        <SectionCard title="Current balances" description="This combines this month’s recurring obligations with logged household expenses.">
          <ul className="list-clean">
            {balances.map((entry) => (
              <li key={entry.memberId} className="flex items-center justify-between rounded-[18px] bg-white/70 p-4">
                <div>
                  <p className="font-semibold text-slate-950">{entry.name}</p>
                  <p className="text-sm text-slate-600">
                    Owes {currency(entry.owes)} • Paid {currency(entry.paid)}
                  </p>
                </div>
                <Pill tone={entry.net >= 0 ? "success" : "warning"}>{currency(entry.net)}</Pill>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Upcoming charges" description="Generated from active recurring bill templates.">
          <ul className="list-clean">
            {upcoming.map((occurrence) => (
              <li className="rounded-[18px] bg-white/70 p-4" key={occurrence.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{occurrence.recurringBill.name}</p>
                    <p className="text-sm text-slate-600">
                      {occurrence.recurringBill.category} • Due {shortDate(occurrence.dueDate)}
                    </p>
                  </div>
                  <Pill>{currency(occurrence.totalAmount)}</Pill>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <SectionCard title="Prorated roommate transition calculator" description="Useful when someone moves in or out mid-month.">
        <ProratedCalculator rent={property.monthlyRent} />
      </SectionCard>
    </div>
  );
}

function ProratedCalculator({ rent }: { rent: number }) {
  const monthDays = 30;
  const perDay = rent / monthDays;

  return (
    <div className="three-column">
      <div className="rounded-[18px] bg-white/70 p-5">
        <p className="font-semibold text-slate-950">Monthly rent baseline</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{currency(rent)}</p>
        <p className="mt-2 text-sm text-slate-600">Example daily rate: {currency(perDay)} using a 30-day baseline.</p>
      </div>
      <div className="rounded-[18px] bg-white/70 p-5">
        <p className="font-semibold text-slate-950">15-day occupancy</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{currency(perDay * 15)}</p>
        <p className="mt-2 text-sm text-slate-600">Good midpoint reference for a mid-month move.</p>
      </div>
      <div className="rounded-[18px] bg-white/70 p-5">
        <p className="font-semibold text-slate-950">7-day occupancy</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{currency(perDay * 7)}</p>
        <p className="mt-2 text-sm text-slate-600">Useful for short overlap or handoff periods.</p>
      </div>
    </div>
  );
}
