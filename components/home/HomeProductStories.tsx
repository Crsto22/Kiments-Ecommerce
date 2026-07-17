import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { buildImageUrl } from "@/lib/api";
import type { EcommerceInicioImagenProducto } from "@/types/producto";

interface HomeProductStoriesProps {
  imagenesProductos: EcommerceInicioImagenProducto[];
  visible: boolean;
}

export function HomeProductStories({ imagenesProductos, visible }: HomeProductStoriesProps) {
  if (!visible) return null;

  return (
    <section className="bg-white pb-8">
      <Carousel opts={{ align: "start", loop: true }} className="relative">
        <CarouselContent className="-ml-0">
          {imagenesProductos.map((item) => {
            const imageUrl = buildImageUrl(item.imagenUrl || item.imagenThumbUrl);
            if (!imageUrl) return null;
            return (
              <CarouselItem
                key={item.idProducto}
                className="basis-1/2 pl-0 sm:basis-[45%] lg:basis-1/4"
              >
                <Link href={`/productos/${item.slug}`} className="block">
                  <figure className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-[#eee9e2]">
                    <Image
                      src={imageUrl}
                      alt={item.nombre}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 50vw"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/15" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
                    {item.preventa && (
                      <div className="absolute inset-x-0 top-0 bg-black py-1.5 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-white sm:py-2 sm:tracking-[0.16em] lg:text-[11px]">
                        PRODUCTO PREVENTA
                      </div>
                    )}
                    <figcaption className="absolute inset-x-0 bottom-0 translate-y-1 px-2 pb-3 text-center text-[9px] font-light uppercase tracking-[0.08em] text-white underline underline-offset-2 opacity-90 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:px-4 sm:pb-4 sm:text-[14px] sm:tracking-[0.14em] sm:underline-offset-4 lg:bottom-2 lg:translate-y-0">
                      MODELO {item.slug}
                    </figcaption>
                  </figure>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious
          aria-label="Productos globales anterior"
          className="group left-3 size-9 border-0 bg-transparent text-black shadow-none transition-all duration-300 hover:bg-transparent hover:text-black md:left-6 md:size-12"
        >
          <CaretLeft
            size={28}
            weight="bold"
            className="size-5 transition-transform duration-300 group-hover:-translate-x-0.5 md:size-7"
          />
        </CarouselPrevious>
        <CarouselNext
          aria-label="Productos globales siguiente"
          className="group right-3 size-9 border-0 bg-transparent text-black shadow-none transition-all duration-300 hover:bg-transparent hover:text-black md:right-6 md:size-12"
        >
          <CaretRight
            size={28}
            weight="bold"
            className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 md:size-7"
          />
        </CarouselNext>
      </Carousel>
    </section>
  );
}
