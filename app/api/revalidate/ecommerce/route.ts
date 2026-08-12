import { revalidateTag } from "next/cache";
import { type NextRequest } from "next/server";

const CACHE_TAGS = [
  "ecommerce:inicio",
  "ecommerce:productos",
  "ecommerce:promociones",
  "ecommerce:contacto",
  "ecommerce:detalle",
  "ecommerce:stock",
] as const;

export async function POST(request: NextRequest): Promise<Response> {
  const secret = process.env.ECOMMERCE_REVALIDATE_SECRET;
  const received = request.headers.get("x-revalidate-secret");

  if (!secret || received !== secret) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  for (const tag of CACHE_TAGS) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: true, tags: CACHE_TAGS });
}
