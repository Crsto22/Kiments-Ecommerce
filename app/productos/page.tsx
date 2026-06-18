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
  ShoppingCartSimple,
  SlidersHorizontal,
  X,
  Warning,
  Spinner,
  Storefront,
} from "@phosphor-icons/react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { fetchProductos, buildImageUrl } from "@/lib/api";
import type { ProductoItem, VarianteProducto } from "@/types/producto";

type ViewMode = "compact" | "normal" | "wide";

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
  category: string;
  sizes: { label: string; disponible: boolean; stock: number }[];
  estadoStock: string;
}

function mapProductoToCard(item: ProductoItem): ProductCard {
  // Sort variants by talla, try numeric then alpha
  const sorted = [...item.variantes].sort((a, b) => {
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

  const rawImage =
    item.imagenPrincipal?.url ||
    item.imagenPrincipal?.urlThumb ||
    item.producto.imagenGlobalUrl ||
    item.producto.imagenGlobalThumbUrl;

  const imageUrl = buildImageUrl(rawImage);

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
    category: item.producto.categoria.nombre,
    sizes,
    estadoStock: item.estadoStock,
  };
}

export default function ProductosPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(2000);
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
      const data = await fetchProductos({ page: pageNum, size: pageSize });
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

      // Reset price slider to highest in current page
      if (cards.length > 0) {
        const max = Math.max(...cards.map((p) => p.priceMax));
        setMaxPrice(Math.ceil(max));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar productos",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, fetchData]);

  const goToPage = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  // Extract unique filter options from fetched products
  const productTypes = useMemo(() => {
    return [...new Set(products.map((p) => p.category))].sort();
  }, [products]);

  const availableSizes = useMemo(() => {
    const all = products.flatMap((p) => p.sizes.map((s) => s.label));
    return [...new Set(all)].sort((a, b) => {
      const na = Number(a);
      const nb = Number(b);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [products]);

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.category);
      const matchesSize =
        selectedSizes.length === 0 ||
        product.sizes.some((s) => selectedSizes.includes(s.label));
      const matchesPrice = product.priceMin <= maxPrice;

      return matchesType && matchesSize && matchesPrice;
    });
  }, [products, maxPrice, selectedSizes, selectedTypes]);

  const toggleType = (type: string) => {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  };

  const toggleSize = (size: string) => {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size],
    );
  };

  const gridColumns =
    viewMode === "compact"
      ? "lg:grid-cols-2"
      : viewMode === "wide"
        ? "lg:grid-cols-4"
        : "lg:grid-cols-3";

  const filtersContent = (
    <>
      {productTypes.length > 0 && (
        <FilterGroup title="Tipo de producto">
          {productTypes.map((type) => (
            <label key={type} className="flex items-center gap-3 text-sm font-light cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleType(type)}
                className="size-4 accent-black"
              />
              <span>{type}</span>
            </label>
          ))}
        </FilterGroup>
      )}

      {availableSizes.length > 0 && (
        <FilterGroup title="Talla">
          {availableSizes.map((size) => (
            <label key={size} className="flex items-center gap-3 text-sm font-light cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSizes.includes(size)}
                onChange={() => toggleSize(size)}
                className="size-4 accent-black"
              />
              <span>{size}</span>
            </label>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Precio">
        <div className="px-1">
          <input
            type="range"
            min="0"
            max={maxPrice}
            value={maxPrice}
            onChange={(event) => setMaxPrice(Number(event.target.value))}
            className="w-full accent-black"
          />
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-light">
            <div className="flex h-10 items-center justify-between bg-white px-3">
              <span>S/</span>
              <span>0</span>
            </div>
            <div className="flex h-10 items-center justify-between bg-white px-3">
              <span>S/</span>
              <span>{maxPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </FilterGroup>
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
                        <button aria-label="Cerrar filtros">
                          <X size={24} weight="thin" />
                        </button>
                      </DrawerClose>
                    </div>
                    <DrawerDescription className="sr-only">
                      Filtra los productos por tipo, talla y precio
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="flex-1 overflow-y-auto px-6 py-4">
                    {filtersContent}
                  </div>
                  <DrawerFooter className="border-t border-black/10 p-4">
                    <DrawerClose asChild>
                      <button className="h-12 w-full bg-black text-sm font-light uppercase tracking-widest text-white transition-colors hover:bg-black/80">
                        Aplicar filtros
                      </button>
                    </DrawerClose>
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

          {/* PRODUCT GRID */}
          {!loading && !error && tiendaConfigurada && (
            <>
              <div
                className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-20 sm:gap-y-14 sm:grid-cols-2 ${gridColumns}`}
              >
                {filteredProducts.map((product) => (
                  <article key={`${product.idProducto}-${product.idColor}`}>
                    <div className="group relative aspect-[3/4] overflow-hidden bg-white">
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
                        <button
                          type="button"
                          aria-label="Agregar al carrito"
                          className="flex size-8 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white"
                        >
                          <ShoppingCartSimple size={18} weight="regular" />
                        </button>
                      </div>
                      {product.estadoStock === "AGOTADO" && (
                        <span className="absolute left-0 top-4 z-20 bg-black/60 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                          Agotado
                        </span>
                      )}
                      {product.estadoStock === "PARCIAL" && (
                        <span className="absolute left-0 top-4 z-20 bg-black/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
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
                        <span
                          aria-label={`Color: ${product.colorName}`}
                          className="block size-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.28)] shrink-0"
                          style={{ backgroundColor: product.colorHex }}
                        />
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
              {filteredProducts.length === 0 && products.length > 0 && (
                <p className="mt-20 text-center text-sm font-light">
                  No hay productos con esos filtros en esta página.
                </p>
              )}

              {/* Completely empty */}
              {products.length === 0 && (
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
        </section>
      </div>
    </main>
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
