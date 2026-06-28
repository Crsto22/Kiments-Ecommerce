import { type NextRequest } from "next/server";

const SPRING_BOOT_BASE_URL =
  (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

function buildUpstreamUrl(request: NextRequest, path: string[] | undefined): string {
  const pathname = path?.join("/") ?? "";
  return `${SPRING_BOOT_BASE_URL}/api/public/${pathname}${request.nextUrl.search}`;
}

async function proxyPublic(
  request: NextRequest,
  path: string[] | undefined,
  method: "GET" | "HEAD" | "POST",
): Promise<Response> {
  let upstream: Response;
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
    };
    upstream = await fetch(buildUpstreamUrl(request, path), init);
  } catch {
    return Response.json(
      { message: "No se pudo conectar con el backend" },
      { status: 502 },
    );
  }

  return new Response(method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers,
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
