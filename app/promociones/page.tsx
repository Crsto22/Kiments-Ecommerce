import type { Metadata } from "next";
import PromocionesClient from "@/components/promociones/PromocionesClient";

export const metadata: Metadata = {
  title: "Promociones",
  description: "Promociones y ofertas vigentes de ropa KIMENTS disponibles para comprar online en Peru.",
  alternates: { canonical: "/promociones" },
  openGraph: { url: "/promociones" },
};

export default function PromocionesPage() {
  return <PromocionesClient />;
}
