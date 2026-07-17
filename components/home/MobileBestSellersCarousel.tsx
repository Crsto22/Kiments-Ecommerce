"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { ProductoItem } from "@/types/producto";

export function MobileBestSellersCarousel({
  items,
}: Readonly<{ items: ProductoItem[] }>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState({
    previous: false,
    next: items.length > 2,
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

  return (
    <div className="relative sm:hidden">
      <div
        ref={trackRef}
        onScroll={updateControls}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={`${item.producto.idProducto}-${item.color.idColor}`}
            className="basis-[calc(50%_-_0.375rem)] shrink-0 snap-start"
          >
            <ProductCard item={item} centered />
          </div>
        ))}
      </div>

      {controls.previous && (
        <button
          type="button"
          aria-label="Producto más vendido anterior"
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
          aria-label="Producto más vendido siguiente"
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
