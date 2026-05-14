import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/lib/content";
import { appEnv } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(appEnv.appUrl),
  title: {
    default: `${site.name} | Protect your deposit + split bills`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
