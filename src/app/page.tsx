import Link from "next/link";
import { Footer, PublicHeader, SectionCard, StatCard } from "@/components/ui-shell";
import { blogPosts, landingPages, site } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell space-y-6">
        <section className="hero-grid">
          <div className="hero-panel space-y-6">
            <p className="eyebrow">Renter-first workspace</p>
            <h1 className="display-title">
              Protect your deposit and keep roommate bills clean.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-700">
              {site.description} Replace camera-roll chaos, scattered notes, and
              generic trip-splitting tools with one focused workflow built for
              shared housing.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-in" className="button-primary">
                Open the app
              </Link>
              <Link href="/prorated-rent-calculator" className="button-secondary">
                Try the prorated calculator
              </Link>
            </div>
          </div>
          <div className="surface-grid">
            <StatCard
              label="Deposit proof"
              value="Room-by-room reports"
              detail="Checklist items, issue notes, photo evidence, and PDF export in one flow."
            />
            <StatCard
              label="Recurring bills"
              value="Equal, fixed, percentage"
              detail="Split rent, utilities, and reimbursements the way a real household actually works."
            />
            <StatCard
              label="Mobile ready"
              value="Move-in walkthroughs"
              detail="Capture photos and update notes from a phone browser without losing structure."
            />
            <StatCard
              label="Shareable"
              value="Read-only links"
              detail="Send landlords or roommates a clean report instead of a loose folder of attachments."
            />
          </div>
        </section>

        <section className="metrics-grid">
          <StatCard label="Free tier" value="1 property" detail="Up to 3 roommates, 5 recurring bills, and 20 photos." />
          <StatCard label="Pro" value="$29.99 / year" detail="Unlimited photos, exports, recurring bills, and read-only share links." />
          <StatCard label="Core use case" value="Move-in to move-out" detail="Track condition evidence across the entire lease lifecycle." />
          <StatCard label="Secondary win" value="Recurring bills" detail="Keep rent and utilities organized without generic expense-app friction." />
        </section>

        <section className="three-column">
          {landingPages.map((page) => (
            <SectionCard key={page.slug} title={page.title} description={page.summary}>
              <p className="text-sm leading-7 text-slate-600">{page.body[0]}</p>
              <Link href={`/${page.slug}`} className="button-secondary mt-4">
                Read more
              </Link>
            </SectionCard>
          ))}
        </section>

        <SectionCard
          title="Useful renter content"
          description="Search-friendly guides that feed directly into the product workflows."
        >
          <div className="three-column">
            {blogPosts.map((post) => (
              <article key={post.slug} className="rounded-[20px] border border-slate-200/70 bg-white/70 p-5">
                <h3 className="text-lg font-semibold text-slate-950">{post.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{post.description}</p>
                <Link href={`/blog/${post.slug}`} className="button-secondary mt-4">
                  Read article
                </Link>
              </article>
            ))}
          </div>
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
