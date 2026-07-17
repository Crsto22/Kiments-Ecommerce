"use client";

import Autoplay from "embla-carousel-autoplay";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/ProductCard";
import type { ProductoItem } from "@/types/producto";

export function ProductCarousel({
  items,
}: Readonly<{ items: ProductoItem[] }>) {
  const loopItems = (items.length < 6 ? [items, items, items] : [items]).flatMap(
    (group, repetition) =>
      group.map((item) => ({
        item,
        key: `${item.producto.idProducto}-${item.color.idColor}-${repetition}`,
      })),
  );

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
        {loopItems.map(({ item, key }) => (
          <CarouselItem
            key={key}
            className="basis-1/2 sm:basis-[26%] lg:basis-[20%]"
          >
            <ProductCard item={item} centered />
          </CarouselItem>
        ))}
      </CarouselContent>

      <CarouselPrevious
        aria-label="Producto anterior"
        className="group -left-3 size-9 border border-black/10 bg-white text-black shadow-md transition-all duration-300 hover:bg-white hover:text-black md:size-12"
      >
        <CaretLeft
          size={28}
          weight="bold"
          className="size-5 transition-transform duration-300 group-hover:-translate-x-0.5 md:size-7"
        />
      </CarouselPrevious>
      <CarouselNext
        aria-label="Producto siguiente"
        className="group -right-3 size-9 border border-black/10 bg-white text-black shadow-md transition-all duration-300 hover:bg-white hover:text-black md:size-12"
      >
        <CaretRight
          size={28}
          weight="bold"
          className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 md:size-7"
        />
      </CarouselNext>
    </Carousel>
  );
}
