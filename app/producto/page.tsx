"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CaretLeft,
  CaretRight,
  CaretUp,
  MagnifyingGlassPlus,
  X,
  Eye,
  ShoppingCartSimple,
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

const productImages = [
  "/img/productos/Producto01.jpg",
  "/img/productos/Producto02.jpg",
  "/img/productos/Producto03.jpg",
];

const colors = [
  { name: "Marron", value: "#5b4a4a" },
  { name: "Rojo", value: "#8b1114" },
  { name: "Azul", value: "#045cbb" },
  { name: "Turquesa", value: "#079aaa" },
  { name: "Fucsia", value: "#ef55b2" },
  { name: "Azul oscuro", value: "#004eac" },
  { name: "Durazno", value: "#f7b856" },
  { name: "Naranja", value: "#fb7416" },
];

const sizes = [
  { label: "S", inStock: true },
  { label: "M", inStock: false },
  { label: "L", inStock: true },
  { label: "XL", inStock: true },
];

const relatedProducts = [
  {
    name: "BLUSA IMARA VERDE/NEGRO",
    price: "S/. 249.00",
    image: "/img/productos/Producto03.jpg",
    swatch: "#10a524",
    position: "center",
  },
  {
    name: "CAMISA M/LARGA VIENA",
    price: "S/. 149.90",
    image: "/img/productos/Producto01.jpg",
    swatch: "#6c6463",
    position: "center",
  },
  {
    name: "BLUSA IMARA ACERO/NEGRO",
    price: "S/. 249.00",
    image: "/img/productos/Producto02.jpg",
    swatch: "#69747d",
    position: "center",
  },
  {
    name: "BLUSA IMARA IVORY/NEGRO",
    price: "S/. 249.00",
    image: "/img/productos/Producto01.jpg",
    swatch: "#f4f1ea",
    position: "center",
  },
];

