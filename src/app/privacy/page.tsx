import { Footer, PublicHeader, SectionCard } from "@/components/ui-shell";

export default function PrivacyPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell">
        <SectionCard title="Privacy policy" description="Minimal policy copy for beta launch and self-hosted deployments.">
          <p className="text-base leading-8 text-slate-700">
            The app stores the account information, property data, checklist notes,
            shared expense records, uploaded photos, and generated report snapshots
            needed to operate the renter workspace. Production operators should
            replace this beta policy with counsel-reviewed legal language before
            public launch.
          </p>
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
