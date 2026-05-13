import { Footer, PublicHeader, SectionCard } from "@/components/ui-shell";

export default function DisclaimerPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell">
        <SectionCard title="Legal disclaimer" description="This product helps renters organize information.">
          <p className="text-base leading-8 text-slate-700">
            The app is not legal advice and does not guarantee any deposit outcome.
            It helps tenants create more structured documentation, but local rental
            law and dispute procedures still vary by jurisdiction.
          </p>
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
