import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
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

export const metadata: Metadata = {
  title: "KIMENTS",
  description: "Tienda de ropa KIMENTS",
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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
