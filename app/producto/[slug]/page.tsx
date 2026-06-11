"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
  ShoppingCartSimple,
  Warning,
  Spinner,
  Storefront,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { fetchProductoBySlug, buildImageUrl } from "@/lib/api";
import type { ProductoDetalleResponse, ImagenProducto, VarianteProducto, OtroColorItem } from "@/types/producto";

export default function ProductoDetallePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<ProductoDetalleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [switchingColor, setSwitchingColor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Gallery
  const [activeImage, setActiveImage] = useState(0);

  // Selected size
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const loadProduct = (slg: string, idColor?: number) => {
    fetchProductoBySlug(slg, idColor)
      .then((res) => {
        setData(res);
        setActiveImage(0);
        setSelectedSize(null);
      })
      .catch((err) => {
        if (err instanceof Error && err.message.includes("404")) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Error al cargar producto");
        }
      })
      .finally(() => {
        setLoading(false);
        setSwitchingColor(false);
      });
  };

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setSwitchingColor(false);

    loadProduct(slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleColorChange = (idColor: number) => {
    if (idColor === data?.color.idColor) return;
    setSwitchingColor(true);
    setSelectedSize(null);
    loadProduct(slug, idColor);
  };

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setAddingToCart(true);
    setTimeout(() => setAddingToCart(false), 600);
  };

  // --- Derived data ---

  const currentColor = data?.color;
  const allColors = data
    ? [
        {
          color: data.color,
          imagenPrincipal: data.imagenPrincipal,
          precioMinimo: data.precioMinimo,
          precioMaximo: data.precioMaximo,
          estadoStock: data.estadoStock,
          stockTotalColor: data.stockTotalColor,
          disponible: data.estadoStock !== "AGOTADO",
        } as OtroColorItem,
        ...data.otrosColores,
      ]
    : [];

  const images: ImagenProducto[] = data?.imagenes?.length
    ? data.imagenes
    : data?.imagenPrincipal
    ? [data.imagenPrincipal]
    : [];

  const mainImageUrl = images[activeImage]
    ? buildImageUrl(images[activeImage].url)
    : null;

  // Sort variants by talla
  const variants: VarianteProducto[] = data?.variantes
    ? [...data.variantes].sort((a, b) => {
        const na = Number(a.talla.nombre);
        const nb = Number(b.talla.nombre);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.talla.nombre.localeCompare(b.talla.nombre);
      })
    : [];

  const priceLabel =
    data && data.precioMinimo === data.precioMaximo
      ? `S/ ${data.precioMinimo.toFixed(2)}`
      : data
      ? `S/ ${data.precioMinimo.toFixed(2)} - S/ ${data.precioMaximo.toFixed(2)}`
      : "";

  const currentVariant = selectedSize
    ? variants.find((v) => v.talla.nombre === selectedSize)
    : null;

  const displayPrice =
    currentVariant && currentVariant.tipoOfertaAplicada !== "NINGUNA"
      ? `S/ ${currentVariant.precioVigente.toFixed(2)}`
      : priceLabel;

  const hasOffer =
    currentVariant && currentVariant.tipoOfertaAplicada !== "NINGUNA";

  // --- Render ---

  return (
    <main className="min-h-screen bg-white text-[#222]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-10 lg:px-16 lg:py-12">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Spinner size={32} className="animate-spin text-black/20 mb-4" />
            <p className="text-sm font-light text-black/40">Cargando producto...</p>
          </div>
        )}

        {/* 404 */}
        {!loading && notFound && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-lg font-light text-black/40 mb-2">Producto no encontrado</p>
            <Link
              href="/categorias"
              className="mt-4 text-[13px] font-light text-black/60 underline hover:text-black transition-colors"
            >
              Volver al catálogo
            </Link>
          </div>
        )}

        {/* Error */}
        {!loading && !notFound && error && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Warning size={32} weight="light" className="text-black/20 mb-4" />
            <p className="text-sm font-light text-black/50 mb-2">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 text-[13px] font-light text-black/60 underline hover:text-black transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Tienda no configurada */}
        {!loading && data && !data.tiendaConfigurada && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Storefront size={32} weight="light" className="text-black/20 mb-4" />
            <p className="text-sm font-light text-black/50">Tienda no configurada</p>
          </div>
        )}

        {/* Product Detail */}
        {!loading && data && data.tiendaConfigurada && (
          <>
            {/* Breadcrumb */}
            <nav className="mb-8 flex items-center gap-2 text-[11px] font-light uppercase tracking-widest text-black/45">
              <Link href="/" className="transition-colors hover:text-black">
                Inicio
              </Link>
              <span>/</span>
              <Link href="/categorias" className="transition-colors hover:text-black">
                {data.producto.categoria.nombre}
              </Link>
              <span>/</span>
              <span className="font-medium text-black">{data.producto.nombre}</span>
            </nav>

            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              {/* LEFT: Image Gallery */}
              <div>
                {/* Main image */}
                <div className="relative aspect-[3/4] overflow-hidden bg-[#fafafa]">
                  {switchingColor && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/50">
                      <Spinner size={28} className="animate-spin text-black/25" />
                    </div>
                  )}
                  {mainImageUrl ? (
                    <Image
                      src={mainImageUrl}
                      alt={data.producto.nombre}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover object-center"
                      priority
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#f0f0f0]">
                      <span className="font-[family-name:var(--font-kiments)] text-[28px] font-normal tracking-[0.12em] text-black/55">
                        KIMENTS
                      </span>
                      <span className="mt-1 text-[9px] font-light uppercase tracking-[0.2em] text-black/40">
                        Tienda de ropa
                      </span>
                    </div>
                  )}

                  {/* Gallery arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Imagen anterior"
                        onClick={() =>
                          setActiveImage((prev) =>
                            prev === 0 ? images.length - 1 : prev - 1,
                          )
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-white/80 text-black shadow-sm transition-colors hover:bg-white"
                      >
                        <CaretLeft size={18} weight="bold" />
                      </button>
                      <button
                        type="button"
                        aria-label="Imagen siguiente"
                        onClick={() =>
                          setActiveImage((prev) =>
                            prev === images.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex size-9 items-center justify-center rounded-full bg-white/80 text-black shadow-sm transition-colors hover:bg-white"
                      >
                        <CaretRight size={18} weight="bold" />
                      </button>
                    </>
                  )}

                  {/* Stock badge */}
                  {data.estadoStock === "AGOTADO" && (
                    <span className="absolute left-3 top-3 z-10 bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                      Agotado
                    </span>
                  )}
                  {data.estadoStock === "PARCIAL" && (
                    <span className="absolute left-3 top-3 z-10 bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                      Pocas unidades
                    </span>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => {
                      const thumbUrl = buildImageUrl(img.urlThumb || img.url);
                      if (!thumbUrl) return null;
                      return (
                        <button
                          key={img.idColorImagen ?? idx}
                          type="button"
                          onClick={() => setActiveImage(idx)}
                          className={`relative size-16 shrink-0 overflow-hidden border ${
                            idx === activeImage
                              ? "border-black"
                              : "border-black/10 hover:border-black/40"
                          }`}
                        >
                          <Image
                            src={thumbUrl}
                            alt={`${data.producto.nombre} - ${idx + 1}`}
                            fill
                            unoptimized
                            sizes="64px"
                            className="object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT: Product Info */}
              <div>
                <p className="text-[11px] font-light uppercase tracking-widest text-black/40">
                  {data.producto.categoria.nombre}
                </p>
                <h1 className="mt-2 text-2xl font-medium text-[#222] sm:text-3xl">
                  {data.producto.nombre}
                </h1>

                {/* Price */}
                <div className="mt-6">
                  {hasOffer ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-2xl font-semibold text-red-700">
                        {displayPrice}
                      </span>
                      <span className="text-base font-light text-black/40 line-through">
                        S/ {currentVariant!.precioRegular.toFixed(2)}
                      </span>
                      <span className="text-[11px] font-medium uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        Oferta {currentVariant!.tipoOfertaAplicada === "SUCURSAL" ? "Especial" : "Global"}
                      </span>
                    </div>
                  ) : (
                    <p className="text-2xl font-semibold">{displayPrice}</p>
                  )}
                </div>

                {/* Description */}
                {data.producto.descripcion && (
                  <p className="mt-4 text-sm font-light text-black/60 leading-relaxed">
                    {data.producto.descripcion}
                  </p>
                )}

                {/* SKU if selected */}
                {currentVariant && (
                  <p className="mt-3 text-[11px] font-light text-black/30">
                    SKU: {currentVariant.sku}
                  </p>
                )}

                {/* Colors */}
                <div className="mt-8">
                  <h2 className="text-sm font-medium text-[#222] mb-4">
                    Color · <span className="font-light text-black/50">{currentColor?.nombre}</span>
                    {switchingColor && (
                      <Spinner size={12} className="inline ml-2 animate-spin text-black/30" />
                    )}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {allColors.map((oc) => (
                      <button
                        key={oc.color.idColor}
                        type="button"
                        onClick={() => handleColorChange(oc.color.idColor)}
                        disabled={switchingColor}
                        title={`${oc.color.nombre}${oc.estadoStock === "AGOTADO" ? " (Agotado)" : oc.estadoStock === "PARCIAL" ? " (Pocas unidades)" : ""} — ${oc.precioMinimo === oc.precioMaximo ? `S/ ${oc.precioMinimo.toFixed(2)}` : `S/ ${oc.precioMinimo.toFixed(2)} - S/ ${oc.precioMaximo.toFixed(2)}`}`}
                        className={`relative size-9 rounded-full border-2 transition-all ${
                          oc.color.idColor === currentColor?.idColor
                            ? "border-black shadow-[0_0_0_2px_rgba(0,0,0,0.12)] scale-110"
                            : "border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)] hover:shadow-[0_0_0_2px_rgba(0,0,0,0.4)]"
                        } ${
                          oc.estadoStock === "AGOTADO" ? "opacity-40" : ""
                        } ${switchingColor ? "cursor-wait" : "cursor-pointer"}`}
                        style={{ backgroundColor: oc.color.hex }}
                      >
                        {oc.estadoStock === "AGOTADO" && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-[60%] h-px bg-white/60 rotate-45" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="mt-8">
                  <h2 className="text-sm font-medium text-[#222] mb-4">
                    Talla{selectedSize ? ` · ${selectedSize}` : ""}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v) => (
                      <button
                        key={v.idProductoVariante}
                        type="button"
                        disabled={!v.disponible}
                        onClick={() => setSelectedSize(v.talla.nombre)}
                        className={`relative flex h-12 w-14 items-center justify-center rounded-md border text-sm font-light transition-all ${
                          !v.disponible
                            ? "cursor-not-allowed border-black/5 bg-gray-50 text-black/20 line-through"
                            : selectedSize === v.talla.nombre
                            ? "border-black bg-black text-white"
                            : "border-black/15 bg-white text-black hover:border-black/50"
                        }`}
                        title={
                          v.disponible
                            ? `${v.stock} en stock${v.tipoOfertaAplicada !== "NINGUNA" ? ` · Oferta S/ ${v.precioVigente.toFixed(2)}` : ""}`
                            : "Agotado"
                        }
                      >
                        {v.talla.nombre}
                      </button>
                    ))}
                  </div>

                  {/* Stock info */}
                  {selectedSize && currentVariant && (
                    <p className="mt-2 text-[12px] font-light text-black/45">
                      {currentVariant.stock} unidad{currentVariant.stock !== 1 ? "es" : ""} disponible{currentVariant.stock !== 1 ? "s" : ""}
                    </p>
                  )}
                  {!selectedSize && (
                    <p className="mt-2 text-[12px] font-light text-black/30">
                      Selecciona una talla
                    </p>
                  )}
                </div>

                {/* Add to cart */}
                <button
                  type="button"
                  disabled={!selectedSize || data.estadoStock === "AGOTADO" || addingToCart}
                  onClick={handleAddToCart}
                  className="mt-8 flex h-[56px] w-full items-center justify-center gap-2 rounded-md bg-black text-[15px] font-medium tracking-wide text-white transition-all hover:bg-black/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/25"
                >
                  {addingToCart ? (
                    <>
                      <Spinner size={18} className="animate-spin" />
                      Agregando...
                    </>
                  ) : data.estadoStock === "AGOTADO" ? (
                    "Agotado"
                  ) : !selectedSize ? (
                    "Elige una talla"
                  ) : (
                    <>
                      <ShoppingCartSimple size={20} weight="regular" />
                      Añadir al carrito
                    </>
                  )}
                </button>

                {/* Stock summary */}
                <p className="mt-4 text-center text-[12px] font-light text-black/35">
                  {data.estadoStock === "DISPONIBLE" && "Todas las tallas disponibles"}
                  {data.estadoStock === "PARCIAL" && "Algunas tallas agotadas"}
                  {data.estadoStock === "AGOTADO" && "Producto agotado temporalmente"}
                  {" · "}{data.stockTotalColor} en total
                </p>
              </div>
            </div>

            {/* Back link */}
            <div className="mt-16 border-t border-black/10 pt-8">
              <Link
                href="/categorias"
                className="inline-flex items-center gap-2 text-[13px] font-light text-black/50 transition-colors hover:text-black"
              >
                <CaretLeft size={14} weight="bold" />
                Volver al catálogo
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
