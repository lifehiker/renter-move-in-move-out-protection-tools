import Link from "next/link";
import { Footer, PublicHeader, SectionCard } from "@/components/ui-shell";
import { blogPosts } from "@/lib/content";

export default function BlogIndexPage() {
  return (
    <>
      <PublicHeader />
      <main className="page-shell space-y-6">
        <section className="hero-panel space-y-4">
          <p className="eyebrow">Blog</p>
          <h1 className="display-title">Guides for renters, roommates, and deposit protection.</h1>
        </section>
        <div className="three-column">
          {blogPosts.map((post) => (
            <SectionCard key={post.slug} title={post.title} description={post.description}>
              <p className="text-sm leading-7 text-slate-700">{post.content[0]}</p>
              <Link href={`/blog/${post.slug}`} className="button-secondary mt-4">
                Read article
              </Link>
            </SectionCard>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
