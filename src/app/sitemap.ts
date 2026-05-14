import type { MetadataRoute } from "next";
import { blogPosts, landingPages } from "@/lib/content";
import { appEnv } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appEnv.appUrl;
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
