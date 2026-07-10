"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  CaretLeft,
  CaretRight,
  CaretUp,
  CaretDown,
  Basket as BasketIcon,
  CheckCircle,
  MagnifyingGlassPlus,
  SmileySad,
  X,
  XCircle,
  Spinner,
  Storefront,
  Tag,
  Truck,
} from "@phosphor-icons/react";
import {
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MAX_CART_QUANTITY_PER_VARIANT, useCart } from "@/components/CartProvider";
import { ProductCarousel } from "@/components/ProductCarousel";
import { fetchProductoBySlug, fetchProductoColorStock, fetchProductoVarianteStock, buildImageUrl } from "@/lib/api";
import type { ProductoDetalleResponse, ProductoColorStockResponse, ColorDetalle, VarianteProducto } from "@/types/producto";

interface CartNotice {
  type: "success" | "error";
  title: string;
  productName: string;
  detail: string;
}

type AddButtonState = "idle" | "loading" | "success";

export default function ProductoDetallePage() {
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const colorParam = searchParams.get("color");
  const { addItem } = useCart();

  const [data, setData] = useState<ProductoDetalleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Zoom viewer
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isViewerMounted, setIsViewerMounted] = useState(false);
  const [viewerPhase, setViewerPhase] = useState<"opening" | "closing">("opening");
  const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null);
  const [viewerSubtitle, setViewerSubtitle] = useState("");
  const [viewerMode, setViewerMode] = useState<"gallery" | "size-guide">("gallery");
  const [zoomStyle, setZoomStyle] = useState<CSSProperties>({});
  const [isDetailZoomed, setIsDetailZoomed] = useState(false);
  const [isDraggingZoomedImage, setIsDraggingZoomedImage] = useState(false);
  const [zoomPan, setZoomPan] = useState({ x: 0, y: 0 });
  const imageFrameRef = useRef<HTMLDivElement | null>(null);
  const sizeGuideButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const addedTimerRef = useRef<number | null>(null);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, panX: 0, panY: 0 });
  const dragMovedRef = useRef(false);

  // Gallery scroll refs
  const desktopGalleryRef = useRef<HTMLDivElement | null>(null);
  const mobileGalleryRef = useRef<HTMLDivElement | null>(null);
  const desktopGalleryItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileGalleryItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const scrollUp = () => {
    desktopGalleryRef.current?.scrollBy({ top: -210, behavior: "smooth" });
  };
  const scrollDown = () => {
    desktopGalleryRef.current?.scrollBy({ top: 210, behavior: "smooth" });
  };
  // Selections
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [addedVariantId, setAddedVariantId] = useState<number | null>(null);
  const [cartNotice, setCartNotice] = useState<CartNotice | null>(null);
  const [addButtonState, setAddButtonState] = useState<AddButtonState>("idle");
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const buttonStateTimerRef = useRef<number | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    return () => {
      if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
      if (buttonStateTimerRef.current) window.clearTimeout(buttonStateTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
      setNotFound(false);
      setSelectedColorIndex(0);
      setSelectedSize(null);
      setActiveImageIndex(0);

      fetchProductoBySlug(slug)
        .then((res) => {
          if (cancelled) return;
          const colorId = colorParam ? Number(colorParam) : null;
          let nextColorIndex = 0;
          if (colorId && res.colores.length > 0) {
            const index = res.colores.findIndex((c) => c.color.idColor === colorId);
            if (index >= 0) nextColorIndex = index;
          }
          setSelectedColorIndex(nextColorIndex);
          setData(res);
          setSelectedQuantity(1);
        })
        .catch((err) => {
          if (cancelled) return;
          if (err instanceof Error && err.message.includes("404")) {
            setNotFound(true);
          } else {
            setError(err instanceof Error ? err.message : "Error al cargar producto");
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [slug, colorParam]);

  // Canonical URL for SEO (strip color query param)
  useEffect(() => {
    if (!slug || typeof window === "undefined") return;
    const canonicalUrl = `${window.location.origin}/productos/${slug}`;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonicalUrl;
  }, [slug]);

  const currentColor: ColorDetalle | null =
    data && data.colores.length > 0 ? data.colores[selectedColorIndex] ?? data.colores[0] : null;
  const currentColorId = currentColor?.color.idColor;

  const applyStockToColor = useCallback((stock: ProductoColorStockResponse) => {
    setData((prev) =>
      prev
        ? {
            ...prev,
            colores: prev.colores.map((color) =>
              color.color.idColor === stock.color.idColor
                ? {
                    ...color,
                    estadoStock: stock.estadoStock,
                    stockTotalColor: stock.stockTotalColor,
                    variantes: stock.variantes,
                  }
                : color,
            ),
          }
        : prev,
    );
  }, []);

  useEffect(() => {
    if (!slug || !currentColorId) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setStockLoading(true);
      setStockError(null);
      fetchProductoColorStock(slug, currentColorId)
        .then((stock) => {
          if (!cancelled) applyStockToColor(stock);
        })
        .catch((err) => {
          if (!cancelled) setStockError(err instanceof Error ? err.message : "No se pudo verificar stock");
        })
        .finally(() => {
          if (!cancelled) setStockLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [slug, currentColorId, applyStockToColor]);

  const images = (currentColor?.imagenes ?? []).filter((img) => img.url || img.urlThumb);

  const safeActiveIndex =
    activeImageIndex >= images.length ? 0 : activeImageIndex;

  const activeImageUrl = images[safeActiveIndex]
    ? buildImageUrl(images[safeActiveIndex].url || images[safeActiveIndex].urlThumb)
    : null;
  const sizeGuideImageUrl = buildImageUrl(
    data?.producto.guiaTallasUrl || data?.producto.guiaTallasThumbUrl,
  );

  // Flat list of real color images only. Colors without photos use the main placeholder.
  const allImages = useMemo(
    () =>
      data
        ? data.colores.flatMap((cd, colorIndex) =>
            cd.imagenes
              .filter((img) => img.url || img.urlThumb)
              .map((img, imageIndex) => ({
                img,
                colorIndex,
                imageIndex,
                idColor: cd.color.idColor,
                colorName: cd.color.nombre,
              })),
          )
        : [],
    [data],
  );

  const activeGalleryIndex = allImages.findIndex(
    (item) =>
      item.colorIndex === selectedColorIndex && item.imageIndex === safeActiveIndex,
  );

  const activeGalleryImage =
    activeGalleryIndex >= 0 ? allImages[activeGalleryIndex] : null;

  const viewerColorName = activeGalleryImage?.colorName ?? currentColor?.color.nombre ?? "";

  const showCartNotice = useCallback((notice: CartNotice) => {
    setCartNotice(notice);
    if (addedTimerRef.current) window.clearTimeout(addedTimerRef.current);
    addedTimerRef.current = window.setTimeout(() => {
      setAddedVariantId(null);
      setCartNotice(null);
      setAddButtonState("idle");
    }, 1800);
  }, []);

  const getGalleryKey = (idColor: number, imageIndex: number) => `${idColor}-${imageIndex}`;

  const scrollToColorImage = (colorIndex: number) => {
    const firstImage = allImages.find((item) => item.colorIndex === colorIndex);
    if (!firstImage) return;
    const galleryKey = getGalleryKey(firstImage.idColor, firstImage.imageIndex);
    desktopGalleryItemRefs.current[galleryKey]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
    mobileGalleryItemRefs.current[galleryKey]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const setActiveGalleryImage = useCallback(
    (nextIndex: number) => {
      const nextImage = allImages[nextIndex];
      if (!nextImage) return;
      const nextUrl = buildImageUrl(nextImage.img.url || nextImage.img.urlThumb);
      if (!nextUrl) return;
      if (nextImage.colorIndex !== selectedColorIndex) {
        setSelectedColorIndex(nextImage.colorIndex);
        setSelectedSize(null);
        setSelectedQuantity(1);
      }
      setActiveImageIndex(nextImage.imageIndex);
      setViewerImageUrl(nextUrl);
      setViewerSubtitle(nextImage.colorName);
      const galleryKey = getGalleryKey(nextImage.idColor, nextImage.imageIndex);
      desktopGalleryItemRefs.current[galleryKey]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      mobileGalleryItemRefs.current[galleryKey]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    },
    [allImages, selectedColorIndex],
  );

  const variants: VarianteProducto[] = currentColor?.variantes
    ? currentColor.variantes.toSorted((a, b) => {
        const na = Number(a.talla.nombre);
        const nb = Number(b.talla.nombre);
        if (!isNaN(na) && !isNaN(nb)) return na - nb;
        return a.talla.nombre.localeCompare(b.talla.nombre);
      })
    : [];

  const currentVariant = selectedSize
    ? variants.find((v) => v.talla.nombre === selectedSize) ?? null
    : null;
  const maxQuantity = currentVariant ? Math.min(currentVariant.stock, MAX_CART_QUANTITY_PER_VARIANT) : 1;
  const hasLowStock = currentVariant ? currentVariant.stock > 0 && currentVariant.stock <= 3 : false;
  const colorOffer =
    variants.length > 0 &&
    variants.every(
      (v) =>
        v.tipoOfertaAplicada !== "NINGUNA" &&
        v.precioVigente === variants[0].precioVigente &&
        v.precioRegular === variants[0].precioRegular,
    )
      ? {
          precioRegular: variants[0].precioRegular,
          precioVigente: variants[0].precioVigente,
        }
      : null;

  const hasOffer =
    currentVariant ? currentVariant.tipoOfertaAplicada !== "NINGUNA" : colorOffer !== null;

  const displayPrice = currentVariant
    ? `S/ ${currentVariant.precioVigente.toFixed(2)}`
    : colorOffer
    ? `S/ ${colorOffer.precioVigente.toFixed(2)}`
    : currentColor
    ? currentColor.precioMinimo === currentColor.precioMaximo
      ? `S/ ${currentColor.precioMinimo.toFixed(2)}`
      : `S/ ${currentColor.precioMinimo.toFixed(2)} - S/ ${currentColor.precioMaximo.toFixed(2)}`
    : "";
  const sameProductCombo = data?.promocionesCombo?.find((promo) => promo.mismoProducto) ?? null;
  const otherCombos = data?.promocionesCombo?.filter((promo) => !promo.mismoProducto) ?? [];

  const addedCurrentVariant =
    currentVariant?.idProductoVariante === addedVariantId;

  const variantTitle = (variant: VarianteProducto) => {
    if (!variant.disponible) return "Agotado";
    return variant.tipoOfertaAplicada !== "NINGUNA"
      ? `Oferta S/ ${variant.precioVigente.toFixed(2)}`
      : "Disponible";
  };

  const animateAddedImageToCart = (image: string | null) => {
    if (!image) return;
    const source = addButtonRef.current;
    const target = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).find(
      (element) => element.getClientRects().length > 0,
    );
    if (!source || !target) return;

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.bottom + 48;
    const midX = endX - startX;
    const midY = endY - startY;
    const arcY = Math.min(midY, -190);
    const flyingImage = document.createElement("img");
    flyingImage.src = image;
    flyingImage.alt = "";
    flyingImage.style.cssText =
      `position:fixed;left:${startX}px;top:${startY}px;width:52px;height:70px;object-fit:cover;z-index:90;pointer-events:none;box-shadow:0 12px 24px rgba(0,0,0,.16);transform:translate(-50%,-50%);`;
    document.body.appendChild(flyingImage);

    flyingImage
      .animate(
        [
          {
            transform: "translate(-50%,-50%) scale(1) rotate(0deg)",
            opacity: 1,
          },
          {
            transform: `translate(calc(-50% + ${midX * 0.42}px), calc(-50% + ${arcY}px)) scale(.9) rotate(-6deg)`,
            opacity: 0.95,
            offset: 0.5,
          },
          {
            transform: `translate(calc(-50% + ${midX}px), calc(-50% + ${midY}px)) scale(.22) rotate(0deg)`,
            opacity: 0.2,
          },
        ],
        { duration: 2700, easing: "cubic-bezier(.22,.75,.2,1)" },
      )
      .finished.finally(() => flyingImage.remove());
  };

  const handleAddToCart = async () => {
    if (!data || !currentColor || !currentVariant || !currentVariant.disponible) {
      return;
    }

    setAddButtonState("loading");
    let freshVariant = currentVariant;
    try {
      freshVariant = await fetchProductoVarianteStock(slug, currentVariant.idProductoVariante, { fresh: true });
    } catch (err) {
      setAddButtonState("idle");
      setStockError(err instanceof Error ? err.message : "No se pudo verificar stock");
      return;
    }
    if (!freshVariant.disponible || freshVariant.stock <= 0) {
      setAddButtonState("idle");
      showCartNotice({
        type: "error",
        title: "Esta talla ya no tiene stock",
        productName: data.producto.nombre,
        detail: `${currentColor.color.nombre} / ${freshVariant.talla.nombre}`,
      });
      return;
    }

    const quantity = Math.max(1, Math.min(selectedQuantity, freshVariant.stock, MAX_CART_QUANTITY_PER_VARIANT));

    const image =
      currentColor.imagenPrincipal?.origen === "COLOR"
        ? buildImageUrl(currentColor.imagenPrincipal.url || currentColor.imagenPrincipal.urlThumb)
        : null;

    window.clearTimeout(buttonStateTimerRef.current ?? undefined);
    buttonStateTimerRef.current = window.setTimeout(() => {
      const result = addItem({
        idProducto: data.producto.idProducto,
        slug: data.producto.slug,
        idProductoVariante: freshVariant.idProductoVariante,
        name: data.producto.nombre,
        colorName: currentColor.color.nombre,
        colorHex: currentColor.color.hex,
        sizeName: freshVariant.talla.nombre,
        price: freshVariant.precioVigente,
        quantity,
        stock: freshVariant.stock,
        image,
      });

      if (result === "added") {
        setAddedVariantId(freshVariant.idProductoVariante);
        setAddButtonState("success");
        animateAddedImageToCart(image ?? "/ico/KimentsLogo.ico");
      } else {
        setAddButtonState("idle");
      }

      showCartNotice({
        type: result === "added" ? "success" : "error",
        title:
          result === "added"
            ? "Producto agregado correctamente"
            : result === "max"
            ? "Tu carrito ya tiene la cantidad máxima de este artículo"
            : "No se pudo agregar el producto",
        productName: data.producto.nombre,
        detail: `${currentColor.color.nombre} / ${freshVariant.talla.nombre}`,
      });
    }, 280);
  };

  // Zoom handlers
  const showPreviousImage = useCallback(() => {
    setIsDetailZoomed(false);
    setIsDraggingZoomedImage(false);
    setZoomPan({ x: 0, y: 0 });
    if (viewerMode !== "gallery") return;
    if (allImages.length <= 1) return;
    const nextIndex =
      activeGalleryIndex <= 0 ? allImages.length - 1 : activeGalleryIndex - 1;
    setActiveGalleryImage(nextIndex);
  }, [activeGalleryIndex, allImages.length, setActiveGalleryImage, viewerMode]);

  const showNextImage = useCallback(() => {
    setIsDetailZoomed(false);
    setIsDraggingZoomedImage(false);
    setZoomPan({ x: 0, y: 0 });
    if (viewerMode !== "gallery") return;
    if (allImages.length <= 1) return;
    const nextIndex =
      activeGalleryIndex >= allImages.length - 1 ? 0 : activeGalleryIndex + 1;
    setActiveGalleryImage(nextIndex);
  }, [activeGalleryIndex, allImages.length, setActiveGalleryImage, viewerMode]);

  const getZoomStyle = (sourceElement: HTMLElement | null): CSSProperties => {
    const frame = sourceElement;
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

  const openViewer = (
    sourceElement: HTMLElement | null = imageFrameRef.current,
    imageUrl = activeImageUrl,
    subtitle = viewerColorName,
    mode: "gallery" | "size-guide" = "gallery",
  ) => {
    if (!imageUrl) return;
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setViewerImageUrl(imageUrl);
    setViewerSubtitle(subtitle);
    setViewerMode(mode);
    setZoomStyle(getZoomStyle(sourceElement));
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
      setViewerImageUrl(null);
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
    const panSensitivity = 1.55;
    const nextX =
      dragStartRef.current.panX +
      (event.clientX - dragStartRef.current.pointerX) * panSensitivity;
    const nextY =
      dragStartRef.current.panY +
      (event.clientY - dragStartRef.current.pointerY) * panSensitivity;
    const movedDistance = Math.hypot(
      event.clientX - dragStartRef.current.pointerX,
      event.clientY - dragStartRef.current.pointerY,
    );
    if (movedDistance > 4) dragMovedRef.current = true;
    setZoomPan({
      x: Math.max(-380, Math.min(380, nextX)),
      y: Math.max(-380, Math.min(380, nextY)),
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
      if (viewerMode === "gallery" && event.key === "ArrowLeft") showPreviousImage();
      if (viewerMode === "gallery" && event.key === "ArrowRight") showNextImage();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeViewer, isViewerMounted, showNextImage, showPreviousImage, viewerMode]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-24 text-[#171717] sm:px-10 lg:px-16 xl:px-24">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,1fr)] lg:gap-12">
          <section className="grid gap-3 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start">
            <div className="order-2 flex gap-3 overflow-hidden lg:order-1 lg:flex-col">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 min-w-16 flex-1 animate-pulse rounded-sm bg-black/10 sm:h-24 lg:h-auto lg:min-w-0 lg:w-full lg:aspect-[3/4] lg:flex-none"
                />
              ))}
            </div>
            <div className="order-1 animate-pulse overflow-hidden rounded-sm bg-black/10 aspect-[4/5] min-h-[380px] w-full sm:min-h-[520px] lg:order-2 lg:min-h-[640px]" />
          </section>

          <section className="animate-pulse">
            <div className="mx-auto flex max-w-xl flex-col gap-4 lg:mx-0 lg:max-w-none">
              <div className="h-4 w-24 rounded bg-black/10" />
              <div className="space-y-3">
                <div className="h-10 w-full max-w-[28rem] rounded bg-black/10 sm:h-12" />
                <div className="h-10 w-5/6 rounded bg-black/10 sm:hidden" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-28 rounded bg-black/10" />
                <div className="h-4 w-16 rounded bg-black/5" />
              </div>
              <div className="mt-2 h-px w-full bg-black/10" />

              <div className="mt-2 space-y-3">
                <div className="h-4 w-28 rounded bg-black/10" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="size-8 rounded-full bg-black/10 sm:size-9" />
                  ))}
                </div>
              </div>

              <div className="mt-1 space-y-3">
                <div className="h-4 w-20 rounded bg-black/10" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-9 w-11 rounded-sm border border-black/10 bg-black/5 sm:h-10 sm:w-14"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-1 flex items-end gap-4">
                <div className="h-4 w-24 rounded bg-black/10" />
                <div className="h-8 w-28 rounded bg-black/10" />
              </div>

              <div className="grid gap-3 pt-4 sm:grid-cols-[140px_minmax(0,1fr)]">
                <div className="h-12 rounded-md bg-black/10" />
                <div className="h-12 rounded-md bg-black/10" />
              </div>

              <div className="space-y-3 pt-4">
                <div className="h-4 w-32 rounded bg-black/10" />
                <div className="h-4 w-full rounded bg-black/5" />
                <div className="h-4 w-[92%] rounded bg-black/5" />
                <div className="h-4 w-4/5 rounded bg-black/5" />
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1f3]">
        <div className="flex flex-col items-center gap-4 text-center">
          <SmileySad size={48} weight="light" className="text-black/25" />
          <p className="text-lg font-light text-black/40">Producto no encontrado</p>
          <Link
            href="/productos"
            className="text-[13px] font-light text-black/60 underline hover:text-black transition-colors"
          >
            Regresar a productos
          </Link>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1f3]">
        <div className="flex flex-col items-center gap-4 text-center">
          <SmileySad size={48} weight="light" className="text-black/25" />
          <p className="text-sm font-light text-black/50">{error}</p>
          <Link
            href="/productos"
            className="text-[13px] font-light text-black/60 underline hover:text-black transition-colors"
          >
            Regresar a productos
          </Link>
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

  const descripcionProducto = data.producto.descripcion?.trim();

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-24 text-[#171717] sm:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section className="grid gap-3 sm:grid-cols-[1fr_96px]">
          <div
            ref={imageFrameRef}
            className={`animate-product-image-enter group relative aspect-[3/4] max-h-[420px] overflow-hidden bg-white sm:max-h-none ${
              activeImageUrl ? "cursor-zoom-in" : ""
            }`}
            onClick={activeImageUrl ? () => openViewer() : undefined}
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

            {allImages.length > 1 && (
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

            {activeImageUrl && (
              <button
                type="button"
                aria-label="Ampliar imagen"
                onClick={(event) => handleGalleryButtonClick(event, () => openViewer())}
                className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white/90 text-black opacity-0 shadow-sm transition-opacity hover:bg-white group-hover:opacity-100"
              >
                <MagnifyingGlassPlus size={20} weight="regular" />
              </button>
            )}

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

          {/* Vertical gallery (desktop) — hidden scrollbar + arrows */}
          {allImages.length > 0 && (
          <div className="hidden sm:flex sm:flex-col sm:gap-1 animate-product-enter" style={{ animationDelay: "120ms", maxHeight: "620px" }}>
            <button
              type="button"
              aria-label="Desplazar arriba"
              onClick={scrollUp}
              className="flex shrink-0 items-center justify-center h-6 bg-[#fafafa] border border-gray-200 rounded-sm text-black/40 hover:text-black hover:border-black transition-colors"
            >
              <CaretUp size={12} weight="bold" />
            </button>
            <div
              ref={desktopGalleryRef}
              className="flex flex-col gap-2 overflow-y-scroll [&::-webkit-scrollbar]:hidden py-1 pr-1"
              style={{ scrollbarWidth: "none" }}
            >
              {allImages.map((item) => {
                const thumbUrl = buildImageUrl(item.img.url || item.img.urlThumb);
                if (!thumbUrl) return null;
                const isActive = item.colorIndex === selectedColorIndex && item.imageIndex === safeActiveIndex;
                const galleryKey = getGalleryKey(item.idColor, item.imageIndex);
                return (
                  <button
                    key={`v-${galleryKey}`}
                    ref={(node) => {
                      desktopGalleryItemRefs.current[galleryKey] = node;
                    }}
                    type="button"
                    aria-label={`Ver imagen ${item.colorName}`}
                    onClick={() => {
                      if (item.colorIndex !== selectedColorIndex) {
                        setSelectedColorIndex(item.colorIndex);
                        setSelectedSize(null);
                      }
                      setActiveImageIndex(item.imageIndex);
                    }}
                    className={`relative aspect-[3/4] shrink-0 overflow-hidden bg-white transition-all ${
                      isActive ? "ring-1 ring-black" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={thumbUrl}
                      alt={`${data.producto.nombre} - ${item.colorName}`}
                      fill
                      unoptimized
                      sizes="96px"
                      className="object-cover object-center"
                    />
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              aria-label="Desplazar abajo"
              onClick={scrollDown}
              className="flex shrink-0 items-center justify-center h-6 bg-[#fafafa] border border-gray-200 rounded-sm text-black/40 hover:text-black hover:border-black transition-colors"
            >
              <CaretDown size={12} weight="bold" />
            </button>
          </div>
          )}
        </section>

        {/* Horizontal gallery strip (mobile) — hidden scrollbar + arrows */}
        {allImages.length > 0 && (
        <div
          ref={mobileGalleryRef}
          className="animate-product-enter flex sm:hidden gap-2 overflow-x-scroll w-full [&::-webkit-scrollbar]:hidden pb-1"
          style={{ animationDelay: "120ms", scrollbarWidth: "none" }}
        >
            {allImages.map((item) => {
              const thumbUrl = buildImageUrl(item.img.url || item.img.urlThumb);
              if (!thumbUrl) return null;
              const isActive = item.colorIndex === selectedColorIndex && item.imageIndex === safeActiveIndex;
              const galleryKey = getGalleryKey(item.idColor, item.imageIndex);
              return (
                <button
                  key={`h-${galleryKey}`}
                  ref={(node) => {
                    mobileGalleryItemRefs.current[galleryKey] = node;
                  }}
                  type="button"
                  aria-label={`Ver imagen ${item.colorName}`}
                  onClick={() => {
                    if (item.colorIndex !== selectedColorIndex) {
                      setSelectedColorIndex(item.colorIndex);
                      setSelectedSize(null);
                    }
                    setActiveImageIndex(item.imageIndex);
                  }}
                  className={`relative aspect-[3/4] h-32 shrink-0 overflow-hidden bg-white transition-all ${
                    isActive ? "ring-1 ring-black" : "opacity-50"
                  }`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`${data.producto.nombre} - ${item.colorName}`}
                    fill
                    unoptimized
                    sizes="64px"
                    className="object-cover object-center"
                  />
                </button>
              );
            })}
          </div>
        )}

        <section className="pt-2 lg:pl-10">
          <h1 className="animate-product-enter mt-2 text-3xl font-semibold uppercase leading-tight" style={{ animationDelay: "80ms" }}>
            {data.producto.nombre}
          </h1>

          {currentVariant && (
            <p className="animate-product-enter mt-5 text-[11px] font-light uppercase" style={{ animationDelay: "140ms" }}>SKU: {currentVariant.sku}</p>
          )}

          <div className="animate-product-enter mt-5" style={{ animationDelay: "180ms" }}>
            {hasOffer ? (
              <div className="flex items-baseline gap-3">
                <span className="text-xl font-semibold text-red-700">
                  {displayPrice}
                </span>
                <span className="text-base font-light text-black/40 line-through">
                  S/ {(currentVariant?.precioRegular ?? colorOffer!.precioRegular).toFixed(2)}
                </span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5">
                  Oferta
                </span>
              </div>
            ) : (
              <p className="text-xl font-light">{displayPrice}</p>
            )}
            {sameProductCombo && (
              <div className="relative z-40 mt-3 inline-flex items-center gap-2 bg-emerald-700 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white">
                <Tag size={14} weight="regular" />
                <span>
                  Oferta 2 x S/ {sameProductCombo.precioCombo.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          <div className="animate-product-enter mt-7" style={{ animationDelay: "220ms" }}>
            <p className="text-sm font-semibold">
              Color: <span className="font-light">{currentColor.color.nombre}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {data.colores.map((cd, index) => {
                const isSelected = index === selectedColorIndex;
                const isSoldOut = cd.estadoStock === "AGOTADO";
                return (
                  <span key={cd.color.idColor} className="color-tooltip">
                    <button
                      type="button"
                    aria-label={`Elegir color ${cd.color.nombre}`}
                    onClick={() => {
                      setSelectedColorIndex(index);
                      setSelectedSize(null);
                      setSelectedQuantity(1);
                      setActiveImageIndex(0);
                      window.requestAnimationFrame(() => scrollToColorImage(index));
                    }}
                    className={`relative size-9 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)] transition-all ${
                      isSelected ? "ring-2 ring-black/70 ring-offset-2 scale-110" : ""
                    }`}
                    style={{ backgroundColor: cd.color.hex }}
                    title={`${cd.color.nombre}${isSoldOut ? " (Agotado)" : ""} — S/ ${cd.precioMinimo.toFixed(2)}${cd.precioMinimo !== cd.precioMaximo ? ` - S/ ${cd.precioMaximo.toFixed(2)}` : ""}`}
                  />
                    <span className={`color-tooltip-bubble ${isSoldOut ? "color-tooltip-bubble--sold-out" : ""}`}>
                      {cd.color.nombre}{isSoldOut ? " · Agotado" : ""}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>

          <div className="animate-product-enter mt-7" style={{ animationDelay: "260ms" }}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">
                Talla{selectedSize ? ` · ${selectedSize}` : ""}
              </p>
              {sizeGuideImageUrl ? (
                <button
                  ref={sizeGuideButtonRef}
                  type="button"
                  onClick={() =>
                    openViewer(
                      sizeGuideButtonRef.current,
                      sizeGuideImageUrl,
                      "Guia de tallas",
                      "size-guide",
                    )
                  }
                  className="inline-flex h-9 items-center justify-center rounded-md border border-black/15 bg-white px-4 text-[10px] font-light uppercase tracking-[0.06em] text-black transition-colors hover:border-black"
                >
                  Guia de tallas
                </button>
              ) : null}
            </div>
            <div className="mt-3 flex gap-3">
              {variants.map((v) => (
                <button
                  key={v.idProductoVariante}
                  type="button"
                  disabled={stockLoading || !v.disponible}
                  onClick={() => {
                    setSelectedSize(v.talla.nombre);
                    setSelectedQuantity(1);
                  }}
                  className={`relative flex size-12 overflow-hidden items-center justify-center rounded-md border text-sm font-light transition-colors ${
                    stockLoading || !v.disponible
                      ? "border-black/10 bg-gray-50 text-black/30 cursor-not-allowed"
                      : selectedSize === v.talla.nombre
                        ? "border-black bg-white text-black"
                        : "border-black/15 bg-white/75 text-black hover:border-black/50"
                  }`}
                  title={
                    v.disponible
                      ? variantTitle(v)
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
            {!selectedSize && (
              <p className="mt-2 text-[12px] font-light text-black/30">
                Selecciona una talla
              </p>
            )}
            {stockError && (
              <p className="mt-2 text-[12px] font-medium text-red-600">
                No se pudo verificar stock. Intenta nuevamente.
              </p>
            )}
            {hasLowStock && (
              <p className="mt-2 text-[12px] font-medium text-amber-600">
                Últimas unidades
              </p>
            )}
          </div>

          <div className="animate-product-enter mt-8 flex gap-3" style={{ animationDelay: "300ms" }}>
            <div className="grid h-14 w-[126px] shrink-0 grid-cols-3 border border-[#e8e1dc] bg-white text-sm text-black">
              <button
                type="button"
                aria-label="Disminuir cantidad"
                disabled={!currentVariant || selectedQuantity <= 1 || addButtonState === "loading"}
                onClick={() => setSelectedQuantity((quantity) => Math.max(1, quantity - 1))}
                className="flex items-center justify-center text-xl font-light transition-colors hover:bg-[#f8f3ef] disabled:cursor-not-allowed disabled:opacity-30"
              >
                -
              </button>
              <span className="flex items-center justify-center font-light">
                {selectedQuantity}
              </span>
              <button
                type="button"
                aria-label="Aumentar cantidad"
                disabled={
                  !currentVariant ||
                  !currentVariant.disponible ||
                  stockLoading ||
                  selectedQuantity >= maxQuantity ||
                  addButtonState === "loading"
                }
                onClick={() => setSelectedQuantity((quantity) => Math.min(maxQuantity, quantity + 1))}
                className="flex items-center justify-center text-xl font-light transition-colors hover:bg-[#f8f3ef] disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>

            <button
              ref={addButtonRef}
              type="button"
              onClick={handleAddToCart}
              disabled={!currentVariant || !currentVariant.disponible || stockLoading || addButtonState === "loading"}
              className="flex h-14 flex-1 items-center justify-center gap-2 bg-[#181516] px-4 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:bg-black/25"
            >
              {addButtonState === "loading" ? (
                <>
                  <Spinner size={18} className="animate-spin" />
                  Agregando
                </>
              ) : addButtonState === "success" && addedCurrentVariant ? (
                <>
                  <CheckCircle size={18} weight="fill" />
                  Añadido
                </>
              ) : (
                <>
                  <BasketIcon size={18} weight="fill" />
                  {currentColor.estadoStock === "AGOTADO"
                    ? "Agotado"
                    : !currentVariant
                    ? "Elige una talla"
                    : "Agregar al carrito"}
                </>
              )}
            </button>
          </div>

          <div className="animate-product-enter mt-5 space-y-3 border-y border-black/10 py-4 text-[13px] font-light text-black" style={{ animationDelay: "340ms" }}>
            <div className="flex items-center gap-3">
              <Truck size={20} weight="fill"  className="text-black" />
              <span>Envios a todo el Perú</span>
            </div>
          </div>

          {descripcionProducto && (
            <div className="animate-product-enter mt-5 bg-white" style={{ animationDelay: "380ms" }}>
              <button type="button" className="flex w-full items-center justify-between border-b border-black/10 px-3 py-2 text-left text-sm font-light">
                Descripción
                <CaretUp size={14} weight="light" />
              </button>
              <div className="px-8 py-4 text-xs font-light leading-6 text-black/75">
                {descripcionProducto}
              </div>
            </div>
          )}
          {otherCombos.length > 0 && (
            <div className="animate-product-enter mt-5 bg-white" style={{ animationDelay: "400ms" }}>
              <div className="border-b border-black/10 px-3 py-2 text-sm font-light">
                Producto en promoci&oacute;n:
              </div>
              <div className="space-y-3 px-8 py-4 text-xs font-light leading-6 text-black/75">
                {otherCombos.map((combo) => (
                  <div key={combo.idPromocionCombo} className="flex items-start gap-2">
                    <Tag size={15} weight="regular" className="mt-1 shrink-0 text-emerald-700" />
                    <div className="min-w-0">
                      <p className="font-medium uppercase tracking-[0.04em] text-black">
                        Promocion {combo.regla}
                      </p>
                      <p className="text-emerald-700">Precio combo S/ {combo.precioCombo.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {data.recomendados.length > 0 && (
        <section className="-mx-6 mt-20 px-4 py-10 text-[#242424] sm:-mx-10 sm:px-6 lg:-mx-16 lg:px-8 xl:-mx-24 xl:px-10">
          <h2 className="mb-8 text-center text-lg font-light uppercase tracking-[0.12em] text-black">
            Productos que te pueden gustar
          </h2>
          <ProductCarousel items={data.recomendados} />
        </section>
      )}

      {isViewerMounted && viewerImageUrl ? (
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

          <div className="absolute left-5 top-5 z-10 max-w-[calc(100%-5.5rem)]">
            <p className="mt-1 text-sm font-light uppercase tracking-[0.08em] text-black sm:text-base">
              {data.producto.nombre}
            </p>
            <p className="mt-1 text-[10px] font-light uppercase tracking-[0.18em] text-black/45">
              {viewerSubtitle}
            </p>
          </div>

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
                src={viewerImageUrl}
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
            {viewerMode === "gallery" ? (
              <button
                type="button"
                aria-label="Imagen anterior"
                onClick={showPreviousImage}
                className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black"
              >
                <CaretLeft size={18} weight="bold" />
              </button>
            ) : null}
            <button
              type="button"
              aria-label="Cerrar vista ampliada"
              onClick={closeViewer}
              className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black"
            >
              <X size={18} weight="regular" />
            </button>
            {viewerMode === "gallery" ? (
              <button
                type="button"
                aria-label="Imagen siguiente"
                onClick={showNextImage}
                className="flex size-11 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:border-black"
              >
                <CaretRight size={18} weight="bold" />
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {cartNotice && (
        <div className="cart-alert fixed left-4 right-4 top-14 z-[70] mx-auto border border-black/10 bg-white px-4 py-3 text-black shadow-[0_12px_32px_rgba(0,0,0,0.12)] sm:top-16 sm:left-1/2 sm:right-auto sm:w-[420px] sm:-translate-x-1/2 lg:left-auto lg:right-6 lg:top-24 lg:w-[360px] lg:translate-x-0">
          <div className="flex items-start gap-3">
            {cartNotice.type === "success" ? (
              <CheckCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-green-600" />
            ) : (
              <XCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-red-600" />
            )}
            <div className="min-w-0">
              <p className="text-[12px] font-medium uppercase tracking-[0.08em]">
                {cartNotice.title}
              </p>
              <p className="mt-1 truncate text-[13px] font-light text-black/60">
                {cartNotice.productName} · {cartNotice.detail}
              </p>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
