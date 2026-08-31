import type { Metadata } from "next";
import ProductosClient from "@/components/productos/ProductosClient";
import type { ProductoGlobalListResponse } from "@/types/producto";

const backendUrl = (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Conjuntos sastre para mujer",
  description: "Compra conjuntos sastre para mujer KIMENTS en colores y tallas disponibles. Envios a todo el Peru.",
  alternates: { canonical: "/productos" },
  openGraph: {
    title: "Conjuntos sastre para mujer | KIMENTS",
    description: "Descubre conjuntos sastre para mujer KIMENTS y compra online en Peru.",
    url: "/productos",
  },
};

async function getInitialProducts(): Promise<ProductoGlobalListResponse | null> {
  try {
    const response = await fetch(
      `${backendUrl}/api/public/ecommerce/productos-globales?page=0&size=6`,
      { next: { revalidate: 300, tags: ["ecommerce:productos"] } },
    );
    return response.ok ? (response.json() as Promise<ProductoGlobalListResponse>) : null;
  } catch {
    return null;
  }
}

export default async function ProductosPage() {
  return <ProductosClient initialData={await getInitialProducts()} />;
}
