import Link from "next/link";
import { notFound } from "next/navigation";
import { addRoommate, sendInviteFallback, updatePropertyDetails } from "@/app/actions/app-actions";
import { SectionCard, Pill } from "@/components/ui-shell";
import { getPropertyForUser } from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/session";
import { shortDate } from "@/lib/utils";

export default async function PropertyPage({
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

  return (
    <div className="space-y-6">
      <section className="hero-panel space-y-4">
        <p className="eyebrow">Property workspace</p>
        <h1 className="display-title">{property.address}</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Update the lease details, keep roommate placeholders organized, and jump
          into bills, checklist work, or reports from here.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link className="button-primary" href={`/properties/${property.id}/checklist`}>
            Open checklist
          </Link>
          <Link className="button-secondary" href={`/properties/${property.id}/reports`}>
            Manage reports
          </Link>
        </div>
      </section>

      <section className="two-column">
        <SectionCard title="Property details" description="These values appear in reports and the dashboard.">
          <form action={updatePropertyDetails} className="space-y-4">
            <input name="propertyId" type="hidden" value={property.id} />
            <div className="inline-form-grid">
              <label className="field"><span>Address</span><input defaultValue={property.address} name="address" required /></label>
              <label className="field"><span>City</span><input defaultValue={property.city ?? ""} name="city" /></label>
              <label className="field"><span>State</span><input defaultValue={property.state ?? ""} name="state" /></label>
              <label className="field"><span>Postal code</span><input defaultValue={property.postalCode ?? ""} name="postalCode" /></label>
              <label className="field"><span>Lease start</span><input defaultValue={property.leaseStart.toISOString().slice(0, 10)} name="leaseStart" type="date" /></label>
              <label className="field"><span>Lease end</span><input defaultValue={property.leaseEnd?.toISOString().slice(0, 10) ?? ""} name="leaseEnd" type="date" /></label>
              <label className="field"><span>Move-in date</span><input defaultValue={property.moveInDate?.toISOString().slice(0, 10) ?? ""} name="moveInDate" type="date" /></label>
              <label className="field"><span>Monthly rent</span><input defaultValue={property.monthlyRent} name="monthlyRent" step="0.01" type="number" /></label>
              <label className="field"><span>Security deposit</span><input defaultValue={property.securityDepositAmount} name="securityDepositAmount" step="0.01" type="number" /></label>
            </div>
            <label className="field">
              <span>Notes</span>
              <textarea defaultValue={property.notes ?? ""} name="notes" />
            </label>
            <button className="button-primary" type="submit">Save property details</button>
          </form>
        </SectionCard>

        <SectionCard title="Roommates" description="Use placeholders if people are not ready to sign up yet.">
          <ul className="list-clean">
            {property.members.map((member) => (
              <li key={member.id} className="rounded-[18px] bg-white/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{member.name}</p>
                    <p className="text-sm text-slate-600">
                      {member.email || "No email yet"} • Joined {shortDate(member.joinedAt)}
                    </p>
                  </div>
                  <Pill tone={member.isPlaceholder ? "warning" : "success"}>
                    {member.isPlaceholder ? "Placeholder" : "Signed in"}
                  </Pill>
                </div>
              </li>
            ))}
          </ul>
          <form action={addRoommate} className="mt-5 space-y-3">
            <input name="propertyId" type="hidden" value={property.id} />
            <label className="field"><span>Name</span><input name="name" placeholder="Jordan" required /></label>
            <label className="field"><span>Email</span><input name="email" placeholder="jordan@example.com" type="email" /></label>
            <label className="field"><span>Joined at</span><input name="joinedAt" type="date" /></label>
            <button className="button-primary" type="submit">Add roommate</button>
          </form>
          <form action={sendInviteFallback} className="mt-5 space-y-3">
            <input name="propertyId" type="hidden" value={property.id} />
            <label className="field"><span>Invite name</span><input name="name" placeholder="Taylor" /></label>
            <label className="field"><span>Invite email</span><input name="email" placeholder="taylor@example.com" type="email" /></label>
            <button className="button-secondary" type="submit">Create placeholder invite</button>
          </form>
        </SectionCard>
      </section>
    </div>
  );
}
