import { Footer, PublicHeader, SectionCard } from "@/components/ui-shell";
import { landingPages } from "@/lib/content";

const page = landingPages.find((item) => item.slug === "renter-photo-log")!;

export default function RenterPhotoLogPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell space-y-6">
        <section className="hero-panel space-y-4">
          <p className="eyebrow">SEO landing page</p>
          <h1 className="display-title">{page.title}</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">{page.summary}</p>
        </section>
        <SectionCard title="Evidence with context">
          {page.body.map((paragraph) => (
            <p className="text-base leading-8 text-slate-700" key={paragraph}>{paragraph}</p>
          ))}
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
