"use client";

import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const models = [
  { name: "Belinda", src: "/img/modelo/MODELO_BELINDA.png" },
  { name: "Brenda", src: "/img/modelo/MODELO_BRENDA.png" },
  { name: "Julieta", src: "/img/modelo/MODELO_JULIETA.png" },
  { name: "Melisa", src: "/img/modelo/MODELO_MELISA.png" },
];

export function ModelShowcase() {
  return (
    <section className="bg-white pt-3 pb-8">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="relative"
      >
        <CarouselContent className="-ml-0">
          {models.map((model) => (
            <CarouselItem
              key={model.name}
              className="basis-[75%] pl-0 sm:basis-[45%] lg:basis-1/4"
            >
              <figure className="group relative aspect-[3/4] w-full cursor-pointer overflow-hidden bg-[#eee9e2]">
                <Image
                  src={model.src}
                  alt={`Modelo ${model.name}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 75vw"
                  className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-110"
                />
                <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 ease-out group-hover:bg-black/15" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-1 px-4 pb-4 text-center text-[12px] font-light uppercase tracking-[0.14em] text-white underline underline-offset-4 opacity-90 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:text-[14px]">
                  Modelo {model.name}
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
