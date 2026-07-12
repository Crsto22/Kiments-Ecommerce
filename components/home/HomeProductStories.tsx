import Image from "next/image";
import Link from "next/link";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
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
    <section className="bg-white pb-8 pt-3">
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
                    <Image
                      src={imageUrl}
                      alt={item.nombre}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 75vw"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/15" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
                    {item.preventa && (
                      <div className="absolute inset-x-0 top-0 bg-black py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-[12px]">
                        PRODUCTO PREVENTA
                      </div>
                    )}
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
  );
}
