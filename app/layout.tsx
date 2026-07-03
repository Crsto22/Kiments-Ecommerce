import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { PageLoader } from "@/components/PageLoader";
import { Navbar } from "@/components/Navbar";
import { CartProvider } from "@/components/CartProvider";
import { PwaRegister } from "@/components/PwaRegister";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiments.pe";
const googleAnalyticsId = "G-07111WXD3V";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "KIMENTS",
  title: {
    default: "KIMENTS | Tienda de ropa",
    template: "%s | KIMENTS",
  },
  description: "Compra ropa KIMENTS online: modelos, colores y tallas disponibles para pedidos en Peru.",
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "KIMENTS | Tienda de ropa",
    description: "Compra ropa KIMENTS online: modelos, colores y tallas disponibles para pedidos en Peru.",
    url: "/",
    siteName: "KIMENTS",
    locale: "es_PE",
    type: "website",
    images: [
      {
        url: "/img/pwa/logo_pwa.png",
        width: 1000,
        height: 1000,
        alt: "KIMENTS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KIMENTS | Tienda de ropa",
    description: "Compra ropa KIMENTS online: modelos, colores y tallas disponibles para pedidos en Peru.",
    images: ["/img/pwa/logo_pwa.png"],
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
          <PageLoader />
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
