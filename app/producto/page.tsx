"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CaretLeft,
  CaretRight,
  CaretUp,
  MagnifyingGlassPlus,
  X,
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

const sizes = ["S", "M", "XL"];

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
          <p className="text-xs font-light uppercase tracking-[0.08em] text-black/70">
            Kiments
          </p>
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
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`flex size-12 items-center justify-center rounded-md border text-sm font-light transition-colors ${
                    selectedSize === size
                      ? "border-black bg-white text-black"
                      : "border-black/15 bg-white/75 text-black hover:border-black/50"
                  }`}
                >
                  {size}
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
    </main>
  );
}
