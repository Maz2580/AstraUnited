import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/src/components/SiteFooter";
import { SiteHeader } from "@/src/components/SiteHeader";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Astra United FC | Football Academy in Melbourne's North",
    template: "%s | Astra United FC"
  },
  description:
    "Astra United FC is a Melbourne football club and youth academy based at Darebin International Sports Centre, developing players through professional coaching and community values.",
  openGraph: {
    title: "Astra United FC",
    description:
      "Professional youth academy, senior football pathways, and community-first football in Melbourne's north.",
    url: "/",
    siteName: "Astra United FC",
    images: [
      {
        url: "/images/astra-logo.png",
        width: 1200,
        height: 1200,
        alt: "Astra United Football Club crest"
      }
    ],
    locale: "en_AU",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-astra-gold focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-astra-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
