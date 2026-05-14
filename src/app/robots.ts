import type { MetadataRoute } from "next";
import { appEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = appEnv.appUrl;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
