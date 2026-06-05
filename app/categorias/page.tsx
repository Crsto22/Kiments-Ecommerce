"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CaretUp,
  Columns,
  Eye,
  GridFour,
  Rows,
  ShoppingCartSimple,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

const productTypes = ["Blusa", "blusas", "Chaqueta", "Falda", "Partition", "Polo", "Saco"];
const sizes = ["XS", "8", "10", "12", "14", "16"];

const products = [
  {
    name: "BLUSA IMARA ACERO/NEGRO",
    price: 249,
    image: "/img/productos/Producto02.jpg",
    color: "#69747d",
    type: "Blusa",
    sizes: ["XS", "8", "10"],
  },
  {
    name: "BLUSA IMARA IVORY/NEGRO",
    price: 249,
    image: "/img/productos/Producto01.jpg",
    color: "#f4f1ea",
    type: "Blusa",
    sizes: ["8", "10", "12"],
  },
  {
    name: "BLUSA IMARA VERDE/NEGRO",
    price: 249,
    image: "/img/productos/Producto03.jpg",
    color: "#10a524",
    type: "Blusa",
    sizes: ["10", "12", "14"],
  },
];

type ViewMode = "compact" | "normal" | "wide";

export default function CategoriasPage() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1890);
  const [viewMode, setViewMode] = useState<ViewMode>("normal");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(product.type);
      const matchesSize =
        selectedSizes.length === 0 ||
        product.sizes.some((size) => selectedSizes.includes(size));
      const matchesPrice = product.price <= maxPrice;

      return matchesType && matchesSize && matchesPrice;
    });
  }, [maxPrice, selectedSizes, selectedTypes]);

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

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-24 text-[#252525] sm:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h1 className="text-3xl font-light">Filtrar por</h1>

          <FilterGroup title="Tipo de producto">
            {productTypes.map((type) => (
              <label key={type} className="flex items-center gap-3 text-sm font-light">
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

          <FilterGroup title="Talla">
            {sizes.map((size) => (
              <label key={size} className="flex items-center gap-3 text-sm font-light">
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

          <FilterGroup title="Precio">
            <div className="px-1">
              <input
                type="range"
                min="0"
                max="1890"
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
        </aside>

        <section>
          <div className="mb-14 flex items-center justify-between">
            <p className="text-sm font-light">Caracteristicas</p>
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

          <div className={`grid gap-x-20 gap-y-14 sm:grid-cols-2 ${gridColumns}`}>
            {filteredProducts.map((product) => (
              <article key={product.name}>
                <div className="group relative aspect-[3/4] overflow-hidden bg-white">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1280px) 24vw, (min-width: 768px) 34vw, 88vw"
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-6 flex translate-y-3 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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
                <div className="mt-8">
                  <Link href="/producto">
                    <h2 className="text-sm font-light uppercase leading-tight transition-colors hover:text-black/60">
                      {product.name}
                    </h2>
                  </Link>
                  <p className="mt-2 text-sm font-light">S/ {product.price.toFixed(2)}</p>
                  <span
                    aria-label="Color del producto"
                    className="mt-4 block size-6 rounded-full border border-white shadow-[0_0_0_2px_rgba(0,0,0,0.28)]"
                    style={{ backgroundColor: product.color }}
                  />
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <p className="mt-20 text-center text-sm font-light">
              No hay productos con esos filtros.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function FilterGroup({
  children,
  title,
}: Readonly<{
  children: React.ReactNode;
  title: string;
}>) {
  return (
    <section className="mt-8 border-b border-black/10 pb-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-light">{title}</h2>
        <CaretUp size={15} weight="light" />
      </div>
      <div className="flex flex-col gap-5">{children}</div>
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
