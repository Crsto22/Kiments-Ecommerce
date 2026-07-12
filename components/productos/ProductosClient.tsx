"use client";

import Image from "next/image";
import Link from "next/link";
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
import {
  CaretUp,
  CaretLeft,
  CaretRight,
  Columns,
  Eye,
  GridFour,
  Rows,
  SlidersHorizontal,
  X,
  Warning,
  Storefront,
} from "@phosphor-icons/react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchProductos, buildImageUrl } from "@/lib/api";
import type { ProductoItem } from "@/types/producto";

type ViewMode = "compact" | "normal" | "wide";
const SIZE_FILTERS = ["XS", "S", "M", "L"];
const PRICE_LIMIT = 2000;

// Map API item to card format used by the UI
interface ProductCard {
  idProducto: number;
  idColor: number;
  slug: string;
  name: string;
  priceLabel: string;
  priceMin: number;
  priceMax: number;
  image: string | null;
  hasImage: boolean;
  colorHex: string;
  colorName: string;
  sizes: { label: string; disponible: boolean; stock: number }[];
  estadoStock: string;
  comboPrecio: number | null;
  preventa: boolean;
}

function mapProductoToCard(item: ProductoItem): ProductCard {
  // Sort variants by talla, try numeric then alpha
  const sorted = item.variantes.toSorted((a, b) => {
    const na = Number(a.talla.nombre);
    const nb = Number(b.talla.nombre);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.talla.nombre.localeCompare(b.talla.nombre);
  });

  const sizes = sorted.map((v) => ({
    label: v.talla.nombre,
    disponible: v.disponible,
    stock: v.stock,
  }));

  const priceMin = item.precioMinimo;
  const priceMax = item.precioMaximo;
  const priceLabel =
    priceMin === priceMax
      ? `S/ ${priceMin.toFixed(2)}`
      : `S/ ${priceMin.toFixed(2)} - S/ ${priceMax.toFixed(2)}`;

  const imageUrl =
    item.imagenPrincipal?.origen === "COLOR"
      ? buildImageUrl(item.imagenPrincipal.url || item.imagenPrincipal.urlThumb)
      : null;
  const combo = item.promocionesCombo?.find((promo) => promo.mismoProducto) ?? null;

  return {
    idProducto: item.producto.idProducto,
    idColor: item.color.idColor,
    slug: item.producto.slug,
    name: item.producto.nombre,
    priceLabel,
    priceMin,
    priceMax,
    image: imageUrl,
    hasImage: imageUrl !== null,
    colorHex: item.color.hex,
    colorName: item.color.nombre,
    sizes,
    estadoStock: item.estadoStock,
    comboPrecio: combo?.precioCombo ?? null,
    preventa: item.producto.preventa === true,
  };
}

export default function ProductosPage() {
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(PRICE_LIMIT);
  const [pendingSizes, setPendingSizes] = useState<string[]>([]);
  const [pendingMaxPrice, setPendingMaxPrice] = useState(PRICE_LIMIT);
  const [viewMode, setViewMode] = useState<ViewMode>("normal");

  // API state
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiendaConfigurada, setTiendaConfigurada] = useState(true);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchData = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductos({
        page: pageNum,
        size: pageSize,
        tallas: selectedSizes,
        precioMax: maxPrice,
      });
      setTiendaConfigurada(data.tiendaConfigurada);

      if (!data.tiendaConfigurada) {
        setProducts([]);
        setTotalPages(0);
        setTotalElements(0);
        setLoading(false);
        return;
      }

      const cards = data.content.map(mapProductoToCard);
      setProducts(cards);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar productos",
      );
    } finally {
      setLoading(false);
    }
  }, [maxPrice, selectedSizes]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      fetchData(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    return () => {
      cancelled = true;
    };
  }, [page, fetchData]);

  const goToPage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const filteredProducts = products;
  const hasActiveFilters = selectedSizes.length > 0 || maxPrice < PRICE_LIMIT;
  const selectedSizeSet = useMemo(() => new Set(selectedSizes), [selectedSizes]);

  const sizesDiffer =
    pendingSizes.length !== selectedSizes.length ||
    pendingSizes.some((s) => !selectedSizeSet.has(s));

  const hasPendingChanges = pendingMaxPrice !== maxPrice || sizesDiffer;

  const applyFilters = () => {
    if (!hasPendingChanges) return;
    setSelectedSizes(pendingSizes);
    setMaxPrice(pendingMaxPrice);
    setPage(0);
  };

  const toggleSize = (size: string) => {
    setPendingSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size],
    );
  };

  return (
    <ProductosView
      loading={loading}
      error={error}
      tiendaConfigurada={tiendaConfigurada}
      filteredProducts={filteredProducts}
      products={products}
      hasActiveFilters={hasActiveFilters}
      totalElements={totalElements}
      viewMode={viewMode}
      setViewMode={setViewMode}
      pendingSizes={pendingSizes}
      pendingMaxPrice={pendingMaxPrice}
      setPendingMaxPrice={setPendingMaxPrice}
      hasPendingChanges={hasPendingChanges}
      applyFilters={applyFilters}
      toggleSize={toggleSize}
      fetchData={fetchData}
      page={page}
      totalPages={totalPages}
      goToPage={goToPage}
    />
  );
}

