"use client";

import Autoplay from "embla-carousel-autoplay";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/ProductCard";
import type { ProductoItem } from "@/types/producto";

export function ProductCarousel({
  items,
}: Readonly<{ items: ProductoItem[] }>) {
  const loopItems = items.length < 6 ? [...items, ...items, ...items] : items;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
      className="relative"
    >
      <CarouselContent className="-ml-4">
        {loopItems.map((item, index) => (
          <CarouselItem
            key={`${item.producto.idProducto}-${item.color.idColor}-${index}`}
            className="basis-[60%] sm:basis-[26%] lg:basis-[20%]"
          >
            <ProductCard item={item} centered />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselNavButtons />
    </Carousel>
  );
}

function CarouselNavButtons() {
  const { scrollPrev, scrollNext, canScrollPrev, canScrollNext } =
    useCarousel();

  return (
    <>
      <button
        type="button"
        aria-label="Producto anterior"
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 text-black/70 transition-colors hover:text-black disabled:pointer-events-none disabled:opacity-30 sm:flex"
      >
        <CaretLeft size={28} weight="regular" />
      </button>
      <button
        type="button"
        aria-label="Producto siguiente"
        onClick={scrollNext}
        disabled={!canScrollNext}
        className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 text-black/70 transition-colors hover:text-black disabled:pointer-events-none disabled:opacity-30 sm:flex"
      >
        <CaretRight size={28} weight="regular" />
      </button>
    </>
  );
}
