import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { PageLoader } from "@/components/PageLoader";
import { Navbar } from "@/components/Navbar";
import { CartProvider } from "@/components/CartProvider";
import { CookieNotice } from "@/components/CookieNotice";
import { PwaRegister } from "@/components/PwaRegister";
import { ScrollToTop } from "@/components/ScrollToTop";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const kiments = localFont({
  src: "../public/font/jen-wagner-co-versailles-regular.ttf",
  variable: "--font-kiments",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiments.com.pe";
const googleAnalyticsId = "G-07111WXD3V";

const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "ClothingStore",
  name: "KIMENTS",
  url: siteUrl,
  logo: `${siteUrl}/img/pwa/logo_pwa.png`,
  image: `${siteUrl}/img/pwa/logo_pwa.png`,
  telephone: "+51 933 918 047",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Jr. Huanuco 1705-1707",
    addressLocality: "La Victoria",
    addressRegion: "Lima",
    postalCode: "15018",
    addressCountry: "PE",
  },
  sameAs: [
    "https://www.instagram.com/kiments.pe/",
    "https://www.tiktok.com/@kiments",
    "https://www.facebook.com/kimentsropa",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "KIMENTS",
  title: {
    default: "KIMENTS",
    template: "%s | KIMENTS",
  },
  description: "Tienda oficial KIMENTS. Compra conjuntos sastre para mujer online con envios a todo el Peru.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "KIMENTS",
    description: "Tienda oficial KIMENTS. Compra conjuntos sastre para mujer online con envios a todo el Peru.",
    siteName: "KIMENTS",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: `${siteUrl}/img/pwa/logo_pwa.png`,
        width: 1000,
        height: 1000,
        alt: "KIMENTS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KIMENTS",
    description: "Tienda oficial KIMENTS. Compra conjuntos sastre para mujer online con envios a todo el Peru.",
    images: [`${siteUrl}/img/pwa/logo_pwa.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KIMENTS",
  },
  icons: {
    icon: "/img/pwa/logo_pwa.png",
    apple: "/img/pwa/logo_pwa.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111318",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${poppins.variable} ${kiments.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#111318] text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(storeJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>
        <CartProvider>
          <PwaRegister />
          <ScrollToTop />
          <PageLoader />
          <Navbar />
          {children}
          <Footer />
          <CookieNotice />
        </CartProvider>
      </body>
    </html>
  );
}
