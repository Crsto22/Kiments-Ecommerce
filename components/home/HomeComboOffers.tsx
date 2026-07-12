"use client";

import Image from "next/image";
import Link from "next/link";
import { buildImageUrl } from "@/lib/api";
import type { EcommerceInicioCombo, EcommerceInicioComboItem } from "@/types/producto";

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
            Explorar
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {combos.map((combo) => (
            <ComboOfferCard key={combo.idPromocionCombo} combo={combo} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ComboOfferCard({ combo }: Readonly<{ combo: EcommerceInicioCombo }>) {
  const images = expandItems(combo.items).slice(0, 2);
  const hasDiscount = combo.precioRegularMinimo > combo.precioCombo;
  const comboItemsText = combo.items
    .map((item) => `${item.cantidadRequerida} ${item.nombre}`)
    .join(" · ");

  return (
    <article>
      <div className="relative mx-auto h-64 max-w-sm">
        {images.map((item, index) => (
          <ComboImage key={`${item.idProducto}-${index}`} item={item} index={index} />
        ))}
        {images.length > 1 && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black text-2xl font-light leading-none text-white shadow-md">
            +
          </div>
        )}
      </div>

      <div className="mt-5 text-center">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-black">
          {combo.nombre}
        </h3>
        <p className="mt-2 min-h-10 text-xs font-light leading-5 text-black/55">
          {comboItemsText || combo.regla}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
          <span className="text-lg font-semibold text-red-700">
            S/ {combo.precioCombo.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-black/35 line-through">
              S/ {combo.precioRegularMinimo.toFixed(2)}
            </span>
          )}
        </div>
        {combo.ahorroMinimo > 0 && (
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-700">
            Ahorra S/ {combo.ahorroMinimo.toFixed(2)}
          </p>
        )}
      </div>
    </article>
  );
}

function ComboImage({ item, index }: Readonly<{ item: EcommerceInicioComboItem; index: number }>) {
  const imageUrl = buildImageUrl(item.imagenGlobalThumbUrl || item.imagenGlobalUrl);
  const position = index === 0 ? "left-6 top-0" : "right-6 bottom-0";

  return (
    <Link
      href={`/productos/${item.slug}`}
      aria-label={`Ver ${item.nombre}`}
      className={`absolute ${position} h-44 w-32 overflow-hidden border-4 border-white bg-[#eee9e2] shadow-sm sm:h-52 sm:w-40`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={item.nombre}
          fill
          unoptimized
          sizes="(min-width: 768px) 160px, 128px"
          className="object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-[family-name:var(--font-kiments)] text-[16px] tracking-[0.12em] text-black/50">
          KIMENTS
        </span>
      )}
    </Link>
  );
}

function expandItems(items: EcommerceInicioComboItem[]): EcommerceInicioComboItem[] {
  return items.flatMap((item) => Array.from({ length: item.cantidadRequerida }, () => item));
}
