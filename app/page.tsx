import type { Metadata } from "next";
import { HomeClient } from "@/components/home/HomeClient";
import type { EcommerceInicioResponse } from "@/types/producto";

const backendUrl = (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

async function getInitialHome(): Promise<EcommerceInicioResponse | null> {
  try {
    const response = await fetch(
      `${backendUrl}/api/public/ecommerce/inicio`,
      { next: { revalidate: 300, tags: ["ecommerce:inicio"] } },
    );
    return response.ok ? (response.json() as Promise<EcommerceInicioResponse>) : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  return <HomeClient initialData={await getInitialHome()} />;
}