interface ProductosViewProps {
  loading: boolean;
  error: string | null;
  tiendaConfigurada: boolean;
  filteredProducts: ProductCard[];
  products: ProductCard[];
  hasActiveFilters: boolean;
  totalElements: number;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  pendingSizes: string[];
  pendingMaxPrice: number;
  setPendingMaxPrice: React.Dispatch<React.SetStateAction<number>>;
  hasPendingChanges: boolean;
  applyFilters: () => void;
  toggleSize: (size: string) => void;
  fetchData: (pageNum: number) => Promise<void>;
  page: number;
  totalPages: number;
  goToPage: (newPage: number) => void;
}

function ProductosView({
  loading,
  error,
  tiendaConfigurada,
  filteredProducts,
  products,
  hasActiveFilters,
  totalElements,
  viewMode,
  setViewMode,
  pendingSizes,
  pendingMaxPrice,
  setPendingMaxPrice,
  hasPendingChanges,
  applyFilters,
  toggleSize,
  fetchData,
  page,
  totalPages,
  goToPage,
}: Readonly<ProductosViewProps>) {
  const gridColumns =
    viewMode === "compact"
      ? "lg:grid-cols-2"
      : viewMode === "wide"
        ? "lg:grid-cols-4"
        : "lg:grid-cols-3";

  const filtersContent = (
    <>
      <FilterGroup title="Talla">
        {SIZE_FILTERS.map((size) => (
          <label key={size} className="flex items-center gap-3 text-sm font-light cursor-pointer">
            <input
              type="checkbox"
              checked={pendingSizes.includes(size)}
              onChange={() => toggleSize(size)}
              className="size-4 accent-black"
            />
            <span>{size}</span>
          </label>
        ))}
      </FilterGroup>

      <FilterGroup title="Precio">
        <div className="px-1">
          <input
            type="range"
            aria-label="Precio maximo"
            min="0"
            max={PRICE_LIMIT}
            value={pendingMaxPrice}
            onChange={(event) => setPendingMaxPrice(Number(event.target.value))}
            className="w-full accent-black"
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-light">
            <div className="flex h-10 items-center justify-between bg-white px-3">
              <span>S/</span>
              <span>0</span>
            </div>
            <div className="flex h-10 items-center justify-between bg-white px-3">
              <span>S/</span>
              <span>{pendingMaxPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </FilterGroup>

      {hasPendingChanges && (
        <div className="mt-8 hidden lg:block">
          <button
            type="button"
            onClick={applyFilters}
            className="h-12 w-full bg-black text-sm font-light uppercase tracking-[0.14em] text-white transition-colors hover:bg-black/80"
          >
            Aplicar filtros
          </button>
        </div>
      )}
    </>
  );

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-24 text-[#252525] sm:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[240px_1fr]">
        {/* Desktop sidebar filters */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <h1 className="text-3xl font-light">Filtrar por</h1>
          {!loading && filtersContent}
        </aside>

        <section>
          {/* Top bar */}
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center lg:mb-14">
            <div className="flex items-center gap-4">
              <Drawer>
                <DrawerTrigger asChild>
                  <button
                    type="button"
                    aria-label="Filtros"
                    className="flex h-10 items-center gap-2 rounded-md border border-black/15 bg-white px-4 text-sm font-light transition-colors hover:border-black lg:hidden"
                  >
                    <SlidersHorizontal size={16} />
                    Filtrar
                  </button>
                </DrawerTrigger>
                <DrawerContent className="bg-[#f7f1f3]">
                  <DrawerHeader className="border-b border-black/10 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <DrawerTitle className="text-xl font-light">Filtros</DrawerTitle>
                      <DrawerClose asChild>
                        <button type="button" aria-label="Cerrar filtros">
                          <X size={24} weight="thin" />
                        </button>
                      </DrawerClose>
                    </div>
                    <DrawerDescription className="sr-only">
                      Filtra los productos por talla y precio
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {filtersContent}
                  </div>
                  <DrawerFooter className="border-t border-black/10 p-4">
                    {hasPendingChanges && (
                      <DrawerClose asChild>
                        <button
                          type="button"
                          onClick={applyFilters}
                          className="h-12 w-full bg-black text-sm font-light uppercase tracking-widest text-white transition-colors hover:bg-black/80"
                        >
                          Aplicar filtros
                        </button>
                      </DrawerClose>
                    )}
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <p className="hidden text-sm font-light lg:block">Caracteristicas</p>

              {!loading && (
                <span className="text-[13px] font-light text-black/50">
                  {totalElements} producto{totalElements !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <ViewButton
                active={viewMode === "compact"}
                label="Vista compacta"
                onClick={() => setViewMode("compact")}
              >
                <Rows size={17} weight="light" />
              </ViewButton>
              <ViewButton
                active={viewMode === "normal"}
                label="Vista normal"
                onClick={() => setViewMode("normal")}
              >
                <Columns size={17} weight="light" />
              </ViewButton>
              <ViewButton
                active={viewMode === "wide"}
                label="Vista amplia"
                onClick={() => setViewMode("wide")}
              >
                <GridFour size={17} weight="light" />
              </ViewButton>
            </div>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-20 sm:gap-y-14 sm:grid-cols-2 ${gridColumns}`}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-white" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-3/4 bg-black/10 rounded" />
                    <div className="h-3 w-1/3 bg-black/5 rounded" />
                    <div className="mt-3 flex gap-1.5">
                      {Array.from({ length: 4 }).map((__, j) => (
                        <div key={j} className="size-6 bg-black/5 rounded-sm" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Warning size={40} weight="light" className="text-black/30 mb-4" />
              <p className="text-sm font-light text-black/60 mb-2">{error}</p>
              <button
                type="button"
                onClick={() => fetchData(page)}
                className="mt-4 inline-flex h-9 items-center rounded-md border border-black/15 bg-white px-4 text-sm font-light transition-colors hover:border-black"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* TIENDA NO CONFIGURADA */}
          {!loading && !error && !tiendaConfigurada && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Storefront size={40} weight="light" className="text-black/30 mb-4" />
              <p className="text-sm font-light text-black/60">
                Tienda ecommerce no configurada
              </p>
              <p className="mt-1 text-[13px] text-black/40">
                Vuelve pronto. Estamos preparando la tienda.
              </p>
            </div>
          )}

          <ProductResults
            loading={loading}
            error={error}
            tiendaConfigurada={tiendaConfigurada}
            filteredProducts={filteredProducts}
            products={products}
            hasActiveFilters={hasActiveFilters}
            gridColumns={gridColumns}
            page={page}
            totalPages={totalPages}
            goToPage={goToPage}
          />
        </section>
      </div>
    </main>
  );
}

interface ProductResultsProps {
  loading: boolean;
  error: string | null;
  tiendaConfigurada: boolean;
  filteredProducts: ProductCard[];
  products: ProductCard[];
  hasActiveFilters: boolean;
  gridColumns: string;
  page: number;
  totalPages: number;
  goToPage: (newPage: number) => void;
}

function ProductResults({
  loading,
  error,
  tiendaConfigurada,
  filteredProducts,
  products,
  hasActiveFilters,
  gridColumns,
  page,
  totalPages,
  goToPage,
}: Readonly<ProductResultsProps>) {
  return (
    <>
      {/* PRODUCT GRID */}
      {!loading && !error && tiendaConfigurada && (
        <>
        <div
          className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-20 sm:gap-y-14 sm:grid-cols-2 ${gridColumns}`}
        >
          {filteredProducts.map((product, index) => (
            <article
              key={`${product.idProducto}-${product.idColor}`}
              className="animate-product-enter"
              style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
            >
              <div
                className="animate-product-image-enter group relative aspect-[3/4] overflow-hidden bg-white"
                style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
              >
                {product.hasImage ? (
                  <ProductImage src={product.image!} alt={product.name} />
                ) : (
                  <BrandPlaceholder />
                )}
                <Link
                  href={`/productos/${product.slug}?color=${product.idColor}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Ver ${product.name}`}
                />
                <div className="absolute inset-x-0 bottom-6 z-20 flex translate-y-3 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                  <Link
                    href={`/productos/${product.slug}?color=${product.idColor}`}
                    aria-label="Ver producto"
                    className="flex size-8 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white"
                  >
                    <Eye size={18} weight="regular" />
                  </Link>
                </div>
                <div className="absolute left-0 top-0 z-20 flex max-w-[70%] flex-col items-start gap-1">
                  {product.comboPrecio !== null && (
                    <span className="bg-emerald-700 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                      2 por S/ {product.comboPrecio.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.preventa && (
                  <span className="absolute right-0 top-0 z-20 bg-black px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                    Preventa
                  </span>
                )}
                {product.estadoStock === "AGOTADO" && (
                  <span className="absolute bottom-0 left-0 z-20 bg-red-700 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                    Agotado
                  </span>
                )}
                {product.estadoStock === "PARCIAL" && (
                  <span className="absolute bottom-0 left-0 z-20 bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                    Pocas unidades
                  </span>
                )}
              </div>

              <div className="mt-4">
                <Link href={`/productos/${product.slug}`}>
                  <h2 className="text-sm font-light uppercase leading-tight transition-colors hover:text-black/60">
                    {product.name}
                  </h2>
                </Link>

                {/* Color swatch */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="color-tooltip shrink-0">
                    <span
                      aria-label={`Color: ${product.colorName}`}
                      className="block size-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.28)]"
                      style={{ backgroundColor: product.colorHex }}
                    />
                    <span className="color-tooltip-bubble">{product.colorName}</span>
                  </span>
                  <span className="text-[11px] font-light text-black/50 uppercase">
                    {product.colorName}
                  </span>
                </div>

                {/* Price */}
                <p className="mt-2 text-sm font-light">{product.priceLabel}</p>
                {/* Size pills */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.sizes.map((size) => (
                    <span
                      key={size.label}
                      className={`inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-[10px] font-light uppercase ${
                        size.disponible
                          ? "border-black/20 text-black/70"
                          : "border-black/5 text-black/25 line-through"
                      }`}
                      title={
                        size.disponible
                          ? `${size.stock} en stock`
                          : "Agotado"
                      }
                    >
                      {size.label}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* No filter results */}
        {filteredProducts.length === 0 && hasActiveFilters && (
          <p className="mt-20 text-center text-sm font-light">
            No hay productos con esos filtros.
          </p>
        )}

        {/* Completely empty */}
        {products.length === 0 && !hasActiveFilters && (
          <p className="mt-20 text-center text-sm font-light">
            No hay productos disponibles en este momento.
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-14 flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page === 0}
              className="flex items-center gap-1.5 text-[13px] font-light text-black/50 transition-colors hover:text-black disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <CaretLeft size={14} weight="bold" />
              Anterior
            </button>

            <span className="text-[13px] font-light tabular-nums text-black/50">
              {page + 1} de {totalPages}
            </span>

            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 text-[13px] font-light text-black/50 transition-colors hover:text-black disabled:opacity-25 disabled:cursor-not-allowed"
            >
              Siguiente
              <CaretRight size={14} weight="bold" />
            </button>
          </div>
        )}
        </>
      )}
    </>
  );
}

function ProductImage({ src, alt }: Readonly<{ src: string; alt: string }>) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <BrandPlaceholder />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      sizes="(min-width: 1280px) 24vw, (min-width: 768px) 34vw, 50vw"
      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
}

function BrandPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center border border-black/10 bg-[#f0f0f0] px-2">
      <span className="font-[family-name:var(--font-kiments)] text-[18px] font-normal tracking-[0.12em] text-black/55 sm:text-[22px]">
        KIMENTS
      </span>
      <span className="mt-1 text-[7px] font-light uppercase tracking-[0.2em] text-black/40 sm:text-[8px]">
        Tienda de ropa
      </span>
    </div>
  );
}

function FilterGroup({
  children,
  title,
}: Readonly<{
  children: React.ReactNode;
  title: string;
}>) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mt-8 border-b border-black/10 pb-8">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-6 flex w-full items-center justify-between"
      >
        <h2 className="text-sm font-light">{title}</h2>
        <span className={`transition-transform duration-300 ${open ? "rotate-0" : "rotate-180"}`}>
          <CaretUp size={15} weight="light" />
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-5">{children}</div>
      </div>
    </section>
  );
}

function ViewButton({
  active,
  children,
  label,
  onClick,
}: Readonly<{
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}>) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex size-8 items-center justify-center text-[#3a3a3a] transition-colors ${
        active ? "bg-[#202020] text-white" : "bg-white hover:bg-[#ece8e9]"
      }`}
    >
      {children}
    </button>
  );
}
