import Link from "next/link";
import { notFound } from "next/navigation";
import { Pill, SectionCard } from "@/components/ui-shell";
import { prisma } from "@/lib/db";
import { shortDate } from "@/lib/utils";

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const link = await prisma.shareLink.findUnique({
    where: { token },
    include: { report: true, property: true },
  });

  if (!link || link.revokedAt) {
    notFound();
  }

  const snapshot = link.report.snapshot as any;

  return (
    <main className="page-shell space-y-6">
      <section className="hero-panel space-y-4">
        <p className="eyebrow">Shared report</p>
        <h1 className="display-title">{link.report.title}</h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-700">
          Read-only view of the generated renter report for {link.property.address}.
        </p>
        <Link className="button-primary" href={`/api/reports/${link.report.id}/pdf?token=${link.token}`}>
          Download PDF
        </Link>
      </section>
      <SectionCard title="Property snapshot" description={`Generated ${shortDate(link.report.createdAt)}`}>
        <div className="inline-form-grid">
          <div><p className="font-semibold text-slate-950">Address</p><p className="text-sm text-slate-600">{snapshot.property.address}</p></div>
          <div><p className="font-semibold text-slate-950">Lease start</p><p className="text-sm text-slate-600">{shortDate(snapshot.property.leaseStart)}</p></div>
        </div>
      </SectionCard>
      <SectionCard title="Checklist" description="Status snapshot captured when the report was generated.">
        <ul className="list-clean">
          {snapshot.checklist.map((item: any, index: number) => (
            <li className="flex items-center justify-between rounded-[18px] bg-white/70 p-4" key={`${item.area}-${item.label}-${index}`}>
              <div>
                <p className="font-semibold text-slate-950">{item.area} • {item.label}</p>
                {item.note ? <p className="text-sm text-slate-600">{item.note}</p> : null}
              </div>
              <Pill>{item.status}</Pill>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Issue notes" description="Condition notes included in the saved report snapshot.">
        <ul className="list-clean">
          {snapshot.issues.map((issue: any, index: number) => (
            <li className="flex items-center justify-between rounded-[18px] bg-white/70 p-4" key={`${issue.room}-${index}`}>
              <div>
                <p className="font-semibold text-slate-950">{issue.room}</p>
                <p className="text-sm text-slate-600">{issue.body}</p>
              </div>
              <Pill>{issue.severity}</Pill>
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Photo evidence" description="Images captured in the report snapshot with notes and timestamps when available.">
        <div className="three-column">
          {snapshot.photos.map((photo: any, index: number) => (
            <article className="rounded-[18px] bg-white/70 p-4" key={`${photo.room}-${index}`}>
              {photo.dataUrl || photo.publicUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${photo.room} evidence`}
                  className="h-48 w-full rounded-[14px] object-cover"
                  src={photo.dataUrl || photo.publicUrl}
                />
              ) : null}
              <p className="mt-3 font-semibold text-slate-950">{photo.room}</p>
              <p className="text-sm text-slate-600">{photo.note || "No note provided."}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                Uploaded {shortDate(photo.uploadTimestamp)}
              </p>
            </article>
          ))}
        </div>
      </SectionCard>
    </main>
  );
}
