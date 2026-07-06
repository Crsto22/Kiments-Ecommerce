import type { MetadataRoute } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://kiments.com.pe").replace(/\/+$/, "");
const backendUrl = process.env.SPRING_BOOT_BASE_URL?.replace(/\/+$/, "");

interface ProductoListResponse {
  content?: Array<{ producto?: { slug?: string; fechaCreacion?: string } }>;
  totalPages?: number;
}

async function fetchProductUrls(): Promise<MetadataRoute.Sitemap> {
  if (!backendUrl) return [];

  const urls = new Map<string, MetadataRoute.Sitemap[number]>();
  for (let page = 0; page < 5; page += 1) {
    try {
      const res = await fetch(
        `${backendUrl}/api/public/ecommerce/productos?page=${page}&size=20&soloDisponibles=false`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) break;
      const data = (await res.json()) as ProductoListResponse;
      for (const item of data.content ?? []) {
        const slug = item.producto?.slug;
        if (!slug) continue;
        urls.set(slug, {
          url: `${siteUrl}/productos/${slug}`,
          lastModified: item.producto?.fechaCreacion ? new Date(item.producto.fechaCreacion) : new Date(),
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
      if (page >= Math.max((data.totalPages ?? 1) - 1, 0)) break;
    } catch {
      break;
    }
  }

  return [...urls.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/productos`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/nosotros`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/preguntas-frecuentes`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/terminos-y-condiciones`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  return [...routes, ...(await fetchProductUrls())];
}
