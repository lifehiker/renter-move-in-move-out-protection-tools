import { Footer, PublicHeader, SectionCard } from "@/components/ui-shell";

export default function TermsPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell">
        <SectionCard title="Terms of use" description="Starter terms for product evaluation and beta access.">
          <p className="text-base leading-8 text-slate-700">
            Use the service lawfully and avoid uploading private information you do
            not have the right to store or share. The service is provided as-is for
            beta use and should be paired with production legal review before a
            public launch.
          </p>
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
