import { completeOnboarding } from "@/app/actions/app-actions";
import { SectionCard } from "@/components/ui-shell";

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <section className="hero-panel space-y-4">
        <p className="eyebrow">First run</p>
        <h1 className="display-title">Set up the household before move-in day gets messy.</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Add the property basics, household size, and your first priority. The
          app uses that to create a starting workspace with roommate placeholders
          and a renter-focused checklist.
        </p>
      </section>

      <SectionCard title="Create your first property" description="This establishes the workspace used by the dashboard, bills, checklist, and reports.">
        <form action={completeOnboarding} className="space-y-4">
          <div className="inline-form-grid">
            <label className="field">
              <span>Address</span>
              <input name="address" placeholder="123 Cedar Ave" required />
            </label>
            <label className="field">
              <span>City</span>
              <input name="city" placeholder="Chicago" />
            </label>
            <label className="field">
              <span>State</span>
              <input name="state" placeholder="IL" />
            </label>
            <label className="field">
              <span>Postal code</span>
              <input name="postalCode" placeholder="60614" />
            </label>
            <label className="field">
              <span>Lease start</span>
              <input name="leaseStart" type="date" required />
            </label>
            <label className="field">
              <span>Lease end</span>
              <input name="leaseEnd" type="date" />
            </label>
            <label className="field">
              <span>Move-in date</span>
              <input name="moveInDate" type="date" />
            </label>
            <label className="field">
              <span>Roommates</span>
              <input defaultValue="2" min="1" name="roommateCount" type="number" />
            </label>
            <label className="field">
              <span>Monthly rent</span>
              <input defaultValue="2400" min="0" name="monthlyRent" step="0.01" type="number" />
            </label>
            <label className="field">
              <span>Security deposit</span>
              <input defaultValue="2400" min="0" name="securityDepositAmount" step="0.01" type="number" />
            </label>
          </div>
          <label className="field">
            <span>What do you want to do first?</span>
            <select defaultValue="Protect my deposit" name="firstGoal">
              <option>Protect my deposit</option>
              <option>Track shared bills</option>
            </select>
          </label>
          <button className="button-primary" type="submit">
            Create workspace
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
