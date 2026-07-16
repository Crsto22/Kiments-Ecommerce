import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductoDetalleClient from "@/components/productos/ProductoDetalleClient";
import { buildImageUrl } from "@/lib/api";
import type { ProductoDetalleResponse } from "@/types/producto";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiments.com.pe").replace(/\/+$/, "");
const backendUrl = (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string): Promise<ProductoDetalleResponse | null> {
  try {
    const response = await fetch(
      `${backendUrl}/api/public/ecommerce/productos/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300, tags: ["ecommerce:detalle"] } },
    );
    return response.ok ? (response.json() as Promise<ProductoDetalleResponse>) : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: "Producto no encontrado", robots: { index: false } };

  const name = data.producto.nombre;
  const description = (data.producto.descripcion || `${name} de KIMENTS disponible online en Peru.`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 155);
  const image = buildImageUrl(
    data.producto.imagenGlobalUrl ?? data.colores[0]?.imagenPrincipal?.url,
  );
  const canonical = `/productos/${slug}`;

  return {
    title: name,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${name} | KIMENTS`,
      description,
      url: canonical,
      type: "website",
      images: image ? [{ url: image, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | KIMENTS`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductoDetallePage({ params }: Props) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  const variants = data.colores.flatMap((color) => color.variantes);
  const prices = variants.map((variant) => variant.precioVigente);
  const images: string[] = [];
  for (const color of data.colores) {
    for (const image of color.imagenes) {
      const url = buildImageUrl(image.url);
      if (url) images.push(url);
    }
  }
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.producto.nombre,
    description: data.producto.descripcion,
    image: images,
    category: data.producto.categoria.nombre,
    brand: { "@type": "Brand", name: "KIMENTS" },
    offers: {
      "@type": "AggregateOffer",
      url: `${siteUrl}/productos/${slug}`,
      priceCurrency: "PEN",
      lowPrice: prices.length ? Math.min(...prices) : 0,
      highPrice: prices.length ? Math.max(...prices) : 0,
      offerCount: variants.length,
      availability: variants.some((variant) => variant.disponible)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense fallback={null}>
        <ProductoDetalleClient initialData={data} />
      </Suspense>
    </>
  );
}
