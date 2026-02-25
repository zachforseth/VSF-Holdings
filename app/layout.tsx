import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./tailwind.css";
import { Toaster } from 'sonner';

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vsfcapitalstructuring.com'),
  title: "VSF Capital Structuring",
  description: "High-end investment and capital structuring. Powered by the VSF Clarity Engine™.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "VSF Capital Structuring",
  "image": "https://vsfcapitalstructuring.com/og-image.jpg",
  "@id": "https://vsfcapitalstructuring.com",
  "url": "https://vsfcapitalstructuring.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "West Tower, Bankers Hall",
    "addressLocality": "Calgary",
    "addressRegion": "AB",
    "addressCountry": "CA"
  },
  "department": [
    {
      "@type": "AccountingService",
      "name": "Tax Preparation Service"
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} antialiased min-h-screen flex flex-col`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Global Google Analytics Loader */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T2DHQSSMGN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-T2DHQSSMGN');
          `}
        </Script>

        {/* Global Google Maps Loader - Ensures availability on Public & Portal pages */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`}
          strategy="afterInteractive"
        />

        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