export default function ProductoPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isViewerMounted, setIsViewerMounted] = useState(false);
  const [viewerPhase, setViewerPhase] = useState<"opening" | "closing">("opening");
  const [zoomStyle, setZoomStyle] = useState<CSSProperties>({});
  const [isDetailZoomed, setIsDetailZoomed] = useState(false);
  const [isDraggingZoomedImage, setIsDraggingZoomedImage] = useState(false);
  const [zoomPan, setZoomPan] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState(colors[7].name);
  const [selectedSize, setSelectedSize] = useState("S");
  const imageFrameRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 });
  const dragMovedRef = useRef(false);
  const activeImage = productImages[activeIndex];

  const showPreviousImage = useCallback(() => {
    setIsDetailZoomed(false);
    setIsDraggingZoomedImage(false);
    setZoomPan({ x: 0, y: 0 });
    setActiveIndex((current) =>
      current === 0 ? productImages.length - 1 : current - 1,
    );
  }, []);

  const showNextImage = useCallback(() => {
    setIsDetailZoomed(false);
    setIsDraggingZoomedImage(false);
    setZoomPan({ x: 0, y: 0 });
    setActiveIndex((current) =>
      current === productImages.length - 1 ? 0 : current + 1,
    );
  }, []);

  const getZoomStyle = (): CSSProperties => {
    const frame = imageFrameRef.current;

    if (!frame) {
      return {};
    }

    const source = frame.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const controlsHeight = 76;
    const horizontalPadding = viewportWidth < 768 ? 16 : 40;
    const verticalPadding = viewportWidth < 768 ? 40 : 52;
    const availableWidth = Math.max(240, viewportWidth - horizontalPadding);
    const availableHeight = Math.max(
      280,
      viewportHeight - controlsHeight - verticalPadding,
    );
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
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    setZoomStyle(getZoomStyle());
    setIsDetailZoomed(false);
    setIsDraggingZoomedImage(false);
    setZoomPan({ x: 0, y: 0 });
    setViewerPhase("opening");
    setIsViewerMounted(true);
  };

  const closeViewer = useCallback(() => {
    setViewerPhase("closing");

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

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
    if (event.target === event.currentTarget) {
      closeViewer();
    }
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
    if (!isDetailZoomed) {
      return;
    }

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
    if (!isDetailZoomed || !isDraggingZoomedImage) {
      return;
    }

    const nextX =
      dragStartRef.current.panX + event.clientX - dragStartRef.current.pointerX;
    const nextY =
      dragStartRef.current.panY + event.clientY - dragStartRef.current.pointerY;
    const movedDistance = Math.hypot(
      event.clientX - dragStartRef.current.pointerX,
      event.clientY - dragStartRef.current.pointerY,
    );

    if (movedDistance > 4) {
      dragMovedRef.current = true;
    }

    setZoomPan({
      x: Math.max(-260, Math.min(260, nextX)),
      y: Math.max(-260, Math.min(260, nextY)),
    });
  };

  const handleZoomImagePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (isDetailZoomed) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDraggingZoomedImage(false);
  };

  useEffect(() => {
    if (!isViewerMounted) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (event.key === "ArrowLeft") {
        showPreviousImage();
      }

      if (event.key === "ArrowRight") {
        showNextImage();
      }
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
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-24 text-[#171717] sm:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section className="grid gap-3 sm:grid-cols-[1fr_126px]">
          <div
            ref={imageFrameRef}
            className="group relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-white"
            onClick={openViewer}
          >
            <Image
              src={activeImage}
              alt="Modelo Anguie"
              fill
              priority
              sizes="(min-width: 1024px) 44vw, 92vw"
              className={`object-cover object-center transition-opacity duration-200 ${
                isViewerMounted ? "opacity-0" : "opacity-100"
              }`}
            />
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
            <button
              type="button"
              aria-label="Ampliar imagen"
              onClick={(event) => handleGalleryButtonClick(event, openViewer)}
              className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white/90 text-black opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
            >
              <MagnifyingGlassPlus size={20} weight="regular" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:self-start">
            {productImages.map((image, index) => (
              <button
                key={image}
                type="button"
                aria-label="Cambiar imagen del producto"
                onClick={() => setActiveIndex(index)}
                className={`relative aspect-[3/4] overflow-hidden bg-white ${
                  activeIndex === index ? "ring-1 ring-black" : ""
                }`}
              >
                <Image
                  src={image}
                  alt="Vista del producto"
                  fill
                  sizes="126px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="pt-2 lg:pl-10">
          <nav className="mb-6 flex items-center gap-2 text-[10px] font-light uppercase tracking-widest text-black/50">
            <Link href="/" className="transition-colors hover:text-black">Inicio</Link>
            <span>/</span>
            <Link href="/categorias" className="transition-colors hover:text-black">Mujer</Link>
            <span>/</span>
            <Link href="/categorias" className="transition-colors hover:text-black">Blusas</Link>
            <span>/</span>
            <span className="text-black">Modelo Anguie</span>
          </nav>
          <h1 className="mt-2 text-3xl font-semibold uppercase leading-tight">
            Modelo Anguie
          </h1>
          <p className="mt-5 text-[11px] font-light uppercase">SKU: 10371521</p>
          <p className="mt-5 text-xl font-light">S/. 289.90</p>

          <div className="mt-7">
            <p className="text-sm font-semibold">
              Color: <span className="font-light">{selectedColor}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  aria-label={`Elegir color ${color.name}`}
                  onClick={() => setSelectedColor(color.name)}
                  className={`size-9 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)] ${
                    selectedColor === color.name ? "ring-2 ring-black/70 ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">Talla</p>
              <Link
                href="/guia-de-tallas"
                className="inline-flex h-9 items-center justify-center rounded-md border border-black/15 bg-white px-4 text-[10px] font-light uppercase tracking-[0.06em] text-black transition-colors hover:border-black"
              >
                Guia de tallas
              </Link>
            </div>
            <div className="mt-3 flex gap-3">
              {sizes.map((size) => (
                <button
                  key={size.label}
                  type="button"
                  disabled={!size.inStock}
                  onClick={() => setSelectedSize(size.label)}
                  className={`relative flex size-12 overflow-hidden items-center justify-center rounded-md border text-sm font-light transition-colors ${
                    !size.inStock
                      ? "border-black/10 bg-gray-50 text-black/30 cursor-not-allowed"
                      : selectedSize === size.label
                        ? "border-black bg-white text-black"
                        : "border-black/15 bg-white/75 text-black hover:border-black/50"
                  }`}
                >
                  {size.label}
                  {!size.inStock && (
                    <span className="absolute inset-0 m-auto h-[1px] w-[150%] -rotate-45 bg-black/20" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <button className="mt-8 flex h-14 w-full items-center justify-center bg-[#181516] text-sm font-light uppercase tracking-[0.04em] text-white transition-colors hover:bg-black">
            Añadir al carrito
          </button>

          <div className="mt-5 bg-white">
            <button className="flex w-full items-center justify-between border-b border-black/10 px-3 py-2 text-left text-sm font-light">
              Descripción
              <CaretUp size={14} weight="light" />
            </button>
            <ul className="list-disc px-8 py-4 text-xs font-light leading-6 text-black/75">
              <li>Corte semiceñido</li>
              <li>Mangas acampanadas</li>
              <li>Cierre de botones frontal</li>
              <li>Base principal poliester (100%)</li>
            </ul>
          </div>
        </section>
      </div>

      <section className="mx-auto mt-24 max-w-7xl border-t border-black/10 pt-16">
        <h2 className="text-center text-xl font-light uppercase tracking-[0.12em] sm:text-2xl">
          También te podría interesar
        </h2>

        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-10 xl:gap-12">
          {relatedProducts.map((product, index) => (
            <article key={`${product.name}-${index}`} className="min-w-0">
              <div className="group relative aspect-[3/4] w-full overflow-hidden bg-[#eee9e2]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 30vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: product.position }}
                />
                <Link
                  href="/producto"
                  className="absolute inset-0 z-10"
                  aria-label={`Ver ${product.name}`}
                />
                <div className="absolute inset-x-0 bottom-5 z-20 flex translate-y-3 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    href="/producto"
                    aria-label="Ver producto"
                    className="flex size-8 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white"
                  >
                    <Eye size={18} weight="regular" />
                  </Link>
                  <button
                    type="button"
                    aria-label="Agregar al carrito"
                    className="flex size-8 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white"
                  >
                    <ShoppingCartSimple size={18} weight="regular" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <span
                  aria-label="Color disponible"
                  className="block size-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
                  style={{ backgroundColor: product.swatch }}
                />
                <h2 className="mt-3 text-[12px] font-normal uppercase leading-tight tracking-[0.02em]">
                  {product.name}
                </h2>
                <p className="mt-1 text-[12px] leading-none">{product.price}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {isViewerMounted ? (
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
                src={activeImage}
                alt="Modelo Anguie ampliado"
                width={1600}
                height={2000}
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
            <p className="text-[11px] font-light uppercase tracking-widest text-black/60">Modelo Anguie</p>
            <p className="text-sm font-semibold text-black mt-0.5">S/. 289.90</p>
          </div>
          <button className="flex h-[46px] flex-1 items-center justify-center rounded bg-black px-6 text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/80">
            Añadir
          </button>
        </div>
      </div>
    </main>
  );
}
