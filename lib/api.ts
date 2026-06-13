import type { ProductoListParams, ProductoListResponse, ProductoDetalleResponse } from "@/types/producto";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const IMAGES_BASE_URL = process.env.NEXT_PUBLIC_IMAGES_BASE_URL ?? "";

class ApiError extends Error {
  status: number;
  code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function apiFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor", 0);
  }

  if (!res.ok) {
    let body: { message?: string; code?: string } | undefined;
    try {
      body = await res.json();
    } catch {
      // no body
    }
    throw new ApiError(
      body?.message ?? `Error del servidor (${res.status})`,
      res.status,
      body?.code,
    );
  }

  return res.json() as Promise<T>;
}

function buildSearchParams(params: ProductoListParams): string {
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.set("page", String(params.page));
  if (params.size !== undefined) sp.set("size", String(params.size));
  if (params.q) sp.set("q", params.q);
  if (params.idCategoria !== undefined) sp.set("idCategoria", String(params.idCategoria));
  if (params.soloDisponibles !== undefined) sp.set("soloDisponibles", String(params.soloDisponibles));
  return sp.toString();
}

export async function fetchProductos(
  params: ProductoListParams = {},
): Promise<ProductoListResponse> {
  const qs = buildSearchParams(params);
  const endpoint = `/api/public/ecommerce/productos${qs ? `?${qs}` : ""}`;
  return apiFetch<ProductoListResponse>(endpoint);
}

export async function fetchProductoBySlug(
  slug: string,
): Promise<ProductoDetalleResponse> {
  return apiFetch<ProductoDetalleResponse>(
    `/api/public/ecommerce/productos/${encodeURIComponent(slug)}`,
  );
}


export function buildImageUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  if (relativePath.startsWith("http")) return relativePath;
  return `${IMAGES_BASE_URL}${relativePath}`;
}

export { ApiError };
