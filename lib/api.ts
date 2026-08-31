import type {
  ProductoListParams,
  ProductoListResponse,
  ProductoGlobalListResponse,
  ProductoDetalleResponse,
  ProductoColorStockResponse,
  VarianteProducto,
  CarritoValidarRequest,
  CarritoValidarResponse,
  EcommerceInicioResponse,
  EcommercePromocionesResponse,
  EcommerceContactoResponse,
} from "@/types/producto";

const API_BASE_PATH = "/api/public";
const DEFAULT_PRODUCT_PRICE_MAX = 2000;
const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.replace(/\/+$/, "") ?? "";

function stripStoragePrefix(pathname: string): string {
  return pathname.replace(/^\/storage(?=\/|$)/, "");
}

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
  const url = `${API_BASE_PATH}${endpoint}`;

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
  if (params.tallas?.length) sp.set("tallas", params.tallas.toSorted().join(","));
  if (params.precioMax !== undefined && params.precioMax < DEFAULT_PRODUCT_PRICE_MAX) {
    sp.set("precioMax", String(params.precioMax));
  }
  if (params.soloDisponibles !== undefined) sp.set("soloDisponibles", String(params.soloDisponibles));
  return sp.toString();
}

export async function fetchProductos(
  params: ProductoListParams = {},
): Promise<ProductoListResponse> {
  const qs = buildSearchParams(params);
  const endpoint = `/ecommerce/productos${qs ? `?${qs}` : ""}`;
  return apiFetch<ProductoListResponse>(endpoint);
}

export async function fetchProductosGlobales(
  params: ProductoListParams = {},
): Promise<ProductoGlobalListResponse> {
  const qs = buildSearchParams(params);
  const endpoint = `/ecommerce/productos-globales${qs ? `?${qs}` : ""}`;
  return apiFetch<ProductoGlobalListResponse>(endpoint);
}

export async function fetchProductoBySlug(
  slug: string,
): Promise<ProductoDetalleResponse> {
  return apiFetch<ProductoDetalleResponse>(
    `/ecommerce/productos/${encodeURIComponent(slug)}`,
  );
}

export async function fetchProductoColorStock(
  slug: string,
  idColor: number,
  options: { fresh?: boolean } = {},
): Promise<ProductoColorStockResponse> {
  const qs = options.fresh ? "?fresh=true" : "";
  return apiFetch<ProductoColorStockResponse>(
    `/ecommerce/productos/${encodeURIComponent(slug)}/colores/${idColor}/stock${qs}`,
  );
}

export async function fetchProductoVarianteStock(
  slug: string,
  idProductoVariante: number,
  options: { fresh?: boolean } = {},
): Promise<VarianteProducto> {
  const qs = options.fresh ? "?fresh=true" : "";
  return apiFetch<VarianteProducto>(
    `/ecommerce/productos/${encodeURIComponent(slug)}/variantes/${idProductoVariante}/stock${qs}`,
  );
}

export async function fetchInicio(): Promise<EcommerceInicioResponse> {
  return apiFetch<EcommerceInicioResponse>("/ecommerce/inicio");
}

export async function fetchEcommerceContacto(): Promise<EcommerceContactoResponse> {
  return apiFetch<EcommerceContactoResponse>("/ecommerce/contacto");
}

export async function fetchPromociones(
  params: { page?: number; size?: number } = {},
): Promise<EcommercePromocionesResponse> {
  const sp = new URLSearchParams();
  if (params.page !== undefined) sp.set("page", String(params.page));
  if (params.size !== undefined) sp.set("size", String(params.size));
  const qs = sp.toString();
  return apiFetch<EcommercePromocionesResponse>(`/ecommerce/promociones${qs ? `?${qs}` : ""}`);
}

export async function validateEcommerceCart(
  payload: CarritoValidarRequest,
): Promise<CarritoValidarResponse> {
  return apiFetch<CarritoValidarResponse>("/ecommerce/carrito/validar", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export interface EcommercePedidoCreateRequest {
  cliente: {
    dni?: string;
    nombres: string;
    apellidos: string;
    correo: string;
    telefono: string;
    deseaFactura: boolean;
    ruc?: string;
  };
  envio: {
    tipo: "DELIVERY" | "PICKUP";
    direccion?: string;
    referencia?: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
    tarifa?: string;
  };
  metodoPago: "YAPE" | "BCP";
  items: Array<{ idProductoVariante: number; cantidad: number }>;
  promocionesEsperadas?: number[];
  turnstileToken?: string;
}

export interface EcommercePedidoResponse {
  codigo: string;
  estado: "ESPERANDO_COMPROBANTE" | "PAGO_EN_REVISION" | "CANCELADO_POR_TIEMPO" | "CANCELADO" | "ACEPTADO";
  reservaExpiraAt: string;
  subtotal?: number;
  descuentoPromocion?: number;
  promocionResumen?: string | null;
  total: number;
  metodoPago?: string | null;
  comprobanteUrl: string | null;
  comprobanteToken?: string | null;
  detalles?: EcommercePedidoDetalle[];
}

export interface EcommercePedidoDetalle {
  idProductoVariante: number | null;
  nombreProducto: string;
  colorNombre: string;
  tallaNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  imagenUrl: string | null;
}

export async function createEcommercePedido(
  payload: EcommercePedidoCreateRequest,
): Promise<EcommercePedidoResponse> {
  return apiFetch<EcommercePedidoResponse>("/ecommerce/pedidos", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadEcommerceComprobante(
  token: string,
  file: File,
): Promise<EcommercePedidoResponse> {
  const formData = new FormData();
  formData.set("file", file);

  const res = await fetch(`${API_BASE_PATH}/ecommerce/pedidos/comprobante?token=${encodeURIComponent(token)}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let body: { message?: string; code?: string } | undefined;
    try {
      body = await res.json();
    } catch {
      // no body
    }
    throw new ApiError(body?.message ?? `Error del servidor (${res.status})`, res.status, body?.code);
  }

  return res.json() as Promise<EcommercePedidoResponse>;
}

export async function fetchEcommercePedidoActual(token: string): Promise<EcommercePedidoResponse> {
  return apiFetch<EcommercePedidoResponse>(
    `/ecommerce/pedidos/actual?token=${encodeURIComponent(token)}`,
  );
}


export function buildImageUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  const parsed = relativePath.startsWith("http") ? new URL(relativePath) : null;
  const path = parsed ? `${parsed.pathname}${parsed.search}` : relativePath;
  const [pathname, query = ""] = path.split("?", 2);
  const mediaPath = `${stripStoragePrefix(pathname.startsWith("/") ? pathname : `/${pathname}`)}${query ? `?${query}` : ""}`;
  return MEDIA_BASE_URL ? `${MEDIA_BASE_URL}${mediaPath}` : mediaPath;
}

export { ApiError };
