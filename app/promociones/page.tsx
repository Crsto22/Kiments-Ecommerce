import type { Metadata } from "next";
import PromocionesClient from "@/components/promociones/PromocionesClient";
import type { EcommercePromocionesResponse } from "@/types/producto";

const backendUrl = (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");
const PAGE_SIZE = 9;

export const metadata: Metadata = {
  title: "Promociones",
  description: "Promociones y ofertas vigentes de ropa KIMENTS disponibles para comprar online en Peru.",
  alternates: { canonical: "/promociones" },
  openGraph: { url: "/promociones" },
};

async function getInitialPromociones(): Promise<EcommercePromocionesResponse | null> {
  try {
    const response = await fetch(
      `${backendUrl}/api/public/ecommerce/promociones?page=0&size=${PAGE_SIZE}`,
      { next: { revalidate: 300, tags: ["ecommerce:promociones"] } },
    );
    return response.ok ? (response.json() as Promise<EcommercePromocionesResponse>) : null;
  } catch {
    return null;
  }
}

export default async function PromocionesPage() {
  return <PromocionesClient initialData={await getInitialPromociones()} />;
}
