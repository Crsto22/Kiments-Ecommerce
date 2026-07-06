import { type NextRequest } from "next/server";

const SPRING_BOOT_BASE_URL =
  (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

const CACHE_TTL = {
  inicio: 300,
  productos: 300,
  productoDetalle: 300,
  stock: 10,
  busqueda: 60,
} as const;

const CACHE_TAGS = {
  inicio: "ecommerce:inicio",
  productos: "ecommerce:productos",
  detalle: "ecommerce:detalle",
  stock: "ecommerce:stock",
} as const;

function buildUpstreamUrl(request: NextRequest, path: string[] | undefined): string {
  const pathname = path?.join("/") ?? "";
  return `${SPRING_BOOT_BASE_URL}/api/public/${pathname}${request.nextUrl.search}`;
}

function resolveCachePolicy(
  request: NextRequest,
  path: string[] | undefined,
): { ttl: number; tags: string[] } | null {
  const pathname = path?.join("/") ?? "";
  if (pathname.startsWith("ecommerce/pedidos")) return null;
  if (pathname === "ecommerce/inicio") {
    return { ttl: CACHE_TTL.inicio, tags: [CACHE_TAGS.inicio] };
  }
  if (pathname === "ecommerce/productos") {
    return {
      ttl: request.nextUrl.searchParams.has("q") ? CACHE_TTL.busqueda : CACHE_TTL.productos,
      tags: [CACHE_TAGS.productos],
    };
  }
  if (
    /^ecommerce\/productos\/[^/]+\/colores\/[^/]+\/stock$/.test(pathname)
    || /^ecommerce\/productos\/[^/]+\/variantes\/[^/]+\/stock$/.test(pathname)
  ) {
    return request.nextUrl.searchParams.get("fresh") === "true"
      ? null
      : { ttl: CACHE_TTL.stock, tags: [CACHE_TAGS.stock] };
  }
  if (pathname.startsWith("ecommerce/productos/")) {
    return { ttl: CACHE_TTL.productoDetalle, tags: [CACHE_TAGS.detalle] };
  }
  return null;
}

function cacheControl(ttl: number | null): string {
  return ttl === null
    ? "no-store"
    : `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`;
}

async function proxyPublic(
  request: NextRequest,
  path: string[] | undefined,
  method: "GET" | "HEAD" | "POST",
): Promise<Response> {
  let upstream: Response;
  const cachePolicy = method === "POST" ? null : resolveCachePolicy(request, path);
  const headers = new Headers();
  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");
  if (accept) headers.set("accept", accept);
  if (contentType) headers.set("content-type", contentType);

  try {
    const init: RequestInit & { duplex?: "half" } = {
      method,
      headers,
      body: method === "POST" ? request.body : undefined,
      duplex: method === "POST" ? "half" : undefined,
      cache: cachePolicy === null ? "no-store" : undefined,
      next: cachePolicy === null
        ? undefined
        : { revalidate: cachePolicy.ttl, tags: cachePolicy.tags },
    };
    upstream = await fetch(buildUpstreamUrl(request, path), init);
  } catch {
    return Response.json(
      { message: "No se pudo conectar con el backend" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set("Cache-Control", cacheControl(cachePolicy?.ttl ?? null));

  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  return proxyPublic(request, path, "GET");
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  return proxyPublic(request, path, "HEAD");
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  return proxyPublic(request, path, "POST");
}
