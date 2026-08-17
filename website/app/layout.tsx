import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { site } from "@/lib/site";
import { LocaleProvider } from "@/lib/i18n";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-oswald",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${site.name} — S&C Coach & Massaggiatore Sportivo`,
  description: `${site.tagline}. ${site.niche}. Schede, programmi personalizzati e massaggio sportivo a ${site.city}.`,
  keywords: [
    "S&C coach",
    "personal trainer",
    "massaggio sportivo",
    "preparazione fisica tennis",
    "preparazione fisica padel",
    "Ficarazzi",
    "Palermo",
  ],
  openGraph: {
    type: "website",
    locale: "it_IT",
    siteName: site.name,
    title: `${site.name} — S&C Coach & Massaggiatore Sportivo`,
    description: `${site.tagline}. ${site.niche}.`,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — S&C Coach & Massaggiatore Sportivo`,
    description: `${site.tagline}. ${site.niche}.`,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  description: `${site.tagline}. ${site.niche}.`,
  image: `${siteUrl}/opengraph-image`,
  url: siteUrl,
  telephone: site.phoneDisplay,
  email: site.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Ficarazzi",
    addressRegion: "PA",
    addressCountry: "IT",
  },
  areaServed: "Palermo e provincia",
  sameAs: [site.instagram, site.instagramProject],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={oswald.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LocaleProvider>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </LocaleProvider>
      </body>
    </html>
  );
}
