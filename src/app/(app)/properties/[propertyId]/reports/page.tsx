import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicShareLink, createReport, emailReport } from "@/app/actions/app-actions";
import { SectionCard, Pill } from "@/components/ui-shell";
import { getPropertyForUser } from "@/lib/app-data";
import { requireCurrentUser } from "@/lib/session";
import { absoluteUrl, shortDate } from "@/lib/utils";

export default async function ReportsPage({
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
        <p className="eyebrow">Reports</p>
        <h1 className="display-title">Export a report that looks intentional, not improvised.</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Generate a move-in or move-out report with room statuses, issue notes,
          supporting photos, and a declaration section for the tenant names.
        </p>
      </section>

      <SectionCard title="Create report" description="Free tier exports are watermarked after the first report.">
        <div className="flex flex-wrap gap-3">
          <form action={createReport}>
            <input name="propertyId" type="hidden" value={property.id} />
            <input name="type" type="hidden" value="MOVE_IN" />
            <button className="button-primary" type="submit">Generate move-in report</button>
          </form>
          <form action={createReport}>
            <input name="propertyId" type="hidden" value={property.id} />
            <input name="type" type="hidden" value="MOVE_OUT" />
            <button className="button-secondary" type="submit">Generate move-out report</button>
          </form>
        </div>
      </SectionCard>

      <SectionCard title="Report history" description="Download the PDF, create a read-only share link, or attempt email delivery.">
        <ul className="list-clean">
          {property.reports.map((report) => (
            <li className="rounded-[20px] bg-white/70 p-5" key={report.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">{report.title}</p>
                  <p className="text-sm text-slate-600">
                    {report.type === "MOVE_IN" ? "Move-in" : "Move-out"} • Created {shortDate(report.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Pill tone={report.isWatermarked ? "warning" : "success"}>
                    {report.isWatermarked ? "Watermarked" : "Clean export"}
                  </Pill>
                  {report.emailDeliveredAt ? <Pill tone="success">Emailed</Pill> : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link className="button-primary" href={`/api/reports/${report.id}/pdf`}>
                  Download PDF
                </Link>
                <form action={createPublicShareLink}>
                  <input name="propertyId" type="hidden" value={property.id} />
                  <input name="reportId" type="hidden" value={report.id} />
                  <button className="button-secondary" type="submit">Create share link</button>
                </form>
                <form action={emailReport}>
                  <input name="propertyId" type="hidden" value={property.id} />
                  <input name="reportId" type="hidden" value={report.id} />
                  <button className="button-secondary" type="submit">Email report</button>
                </form>
              </div>
              {report.shareToken ? (
                <p className="mt-3 break-all text-sm text-slate-600">
                  Share link: {absoluteUrl(`/shared/${report.shareToken}`)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
