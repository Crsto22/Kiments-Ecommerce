import { type NextRequest } from "next/server";

const SPRING_BOOT_BASE_URL =
  (process.env.SPRING_BOOT_BASE_URL ?? "http://localhost:8080").replace(/\/+$/, "");

function buildUpstreamUrl(request: NextRequest, path: string[] | undefined): string {
  const pathname = path?.join("/") ?? "";
  return `${SPRING_BOOT_BASE_URL}/${pathname}${request.nextUrl.search}`;
}

async function proxyMedia(
  request: NextRequest,
  path: string[] | undefined,
  method: "GET" | "HEAD",
): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await fetch(buildUpstreamUrl(request, path), {
      method,
      headers: {
        accept: request.headers.get("accept") ?? "*/*",
      },
    });
  } catch {
    return new Response(null, { status: 502 });
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
  return proxyMedia(request, path, "GET");
}

export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
): Promise<Response> {
  const { path } = await context.params;
  return proxyMedia(request, path, "HEAD");
}
