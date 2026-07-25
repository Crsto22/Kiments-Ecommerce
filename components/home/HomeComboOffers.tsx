"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { buildImageUrl } from "@/lib/api";
import type { EcommerceInicioCombo, EcommerceInicioComboItem } from "@/types/producto";

type ExpandedComboItem = EcommerceInicioComboItem & { imageKey: string };

interface HomeComboOffersProps {
  combos: EcommerceInicioCombo[];
  visible: boolean;
}

export function HomeComboOffers({ combos, visible }: HomeComboOffersProps) {
  if (!visible) return null;

  return (
    <section id="promociones" className="bg-[#f7f4ef] px-6 py-12 text-[#242424]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
              Promociones
            </p>
            <h2 className="mt-2 text-2xl font-bold uppercase tracking-[0.08em] sm:text-3xl">
              Ofertas combos
            </h2>
          </div>
          <Link
            href="/promociones"
            className="inline-flex h-10 w-fit items-center justify-center bg-[#3d3d3d] px-8 text-[11px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-black"
          >
            Ver mas
          </Link>
        </div>

        <HomeComboOffersCarousel combos={combos} />
      </div>
    </section>
  );
}

function HomeComboOffersCarousel({ combos }: Readonly<{ combos: EcommerceInicioCombo[] }>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState({
    previous: false,
    next: false,
  });

  const scroll = (direction: -1 | 1) => {
    trackRef.current?.scrollBy({
      left: direction * trackRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const updateControls = () => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    setControls({
      previous: track.scrollLeft > 1,
      next: track.scrollLeft < maxScroll - 1,
    });
  };

  useEffect(() => {
    updateControls();
    window.addEventListener("resize", updateControls);
    return () => window.removeEventListener("resize", updateControls);
  }, [combos.length]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={updateControls}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden"
      >
        {combos.map((combo) => (
          <div
            key={combo.idPromocionCombo}
            className="basis-full shrink-0 snap-start sm:basis-[calc(50%_-_0.625rem)]"
          >
            <EditorialComboOfferCard combo={combo} href={getComboOfferHref(combo)} />
          </div>
        ))}
      </div>

      {controls.previous && (
        <button
          type="button"
          aria-label="Combo anterior"
          onClick={() => scroll(-1)}
          className="group absolute -left-3 top-1/2 z-30 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-md"
        >
          <CaretLeft
            size={20}
            weight="bold"
            className="transition-transform duration-300 group-hover:-translate-x-0.5"
          />
        </button>
      )}
      {controls.next && (
        <button
          type="button"
          aria-label="Combo siguiente"
          onClick={() => scroll(1)}
          className="group absolute -right-3 top-1/2 z-30 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-black shadow-md"
        >
          <CaretRight
            size={20}
            weight="bold"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>
      )}
    </div>
  );
}

function EditorialComboOfferCard({ combo, href }: Readonly<{ combo: EcommerceInicioCombo; href: string }>) {
  const images = expandItems(combo.items).slice(0, 2);
  const hasDiscount = combo.precioRegularMinimo > combo.precioCombo;

  return (
    <Link
      href={href}
      className="group grid min-h-48 grid-cols-[45%_55%] overflow-hidden border border-black/10 bg-[#fbfaf7] text-[#242424] shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-transform duration-300 hover:-translate-y-1 sm:min-h-72 sm:grid-cols-[1.2fr_0.8fr]"
    >
      <div className="grid min-h-48 grid-cols-2 bg-[#eee9e2] sm:min-h-72">
        {images.length > 0 ? (
          images.map((item) => (
            <ComboBannerImage key={item.imageKey} item={item} wide={images.length === 1} />
          ))
        ) : (
          <div className="col-span-2 flex items-center justify-center font-[family-name:var(--font-kiments)] text-3xl tracking-[0.14em] text-black/35">
            KIMENTS
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-between border-l border-black/10 bg-[#fbfaf7] p-3 sm:min-h-72 sm:p-6">
        <div>
          <h3 className="line-clamp-2 text-[12px] font-bold uppercase leading-snug tracking-[0.03em] text-black [overflow-wrap:anywhere] min-[380px]:text-[13px] sm:text-lg sm:leading-tight sm:tracking-[0.06em]">
            {combo.nombre}
          </h3>
          {combo.items.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[9.5px] font-light uppercase leading-3 tracking-[0.02em] text-black/60 min-[380px]:text-[10.5px] sm:mt-3 sm:space-y-1.5 sm:text-sm sm:leading-5">
              {combo.items.map((item) => (
                <li key={`${combo.idPromocionCombo}-${item.idProducto}`} className="flex gap-2">
                  <span className="mt-[0.45em] size-1 shrink-0 rounded-full bg-black/45" />
                  <span className="line-clamp-1 [overflow-wrap:anywhere]">
                    {item.cantidadRequerida} {item.nombre}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[10px] font-light uppercase leading-4 tracking-[0.02em] text-black/60 sm:mt-3 sm:text-sm">
              {combo.regla}
            </p>
          )}
        </div>

        <div className="mt-2 min-w-0 border-t border-black/10 pt-2 sm:mt-6 sm:pt-4">
          <div className="min-w-0">
            {combo.ahorroMinimo > 0 && (
              <p className="mb-1 text-[8.5px] font-medium uppercase tracking-[0.1em] text-black/45 sm:mb-2 sm:text-[11px]">
                Ahorra S/ {combo.ahorroMinimo.toFixed(2)}
              </p>
            )}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-[15px] font-medium text-black min-[380px]:text-[16px] sm:text-xl">S/ {combo.precioCombo.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-[11px] text-black/35 line-through sm:text-sm">
                  S/ {combo.precioRegularMinimo.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ComboOfferCard({ combo }: Readonly<{ combo: EcommerceInicioCombo }>) {
  return <EditorialComboOfferCard combo={combo} href={getComboOfferHref(combo)} />;
}

function getComboOfferHref(combo: EcommerceInicioCombo) {
  const slug = combo.items[0]?.slug;
  return slug ? `/productos/${slug}` : "/productos";
}

function ComboBannerImage({ item, wide }: Readonly<{ item: EcommerceInicioComboItem; wide: boolean }>) {
  const imageUrl = buildImageUrl(item.imagenGlobalUrl || item.imagenGlobalThumbUrl);

  return (
    <div className={`relative min-h-44 overflow-hidden bg-[#eee9e2] sm:min-h-72 ${wide ? "col-span-2" : ""}`}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={item.nombre}
          fill
          unoptimized
          sizes="(min-width: 1024px) 340px, (min-width: 640px) 55vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-[family-name:var(--font-kiments)] text-[16px] tracking-[0.12em] text-black/50">
          KIMENTS
        </span>
      )}
    </div>
  );
}

function expandItems(items: EcommerceInicioComboItem[]): ExpandedComboItem[] {
  return items.flatMap((item) =>
    Array.from({ length: item.cantidadRequerida }, (_, copyNumber) => ({
      ...item,
      imageKey: `${item.idProducto}-${item.slug}-${copyNumber}`,
    })),
  );
}
