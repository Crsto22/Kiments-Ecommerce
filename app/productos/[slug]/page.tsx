"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
  CaretUp,
  MagnifyingGlassPlus,
  X,
  Eye,
  ShoppingCartSimple,
  Warning,
  Spinner,
  Storefront,
} from "@phosphor-icons/react";
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { fetchProductoBySlug, buildImageUrl } from "@/lib/api";
import type { ProductoDetalleResponse, ColorDetalle, VarianteProducto } from "@/types/producto";

const sizeGuideData = [
  { talla: "S", busto: "84-88", cintura: "66-70", cadera: "92-96" },
  { talla: "M", busto: "89-93", cintura: "71-75", cadera: "97-101" },
  { talla: "L", busto: "94-98", cintura: "76-80", cadera: "102-106" },
  { talla: "XL", busto: "99-104", cintura: "81-86", cadera: "107-112" },
];

export default function ProductoDetallePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<ProductoDetalleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Zoom viewer
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isViewerMounted, setIsViewerMounted] = useState(false);
  const [viewerPhase, setViewerPhase] = useState<"opening" | "closing">("opening");
  const [zoomStyle, setZoomStyle] = useState<CSSProperties>({});
  const [isDetailZoomed, setIsDetailZoomed] = useState(false);
  const [isDraggingZoomedImage, setIsDraggingZoomedImage] = useState(false);
  const [zoomPan, setZoomPan] = useState({ x: 0, y: 0 });
  const imageFrameRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 });
  const dragMovedRef = useRef(false);

  // Selections
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setSelectedColorIndex(0);
    setSelectedSize(null);
    setActiveImageIndex(0);

    fetchProductoBySlug(slug)
      .then((res) => setData(res))
      .catch((err) => {
        if (err instanceof Error && err.message.includes("404")) {
          setNotFound(true);
        } else {
          setError(err instanceof Error ? err.message : "Error al cargar producto");
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const currentColor: ColorDetalle | null =
    data && data.colores.length > 0 ? data.colores[selectedColorIndex] ?? data.colores[0] : null;

  const images = currentColor?.imagenes?.length
    ? currentColor.imagenes
    : currentColor?.imagenPrincipal
    ? [currentColor.imagenPrincipal]
    : [];

  const safeActiveIndex =
    activeImageIndex >= images.length ? 0 : activeImageIndex;

  const activeImageUrl = images[safeActiveIndex]
    ? buildImageUrl(images[safeActiveIndex].url)
    : null;

  const variants: VarianteProducto[] = currentColor?.variantes
    ? [...currentColor.variantes].sort((a, b) => {
        const na = Number(a.talla.nombre);
        const nb = Number(b.talla.nombre);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.talla.nombre.localeCompare(b.talla.nombre);
      })
    : [];

  const currentVariant = selectedSize
    ? variants.find((v) => v.talla.nombre === selectedSize) ?? null
    : null;

  const hasOffer =
    currentVariant && currentVariant.tipoOfertaAplicada !== "NINGUNA";

  const displayPrice = currentVariant
    ? `S/ ${currentVariant.precioVigente.toFixed(2)}`
    : currentColor
    ? currentColor.precioMinimo === currentColor.precioMaximo
      ? `S/ ${currentColor.precioMinimo.toFixed(2)}`
      : `S/ ${currentColor.precioMinimo.toFixed(2)} - S/ ${currentColor.precioMaximo.toFixed(2)}`
    : "";

  // Zoom handlers
  const showPreviousImage = useCallback(() => {
    setIsDetailZoomed(false);
    setIsDraggingZoomedImage(false);
    setZoomPan({ x: 0, y: 0 });
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const showNextImage = useCallback(() => {
    setIsDetailZoomed(false);
    setIsDraggingZoomedImage(false);
    setZoomPan({ x: 0, y: 0 });
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const getZoomStyle = (): CSSProperties => {
    const frame = imageFrameRef.current;
    if (!frame) return {};
    const source = frame.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const controlsHeight = 76;
    const horizontalPadding = viewportWidth < 768 ? 16 : 40;
    const verticalPadding = viewportWidth < 768 ? 40 : 52;
    const availableWidth = Math.max(240, viewportWidth - horizontalPadding);
    const availableHeight = Math.max(280, viewportHeight - controlsHeight - verticalPadding);
    const sourceRatio = source.width / source.height;
    const availableRatio = availableWidth / availableHeight;
    const fittedWidth =
      sourceRatio > availableRatio ? availableWidth : availableHeight * sourceRatio;
    const targetWidth = Math.min(viewportWidth - 16, fittedWidth * 1.08);
    const targetHeight = targetWidth / sourceRatio;
    const stageCenterX = viewportWidth / 2;
    const stageCenterY = (viewportHeight - controlsHeight) / 2;
    const sourceCenterX = source.left + source.width / 2;
    const sourceCenterY = source.top + source.height / 2;
    const sourceScale = source.width / targetWidth;
    return {
      "--product-zoom-width": `${targetWidth}px`,
      "--product-zoom-height": `${targetHeight}px`,
      "--product-zoom-x": `${sourceCenterX - stageCenterX}px`,
      "--product-zoom-y": `${sourceCenterY - stageCenterY}px`,
      "--product-zoom-scale": sourceScale.toString(),
    } as CSSProperties;
  };

  const openViewer = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setZoomStyle(getZoomStyle());
    setIsDetailZoomed(false);
    setIsDraggingZoomedImage(false);
    setZoomPan({ x: 0, y: 0 });
    setViewerPhase("opening");
    setIsViewerMounted(true);
  };

  const closeViewer = useCallback(() => {
    setViewerPhase("closing");
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setIsViewerMounted(false);
      setViewerPhase("opening");
      setIsDetailZoomed(false);
      setIsDraggingZoomedImage(false);
      setZoomPan({ x: 0, y: 0 });
    }, 340);
  }, []);

  const handleGalleryButtonClick = (
    event: MouseEvent<HTMLButtonElement>,
    action: () => void,
  ) => {
    event.stopPropagation();
    action();
  };

  const handleViewerStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) closeViewer();
  };

  const handleZoomImageClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    if (isDetailZoomed) {
      setIsDetailZoomed(false);
      setZoomPan({ x: 0, y: 0 });
      return;
    }
    setIsDetailZoomed(true);
  };

  const handleZoomImagePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDetailZoomed) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      panX: zoomPan.x,
      panY: zoomPan.y,
    };
    dragMovedRef.current = false;
    setIsDraggingZoomedImage(true);
  };

  const handleZoomImagePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDetailZoomed || !isDraggingZoomedImage) return;
    const nextX =
      dragStartRef.current.panX + event.clientX - dragStartRef.current.pointerX;
    const nextY =
      dragStartRef.current.panY + event.clientY - dragStartRef.current.pointerY;
    const movedDistance = Math.hypot(
      event.clientX - dragStartRef.current.pointerX,
      event.clientY - dragStartRef.current.pointerY,
    );
    if (movedDistance > 4) dragMovedRef.current = true;
    setZoomPan({
      x: Math.max(-260, Math.min(260, nextX)),
      y: Math.max(-260, Math.min(260, nextY)),
    });
  };

  const handleZoomImagePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (isDetailZoomed) event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDraggingZoomedImage(false);
  };

  useEffect(() => {
    if (!isViewerMounted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeViewer, isViewerMounted, showNextImage, showPreviousImage]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1f3]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} className="animate-spin text-black/20" />
          <p className="text-sm font-light text-black/40">Cargando producto...</p>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1f3]">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-lg font-light text-black/40">Producto no encontrado</p>
          <Link
            href="/productos"
            className="text-[13px] font-light text-black/60 underline hover:text-black transition-colors"
          >
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1f3]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Warning size={32} weight="light" className="text-black/20" />
          <p className="text-sm font-light text-black/50">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[13px] font-light text-black/60 underline hover:text-black transition-colors"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  if (data && !data.tiendaConfigurada) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1f3]">
        <div className="flex flex-col items-center gap-4 text-center">
          <Storefront size={32} weight="light" className="text-black/20" />
          <p className="text-sm font-light text-black/50">Tienda no configurada</p>
        </div>
      </main>
    );
  }

  if (!data || !currentColor) return null;

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-24 text-[#171717] sm:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section className="grid gap-3 sm:grid-cols-[1fr_126px]">
          <div
            ref={imageFrameRef}
            className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-white"
            onClick={openViewer}
          >
            {activeImageUrl ? (
              <Image
                src={activeImageUrl}
                alt={data.producto.nombre}
                fill
                unoptimized
                priority
                sizes="(min-width: 1024px) 44vw, 92vw"
                className={`object-cover object-center transition-opacity duration-200 ${
                  isViewerMounted ? "opacity-0" : "opacity-100"
                }`}
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

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Imagen anterior"
                  onClick={(event) => handleGalleryButtonClick(event, showPreviousImage)}
                  className="absolute left-5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <CaretLeft size={18} weight="bold" />
                </button>
                <button
                  type="button"
                  aria-label="Imagen siguiente"
                  onClick={(event) => handleGalleryButtonClick(event, showNextImage)}
                  className="absolute right-5 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                >
                  <CaretRight size={18} weight="bold" />
                </button>
              </>
            )}

            <button
              type="button"
              aria-label="Ampliar imagen"
              onClick={(event) => handleGalleryButtonClick(event, openViewer)}
              className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white/90 text-black opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
            >
              <MagnifyingGlassPlus size={20} weight="regular" />
            </button>

            {currentColor.estadoStock === "AGOTADO" && (
              <span className="absolute left-3 top-3 z-10 bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                Agotado
              </span>
            )}
            {currentColor.estadoStock === "PARCIAL" && (
              <span className="absolute left-3 top-3 z-10 bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                Pocas unidades
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:self-start">
              {images.map((img, index) => {
                const thumbUrl = buildImageUrl(img.urlThumb || img.url);
                if (!thumbUrl) return null;
                return (
                  <button
                    key={img.idColorImagen ?? index}
                    type="button"
                    aria-label="Cambiar imagen del producto"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative aspect-[3/4] overflow-hidden bg-white ${
                      safeActiveIndex === index ? "ring-1 ring-black" : ""
                    }`}
                  >
                    <Image
                      src={thumbUrl}
                      alt={`${data.producto.nombre} - ${index + 1}`}
                      fill
                      unoptimized
                      sizes="126px"
                      className="object-cover object-center"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="pt-2 lg:pl-10">
          <nav className="mb-6 flex items-center gap-2 text-[10px] font-light uppercase tracking-widest text-black/50">
            <Link href="/" className="transition-colors hover:text-black">Inicio</Link>
            <span>/</span>
            <Link href="/productos" className="transition-colors hover:text-black">{data.producto.categoria.nombre}</Link>
            <span>/</span>
            <span className="text-black">{data.producto.nombre}</span>
          </nav>
          <h1 className="mt-2 text-3xl font-semibold uppercase leading-tight">
            {data.producto.nombre}
          </h1>

          {currentVariant && (
            <p className="mt-5 text-[11px] font-light uppercase">SKU: {currentVariant.sku}</p>
          )}

          <div className="mt-5">
            {hasOffer ? (
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-semibold text-red-700">
                  {displayPrice}
                </span>
                <span className="text-base font-light text-black/40 line-through">
                  S/ {currentVariant!.precioRegular.toFixed(2)}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5">
                  Oferta {currentVariant!.tipoOfertaAplicada === "SUCURSAL" ? "Especial" : "Global"}
                </span>
              </div>
            ) : (
              <p className="text-xl font-light">{displayPrice}</p>
            )}
          </div>

          <div className="mt-7">
            <p className="text-sm font-semibold">
              Color: <span className="font-light">{currentColor.color.nombre}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {data.colores.map((cd, index) => {
                const isSelected = index === selectedColorIndex;
                const isSoldOut = cd.estadoStock === "AGOTADO";
                return (
                  <button
                    key={cd.color.idColor}
                    type="button"
                    aria-label={`Elegir color ${cd.color.nombre}`}
                    onClick={() => {
                      setSelectedColorIndex(index);
                      setSelectedSize(null);
                      setActiveImageIndex(0);
                    }}
                    className={`relative size-9 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)] transition-all ${
                      isSelected ? "ring-2 ring-black/70 ring-offset-2 scale-110" : ""
                    } ${isSoldOut ? "opacity-40" : ""}`}
                    style={{ backgroundColor: cd.color.hex }}
                    title={`${cd.color.nombre}${isSoldOut ? " (Agotado)" : ""} — S/ ${cd.precioMinimo.toFixed(2)}${cd.precioMinimo !== cd.precioMaximo ? ` - S/ ${cd.precioMaximo.toFixed(2)}` : ""}`}
                  >
                    {isSoldOut && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-[60%] h-px bg-white/60 rotate-45" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">
                Talla{selectedSize ? ` · ${selectedSize}` : ""}
              </p>
              <Drawer>
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-black/15 bg-white px-4 text-[10px] font-light uppercase tracking-[0.06em] text-black transition-colors hover:border-black"
                  >
                    Guia de tallas
                  </button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="border-b border-black/10">
                    <DrawerTitle>Guia de tallas</DrawerTitle>
                    <DrawerDescription>
                      Medidas en centímetros. Toma tus medidas y compara con la tabla.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="overflow-x-auto px-6 py-6">
                    <table className="w-full text-left text-sm font-light">
                      <thead>
                        <tr className="border-b border-black/10 text-[11px] font-medium uppercase tracking-wider text-black/50">
                          <th className="pb-3 pr-4">Talla</th>
                          <th className="pb-3 pr-4">Busto</th>
                          <th className="pb-3 pr-4">Cintura</th>
                          <th className="pb-3">Cadera</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sizeGuideData.map((row) => (
                          <tr key={row.talla} className="border-b border-black/5">
                            <td className="py-3 pr-4 font-medium text-black">{row.talla}</td>
                            <td className="py-3 pr-4 text-black/70">{row.busto}</td>
                            <td className="py-3 pr-4 text-black/70">{row.cintura}</td>
                            <td className="py-3 text-black/70">{row.cadera}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <DrawerFooter className="border-t border-black/10">
                    <DrawerClose asChild>
                      <button className="h-12 w-full bg-black text-sm font-light uppercase tracking-widest text-white transition-colors hover:bg-black/80">
                        Entendido
                      </button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
            <div className="mt-3 flex gap-3">
              {variants.map((v) => (
                <button
                  key={v.idProductoVariante}
                  type="button"
                  disabled={!v.disponible}
                  onClick={() => setSelectedSize(v.talla.nombre)}
                  className={`relative flex size-12 overflow-hidden items-center justify-center rounded-md border text-sm font-light transition-colors ${
                    !v.disponible
                      ? "border-black/10 bg-gray-50 text-black/30 cursor-not-allowed"
                      : selectedSize === v.talla.nombre
                        ? "border-black bg-white text-black"
                        : "border-black/15 bg-white/75 text-black hover:border-black/50"
                  }`}
                  title={
                    v.disponible
                      ? `${v.stock} en stock${v.tipoOfertaAplicada !== "NINGUNA" ? ` · Oferta S/ ${v.precioVigente.toFixed(2)}` : ""}`
                      : "Agotado"
                  }
                >
                  {v.talla.nombre}
                  {!v.disponible && (
                    <span className="absolute inset-0 m-auto h-[1px] w-[150%] -rotate-45 bg-black/20" />
                  )}
                </button>
              ))}
            </div>
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

          <button
            type="button"
            disabled={!selectedSize || currentColor.estadoStock === "AGOTADO"}
            className="mt-8 flex h-14 w-full items-center justify-center bg-[#181516] text-sm font-light uppercase tracking-[0.04em] text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-black/25"
          >
            {currentColor.estadoStock === "AGOTADO"
              ? "Agotado"
              : !selectedSize
              ? "Elige una talla"
              : "Añadir al carrito"}
          </button>

          {data.producto.descripcion && (
            <div className="mt-5 bg-white">
              <button className="flex w-full items-center justify-between border-b border-black/10 px-3 py-2 text-left text-sm font-light">
                Descripción
                <CaretUp size={14} weight="light" />
              </button>
              <div className="px-8 py-4 text-xs font-light leading-6 text-black/75">
                {data.producto.descripcion}
              </div>
            </div>
          )}
        </section>
      </div>

      {isViewerMounted && activeImageUrl ? (
        <div
          aria-modal="true"
          aria-label="Vista ampliada del producto"
          className={`product-viewer fixed inset-0 z-[80] flex flex-col bg-white text-black ${
            viewerPhase === "closing" ? "product-viewer-closing" : ""
          }`}
          role="dialog"
        >
          <button
            type="button"
            aria-label="Cerrar vista ampliada"
            onClick={closeViewer}
            className="absolute right-5 top-5 z-10 flex size-10 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black"
          >
            <X size={20} weight="regular" />
          </button>

          <div
            className="product-viewer-stage flex min-h-0 flex-1 items-center justify-center px-4 py-10 sm:px-12"
            onClick={handleViewerStageClick}
          >
            <div
              className={`product-viewer-image relative overflow-hidden ${
                isDetailZoomed
                  ? isDraggingZoomedImage
                    ? "cursor-grabbing"
                    : "cursor-grab"
                  : "cursor-zoom-in"
              }`}
              onClick={handleZoomImageClick}
              onPointerDown={handleZoomImagePointerDown}
              onPointerMove={handleZoomImagePointerMove}
              onPointerUp={handleZoomImagePointerUp}
              onPointerCancel={handleZoomImagePointerUp}
              style={zoomStyle}
            >
              <Image
                src={activeImageUrl}
                alt={`${data.producto.nombre} ampliado`}
                width={1600}
                height={2000}
                unoptimized
                priority
                className={`size-full select-none object-contain object-center transition-transform duration-300 ${
                  isDraggingZoomedImage ? "duration-0" : ""
                }`}
                draggable={false}
                style={{
                  transform: isDetailZoomed
                    ? `translate3d(${zoomPan.x}px, ${zoomPan.y}px, 0) scale(1.85)`
                    : "translate3d(0, 0, 0) scale(1)",
                  transformOrigin: "center center",
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 px-6 pb-8">
            <button
              type="button"
              aria-label="Imagen anterior"
              onClick={showPreviousImage}
              className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black"
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <button
              type="button"
              aria-label="Cerrar vista ampliada"
              onClick={closeViewer}
              className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black"
            >
              <X size={18} weight="regular" />
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              onClick={showNextImage}
              className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black"
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white px-5 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] lg:hidden">
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-light uppercase tracking-widest text-black/60">{data.producto.nombre}</p>
            <p className="text-sm font-semibold text-black mt-0.5">{displayPrice}</p>
          </div>
          <button
            type="button"
            disabled={!selectedSize || currentColor.estadoStock === "AGOTADO"}
            className="flex h-[46px] flex-1 items-center justify-center rounded bg-black px-6 text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/25"
          >
            {currentColor.estadoStock === "AGOTADO"
              ? "Agotado"
              : !selectedSize
              ? "Elige talla"
              : "Añadir"}
          </button>
        </div>
      </div>
    </main>
  );
}
