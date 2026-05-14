import { notFound } from "next/navigation";
import { saveExpense, saveRecurringBill } from "@/app/actions/app-actions";
import { ProratedCalculator } from "@/components/prorated-calculator";
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

      <section className="two-column">
        <SectionCard title="Active recurring bills" description="Use these templates for rent, utilities, and any custom recurring household cost.">
          <ul className="list-clean">
            {property.recurringBills.map((bill) => (
              <li className="rounded-[18px] bg-white/70 p-4" key={bill.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{bill.name}</p>
                    <p className="text-sm text-slate-600">
                      {bill.category} • Due day {bill.dueDay} • {bill.splitMethod.toLowerCase()} split
                    </p>
                  </div>
                  <Pill>{currency(bill.amount)}</Pill>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Recent household expenses" description="One-off reimbursements and shared purchases stay visible here for quick review.">
          <ul className="list-clean">
            {property.expenses.map((expense) => (
              <li className="rounded-[18px] bg-white/70 p-4" key={expense.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{expense.description}</p>
                    <p className="text-sm text-slate-600">
                      {expense.category} • {shortDate(expense.incurredAt)}
                    </p>
                    {expense.note ? <p className="mt-2 text-sm text-slate-600">{expense.note}</p> : null}
                  </div>
                  <Pill>{currency(expense.amount)}</Pill>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>

      <SectionCard title="Prorated roommate transition calculator" description="Useful when someone moves in or out mid-month.">
        <ProratedCalculator
          defaultRent={property.monthlyRent}
          title="Calculate a mid-month handoff"
          description="Use this to split rent and utilities by occupied days when a roommate moves in or out during the billing cycle."
        />
      </SectionCard>
    </div>
  );
}
