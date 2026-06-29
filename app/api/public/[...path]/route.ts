import { type NextRequest } from "next/server";

const SPRING_BOOT_BASE_URL =
  (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

const CACHE_TTL = {
  inicio: 300,
  productos: 120,
  productoDetalle: 60,
  busqueda: 30,
} as const;

function buildUpstreamUrl(request: NextRequest, path: string[] | undefined): string {
  const pathname = path?.join("/") ?? "";
  return `${SPRING_BOOT_BASE_URL}/api/public/${pathname}${request.nextUrl.search}`;
}

function resolveCacheTtl(request: NextRequest, path: string[] | undefined): number | null {
  const pathname = path?.join("/") ?? "";
  if (pathname.startsWith("ecommerce/pedidos")) return null;
  if (pathname === "ecommerce/inicio") return CACHE_TTL.inicio;
  if (pathname === "ecommerce/productos") {
    return request.nextUrl.searchParams.has("q") ? CACHE_TTL.busqueda : CACHE_TTL.productos;
  }
  if (pathname.startsWith("ecommerce/productos/")) return CACHE_TTL.productoDetalle;
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
  const ttl = method === "POST" ? null : resolveCacheTtl(request, path);
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
      cache: ttl === null ? "no-store" : undefined,
      next: ttl === null ? undefined : { revalidate: ttl },
    };
    upstream = await fetch(buildUpstreamUrl(request, path), init);
  } catch {
    return Response.json(
      { message: "No se pudo conectar con el backend" },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.set("Cache-Control", cacheControl(ttl));

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
