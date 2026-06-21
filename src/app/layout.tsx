import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";

import { SiteHeader } from "@/components/layout/site-header";
import { SITE_NAME } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";

import { Analytics } from "@vercel/analytics/next"

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `Analýza realitního trhu | ${SITE_NAME}`,
    template: `%s | ${SITE_NAME}`,
  },
  applicationName: SITE_NAME,
  description:
    "Realitní analytika, tržní statistiky a vývoj cen nemovitostí v Česku.",
  keywords: [
    "ceny nemovitostí",
    "realitní data",
    "analýza realitního trhu",
    "vývoj cen bytů",
    "vývoj cen domů",
    "cena za m2",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "real estate analytics",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col pt-17">
        <NextTopLoader
          color="var(--primary-500)"
          height={2}
          showSpinner={false}
          shadow={false}
        />
        <SiteHeader />
        <main className="min-h-[calc(100vh-72.8px)] bg-background">
          {children}
        </main>
        <Analytics/>
      </body>
    </html>
  );
}
