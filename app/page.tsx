"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingCartSimple, Warning, Spinner, Storefront } from "@phosphor-icons/react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { InstagramCarousel } from "@/components/InstagramCarousel";
import { fetchInicio, buildImageUrl } from "@/lib/api";
import type { ProductoItem } from "@/types/producto";
import { useEffect, useState } from "react";

export default function Home() {
  const [aleatorios, setAleatorios] = useState<ProductoItem[]>([]);
  const [masVendidos, setMasVendidos] = useState<ProductoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiendaConfigurada, setTiendaConfigurada] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchInicio()
      .then((res) => {
        setTiendaConfigurada(res.tiendaConfigurada);
        setAleatorios(res.aleatorios);
        setMasVendidos(res.masVendidos);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <HeroCarousel />

      {loading && (
        <section className="bg-white px-7 py-12 sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-10 xl:gap-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse min-w-0">
                  <div className="aspect-[3/4] bg-[#eee9e2]" />
                  <div className="mt-3 space-y-2">
                    <div className="size-4 rounded-full bg-black/10" />
                    <div className="h-4 w-3/4 bg-black/10 rounded" />
                    <div className="h-3 w-1/3 bg-black/5 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!loading && error && (
        <section className="bg-white px-7 py-16 sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 text-center">
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
        </section>
      )}

      {!loading && !error && !tiendaConfigurada && (
        <section className="bg-white px-7 py-16 sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-6xl flex flex-col items-center gap-4 text-center">
            <Storefront size={32} weight="light" className="text-black/20" />
            <p className="text-sm font-light text-black/50">
              Tienda ecommerce no configurada
            </p>
            <p className="text-[13px] text-black/40">
              Vuelve pronto. Estamos preparando la tienda.
            </p>
          </div>
        </section>
      )}

      {!loading && !error && tiendaConfigurada && aleatorios.length > 0 && (
        <section className="bg-white px-7 py-12 text-[#242424] sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-10 xl:gap-12">
              {aleatorios.map((item) => (
                <ProductCard
                  key={`${item.producto.idProducto}-${item.color.idColor}`}
                  item={item}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/productos"
                className="inline-flex h-10 min-w-28 items-center justify-center bg-[#3d3d3d] px-8 text-[11px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-black"
              >
                Ver más
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="relative min-h-[460px] overflow-hidden bg-black sm:min-h-[560px] lg:min-h-[640px]">
        <video
          className="absolute inset-0 size-full object-cover"
          src="/Video/Video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          Tu navegador no puede reproducir este video.
        </video>
        <div className="absolute inset-0 bg-black/28" />
      </section>

      {!loading && !error && tiendaConfigurada && masVendidos.length > 0 && (
        <section className="bg-white px-7 py-14 text-[#242424] sm:px-10 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-2xl font-light uppercase tracking-[0.12em] sm:text-3xl">
              Productos más vendidos
            </h2>

            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-10 xl:gap-12">
              {masVendidos.map((item) => (
                <ProductCard
                  key={`${item.producto.idProducto}-${item.color.idColor}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <InstagramCarousel />
    </main>
  );
}

function ProductCard({ item }: Readonly<{ item: ProductoItem }>) {
  const priceLabel =
    item.precioMinimo === item.precioMaximo
      ? `S/ ${item.precioMinimo.toFixed(2)}`
      : `S/ ${item.precioMinimo.toFixed(2)} - S/ ${item.precioMaximo.toFixed(2)}`;

  const imageUrl = buildImageUrl(
    item.imagenPrincipal?.urlThumb ||
      item.imagenPrincipal?.url ||
      item.producto.imagenGlobalUrl ||
      item.producto.imagenGlobalThumbUrl,
  );

  const sizes = [...item.variantes]
    .sort((a, b) => {
      const na = Number(a.talla.nombre);
      const nb = Number(b.talla.nombre);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.talla.nombre.localeCompare(b.talla.nombre);
    })
    .map((v) => ({
      label: v.talla.nombre,
      disponible: v.disponible,
      stock: v.stock,
    }));

  return (
    <article className="min-w-0">
      <div className="group relative aspect-[3/4] w-full overflow-hidden bg-[#eee9e2]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.producto.nombre}
            fill
            unoptimized
            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 30vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[#f0f0f0] px-2">
            <span className="font-[family-name:var(--font-kiments)] text-[18px] font-normal tracking-[0.12em] text-black/55">
              KIMENTS
            </span>
          </div>
        )}
        <Link
          href={`/productos/${item.producto.slug}?color=${item.color.idColor}`}
          className="absolute inset-0 z-10"
          aria-label={`Ver ${item.producto.nombre}`}
        />
        {item.estadoStock === "AGOTADO" && (
          <span className="absolute bottom-0 left-0 z-20 bg-black px-2 py-1 text-[9px] font-light uppercase tracking-[0.08em] text-white sm:px-4 sm:py-2 sm:text-[11px]">
            Agotado
          </span>
        )}
        {item.estadoStock === "PARCIAL" && (
          <span className="absolute bottom-0 left-0 z-20 bg-black/50 px-2 py-1 text-[9px] font-light uppercase tracking-[0.08em] text-white sm:px-4 sm:py-2 sm:text-[11px]">
            Pocas unidades
          </span>
        )}
        <div className="absolute inset-x-0 bottom-5 z-20 flex translate-y-3 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/productos/${item.producto.slug}?color=${item.color.idColor}`}
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
          aria-label={`Color: ${item.color.nombre}`}
          className="block size-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
          style={{ backgroundColor: item.color.hex }}
        />
        <h2 className="mt-3 text-[12px] font-normal uppercase leading-tight tracking-[0.02em]">
          {item.producto.nombre}
        </h2>
        <p className="mt-1 text-[12px] leading-none">{priceLabel}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {sizes.map((size) => (
            <span
              key={size.label}
              className={`inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-[10px] font-light uppercase ${
                size.disponible
                  ? "border-black/20 text-black/70"
                  : "border-black/5 text-black/25 line-through"
              }`}
              title={size.disponible ? `${size.stock} en stock` : "Agotado"}
            >
              {size.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
