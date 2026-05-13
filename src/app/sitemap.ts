import type { MetadataRoute } from "next";
import { blogPosts, landingPages } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const staticPages = [
    "",
    "/pricing",
    "/sign-in",
    "/prorated-rent-calculator",
    "/privacy",
    "/terms",
    "/disclaimer",
    "/blog",
  ];

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })),
    ...landingPages.map((page) => ({
      url: `${base}/${page.slug}`,
      lastModified: new Date(),
    })),
    ...blogPosts.map((post) => ({
      url: `${base}/blog/${post.slug}`,
      lastModified: new Date(),
    })),
  ];
}
