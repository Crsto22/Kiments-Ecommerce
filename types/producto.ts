// Tipos de la API pública del ecommerce
// Basado en GET /api/public/ecommerce/productos

export interface Categoria {
  idCategoria: number;
  nombre: string;
}

export interface Color {
  idColor: number;
  nombre: string;
  hex: string;
}

export interface ImagenProducto {
  idColorImagen: number | null;
  url: string | null;
  urlThumb: string | null;
  orden: number | null;
  esPrincipal: boolean;
  estado: string;
  origen: "COLOR" | "GLOBAL";
}

export interface Talla {
  idTalla: number;
  nombre: string;
}

export interface VarianteProducto {
  idProductoVariante: number;
  sku: string;
  codigoBarras: string | null;
  talla: Talla;
  precioRegular: number;
  precioMayor: number;
  precioOfertaAplicada: number | null;
  precioVigente: number;
  tipoOfertaAplicada: "SUCURSAL" | "GLOBAL" | "NINGUNA";
  sucursalOfertaId: number | null;
  ofertaInicio: string | null;
  ofertaFin: string | null;
  stock: number;
  disponible: boolean;
  estado: string;
}

export interface ProductoInfo {
  idProducto: number;
  nombre: string;
  slug: string;
  descripcion: string;
  estado: string;
  fechaCreacion: string;
  categoria: Categoria;
  imagenGlobalUrl: string | null;
  imagenGlobalThumbUrl: string | null;
  guiaTallasUrl: string | null;
  guiaTallasThumbUrl: string | null;
  preventa: boolean;
  fechaEnvioPreventa: string | null;
}

export interface PromocionComboProducto {
  idPromocionCombo: number;
  nombre: string;
  regla: string;
  precioCombo: number;
  mismoProducto?: boolean;
}

export interface EcommerceInicioCombo {
  idPromocionCombo: number;
  nombre: string;
  regla: string;
  precioCombo: number;
  precioRegularMinimo: number;
  ahorroMinimo: number;
  items: EcommerceInicioComboItem[];
}

export interface EcommerceInicioComboItem {
  idProducto: number;
  nombre: string;
  slug: string;
  cantidadRequerida: number;
  imagenGlobalUrl: string | null;
  imagenGlobalThumbUrl: string | null;
}

export interface ProductoItem {
  producto: ProductoInfo;
  color: Color;
  imagenPrincipal: ImagenProducto | null;
  precioMinimo: number;
  precioMaximo: number;
  estadoStock: "DISPONIBLE" | "PARCIAL" | "AGOTADO";
  stockTotalColor: number;
  variantes: VarianteProducto[];
  promocionesCombo?: PromocionComboProducto[];
}

export interface ProductoListResponse {
  tiendaConfigurada: boolean;
  message: string | null;
  content: ProductoItem[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ProductoListParams {
  page?: number;
  size?: number;
  q?: string;
  idCategoria?: number;
  tallas?: string[];
  precioMax?: number;
  soloDisponibles?: boolean;
}

// --- Detalle de producto (GET /productos/{slug}) ---

export interface ColorDetalle {
  color: Color;
  imagenPrincipal: ImagenProducto | null;
  imagenes: ImagenProducto[];
  precioMinimo: number;
  precioMaximo: number;
  estadoStock: "DISPONIBLE" | "PARCIAL" | "AGOTADO";
  stockTotalColor: number;
  variantes: VarianteProducto[];
}

export interface ProductoDetalleResponse {
  tiendaConfigurada: boolean;
  producto: ProductoInfo;
  promocionesCombo?: PromocionComboProducto[];
  colores: ColorDetalle[];
  recomendados: ProductoItem[];
}

export interface ProductoColorStockResponse {
  idProducto: number;
  slug: string;
  color: Color;
  estadoStock: "DISPONIBLE" | "PARCIAL" | "AGOTADO";
  stockTotalColor: number;
  variantes: VarianteProducto[];
  promocionesCombo?: PromocionComboProducto[];
}

export interface CarritoValidarRequest {
  items: Array<{
    idProductoVariante: number;
    cantidad: number;
    precio: number;
  }>;
  promocionesEsperadas?: number[];
}

export interface CarritoValidarItemResponse {
  idProductoVariante: number;
  nombre: string;
  cantidadSolicitada: number;
  cantidadPermitida: number;
  cantidadValida: boolean;
  stock: number;
  disponible: boolean;
  precioVigente: number;
  precioCambiado: boolean;
  mensaje: string | null;
}

export interface CarritoValidarResponse {
  valido: boolean;
  items: CarritoValidarItemResponse[];
  resumen: {
    subtotal: number;
    descuentoPromocion: number;
    total: number;
    combosAplicados: Array<{
      idPromocionCombo: number;
      nombre: string;
      regla: string;
      precioNormal: number;
      precioCombo: number;
      descuento: number;
    }>;
    combosPendientes: Array<{
      idPromocionCombo: number;
      nombre: string;
      regla: string;
      precioCombo?: number;
      mensaje?: string | null;
    }>;
  };
  promocionesNoDisponibles: Array<{
    idPromocionCombo: number;
    nombre: string;
  }>;
}

// --- Inicio (GET /inicio) ---

export interface EcommerceInicioResponse {
  tiendaConfigurada: boolean;
  portadas: EcommercePortada[];
  imagenesProductos: EcommerceInicioImagenProducto[];
  aleatorios: ProductoItem[];
  masVendidos: ProductoItem[];
  combos: EcommerceInicioCombo[];
}

export interface EcommercePromocionesResponse {
  content: EcommerceInicioCombo[];
  page: number;
  size: number;
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface EcommerceInicioImagenProducto {
  idProducto: number;
  nombre: string;
  slug: string;
  imagenUrl: string | null;
  imagenThumbUrl: string | null;
  preventa?: boolean;
}

export interface EcommercePortada {
  idEcommercePortada: number;
  desktopUrl: string;
  desktopThumbUrl: string | null;
  mobileUrl: string;
  mobileThumbUrl: string | null;
  orden: number;
  estado: "ACTIVO" | "INACTIVO";
}

