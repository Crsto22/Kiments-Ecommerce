"use client";

import Image from "next/image";
import Link from "next/link";
import { buildImageUrl } from "@/lib/api";
import type { ProductoItem } from "@/types/producto";

interface ProductCardProps {
  item: ProductoItem;
  centered?: boolean;
}

export function ProductCard({ item, centered = false }: Readonly<ProductCardProps>) {
  const offer =
    item.variantes.length > 0 &&
    item.variantes.every(
      (v) =>
        v.tipoOfertaAplicada !== "NINGUNA" &&
        v.precioVigente === item.variantes[0].precioVigente &&
        v.precioRegular === item.variantes[0].precioRegular,
    )
      ? {
          precioRegular: item.variantes[0].precioRegular,
          precioVigente: item.variantes[0].precioVigente,
        }
      : null;

  const priceLabel =
    offer
      ? `S/ ${offer.precioVigente.toFixed(2)}`
      : item.precioMinimo === item.precioMaximo
      ? `S/ ${item.precioMinimo.toFixed(2)}`
      : `S/ ${item.precioMinimo.toFixed(2)} - S/ ${item.precioMaximo.toFixed(2)}`;
  const combo = item.promocionesCombo?.find((promo) => promo.mismoProducto) ?? null;

  const imageUrl =
    item.imagenPrincipal?.origen === "COLOR"
      ? buildImageUrl(item.imagenPrincipal.url || item.imagenPrincipal.urlThumb)
      : null;

  const sizes = item.variantes
    .toSorted((a, b) => {
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
      <div className="group relative aspect-[3/4] w-full overflow-hidden rounded-md bg-[#eee9e2]">
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
        <div className="absolute left-0 top-0 z-20 flex max-w-[70%] flex-col items-start gap-1">
          {combo && (
            <span className="bg-emerald-700 px-2 py-1 text-[8px] font-light uppercase tracking-[0.08em] text-white sm:px-4 sm:py-2 lg:text-[11px]">
              2 por S/ {combo.precioCombo.toFixed(2)}
            </span>
          )}
        </div>
        {item.producto.preventa && (
          <span className="absolute right-0 top-0 z-20 bg-black px-2 py-1 text-[8px] font-light uppercase tracking-[0.08em] text-white sm:px-4 sm:py-2 lg:text-[11px]">
            Preventa
          </span>
        )}
        {item.estadoStock === "AGOTADO" && (
          <span className="absolute bottom-0 left-0 z-20 bg-red-700 px-2 py-1 text-[8px] font-light uppercase tracking-[0.08em] text-white sm:px-4 sm:py-2 lg:text-[11px]">
            Agotado
          </span>
        )}
        {item.estadoStock === "PARCIAL" && (
          <span className="absolute bottom-0 left-0 z-20 bg-black/50 px-2 py-1 text-[8px] font-light uppercase tracking-[0.08em] text-white sm:px-4 sm:py-2 lg:text-[11px]">
            Pocas unidades
          </span>
        )}
      </div>

      <div className={`mt-4 ${centered ? "flex flex-col items-center text-center" : ""}`}>
        <span className="color-tooltip inline-flex">
          <span
            aria-label={`Color: ${item.color.nombre}`}
            className="block size-5 rounded-full border border-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.35)]"
            style={{ backgroundColor: item.color.hex }}
          />
          <span className="color-tooltip-bubble">{item.color.nombre}</span>
        </span>
        <h2 className="mt-3 text-[13px] font-light uppercase leading-tight tracking-[0.04em] text-black">
          {item.producto.nombre}
        </h2>
        <p className="mt-1.5 text-[13px] font-light leading-none text-black">
          {offer ? (
            <span className="inline-flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
              <span className="font-semibold text-red-700">{priceLabel}</span>
              <span className="text-[12px] text-black/35 line-through">
                S/ {offer.precioRegular.toFixed(2)}
              </span>
              <span className="bg-red-50 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-red-600">
                Oferta
              </span>
            </span>
          ) : (
            priceLabel
          )}
        </p>
        <div className={`mt-3 flex flex-wrap gap-1.5 ${centered ? "justify-center" : ""}`}>
          {sizes.map((size) => (
            <span
              key={size.label}
              className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-[9px] font-light uppercase transition-colors sm:size-8 sm:text-[10px] ${
                size.disponible
                  ? "border-black/25 text-black/75 hover:border-black hover:text-black"
                  : "border-black/5 text-black/25 line-through"
              }`}
              title={size.disponible ? "Disponible" : "Agotado"}
            >
              {size.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
