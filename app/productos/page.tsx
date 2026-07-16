import type { Metadata } from "next";
import ProductosClient from "@/components/productos/ProductosClient";
import type { ProductoListResponse } from "@/types/producto";

const backendUrl = (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Ropa para mujer",
  description: "Compra conjuntos, vestidos y prendas KIMENTS en colores y tallas disponibles. Envios a todo el Peru.",
  alternates: { canonical: "/productos" },
  openGraph: {
    title: "Ropa para mujer | KIMENTS",
    description: "Descubre la coleccion oficial KIMENTS y compra online en Peru.",
    url: "/productos",
  },
};

async function getInitialProducts(): Promise<ProductoListResponse | null> {
  try {
    const response = await fetch(
      `${backendUrl}/api/public/ecommerce/productos?page=0&size=10`,
      { next: { revalidate: 300, tags: ["ecommerce:productos"] } },
    );
    return response.ok ? (response.json() as Promise<ProductoListResponse>) : null;
  } catch {
    return null;
  }
}

export default async function ProductosPage() {
  return <ProductosClient initialData={await getInitialProducts()} />;
}
