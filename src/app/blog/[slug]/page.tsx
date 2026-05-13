import { notFound } from "next/navigation";
import { Footer, PublicHeader, SectionCard } from "@/components/ui-shell";
import { blogPosts } from "@/lib/content";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((entry) => entry.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <PublicHeader />
      <main className="page-shell space-y-6">
        <section className="hero-panel space-y-4">
          <p className="eyebrow">Blog article</p>
          <h1 className="display-title">{post.title}</h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-700">{post.description}</p>
        </section>
        <SectionCard title="Article">
          {post.content.map((paragraph) => (
            <p className="text-base leading-8 text-slate-700" key={paragraph}>{paragraph}</p>
          ))}
        </SectionCard>
      </main>
      <Footer />
    </>
  );
}
