import type { Metadata } from "next";
import BuscarClient from "@/components/buscar/BuscarClient";

export const metadata: Metadata = {
  title: "Buscar productos",
  description: "Busca prendas, modelos y colores disponibles en KIMENTS.",
  robots: { index: false, follow: true },
};

export default function BuscarPage() {
  return <BuscarClient />;
}
