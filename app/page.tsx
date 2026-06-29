"use client";

import Link from "next/link";
import { Warning, Storefront } from "@phosphor-icons/react";
import { Hero } from "@/components/Hero";
import { InstagramCarousel } from "@/components/InstagramCarousel";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ProductCard } from "@/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { buildImageUrl, fetchInicio } from "@/lib/api";
import type { EcommerceInicioImagenProducto, EcommercePortada, ProductoItem } from "@/types/producto";
import { useEffect, useState } from "react";

export default function Home() {
  const [aleatorios, setAleatorios] = useState<ProductoItem[]>([]);
  const [masVendidos, setMasVendidos] = useState<ProductoItem[]>([]);
  const [portadas, setPortadas] = useState<EcommercePortada[]>([]);
  const [imagenesProductos, setImagenesProductos] = useState<EcommerceInicioImagenProducto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tiendaConfigurada, setTiendaConfigurada] = useState(true);

  useEffect(() => {
    fetchInicio()
      .then((res) => {
        setTiendaConfigurada(res.tiendaConfigurada);
        setPortadas(res.portadas ?? []);
        setImagenesProductos(res.imagenesProductos ?? []);
        setAleatorios(res.aleatorios);
        setMasVendidos(res.masVendidos);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error al cargar"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Hero portadas={portadas} />

      {!loading && !error && tiendaConfigurada && imagenesProductos.length > 0 && (
        <section className="bg-white pt-3 pb-8">
          <Carousel opts={{ align: "start", loop: true }} className="relative">
            <CarouselContent className="-ml-0">
              {imagenesProductos.map((item) => {
                const imageUrl = buildImageUrl(item.imagenUrl || item.imagenThumbUrl);
                if (!imageUrl) return null;
                return (
                  <CarouselItem
                    key={item.idProducto}
                    className="basis-[75%] pl-0 sm:basis-[45%] lg:basis-1/4"
                  >
                    <Link href={`/productos/${item.slug}`} className="block">
                      <figure className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-[#eee9e2]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={item.nombre}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/15" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
                        <figcaption className="absolute inset-x-0 bottom-0 translate-y-1 px-4 pb-4 text-center text-[12px] font-light uppercase tracking-[0.14em] text-white underline underline-offset-4 opacity-90 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:text-[14px]">
                          MODELO {item.slug}
                        </figcaption>
                      </figure>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>
        </section>
      )}

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
        <section className="bg-white px-6 py-10 text-[#242424]">
          <ProductCarousel items={aleatorios} />
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
        <section className="bg-white px-6 py-12 text-[#242424]">
          <div className="grid items-center gap-10 lg:grid-cols-[280px_1fr]">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-[0.08em] sm:text-3xl">
                Productos más vendidos
              </h2>
              <p className="mt-3 text-sm font-light text-black/60">
                Descubre más de todos los productos mas vendidos
              </p>
              <div className="mt-6">
                <Link
                  href="/productos"
                  className="inline-flex h-10 min-w-28 items-center justify-center bg-[#3d3d3d] px-8 text-[11px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-black"
                >
                  Explorar
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {masVendidos.map((item) => (
                <div key={`${item.producto.idProducto}-${item.color.idColor}`}>
                  <ProductCard item={item} centered />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <InstagramCarousel />
    </main>
  );
}
