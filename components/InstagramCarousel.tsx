"use client";

import Image from "next/image";
import Link from "next/link";
import { InstagramLogo } from "@phosphor-icons/react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const instagramPosts = [
  {
    image: "/img/instagram/img1.jpg",
    href: "https://www.instagram.com/p/DY-DZKgjohp/?img_index=1",
  },
  {
    image: "/img/instagram/img2.jpg",
    href: "https://www.instagram.com/p/DYp5gnsOPfJ/",
  },
  {
    image: "/img/instagram/img3.jpg",
    href: "https://www.instagram.com/p/DYaTUoXHxMI/?img_index=1",
  },
  {
    image: "/img/instagram/img4.jpg",
    href: "https://www.instagram.com/p/DYDCdUVn7Iv/?img_index=1",
  },
];

export function InstagramCarousel() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto mb-8 max-w-7xl px-7 sm:px-10 lg:px-16 xl:px-20">
        <div className="border-y border-[#eeeeee] py-8 text-center">
          <Link
            href="https://www.instagram.com/kiments.pe"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2.5 border border-[#2c2c2c] px-8 text-[13px] font-light uppercase tracking-[0.14em] text-[#333333] transition-colors hover:bg-[#333333] hover:text-white"
          >
            <InstagramLogo size={18} weight="regular" />
            @KIMENTS.PE
          </Link>
        </div>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="relative"
      >
        <CarouselContent className="-ml-0">
          {instagramPosts.map((post, index) => (
            <CarouselItem
              key={post.image}
              className="basis-[75%] pl-0 sm:basis-[45%] lg:basis-1/4"
            >
              <Link
                href={post.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Ver publicacion de Instagram ${index + 1}`}
                className="group relative block aspect-square overflow-hidden bg-[#f2f2f2]"
              >
                <Image
                  src={post.image}
                  alt={`Publicacion de Instagram ${index + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 75vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/35 group-hover:opacity-100">
                  <InstagramLogo size={42} weight="light" className="text-white" />
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          aria-label="Instagram anterior"
          className="left-4 size-8 border-none sm:size-9"
        />
        <CarouselNext
          aria-label="Instagram siguiente"
          className="right-4 size-8 border-none sm:size-9"
        />
      </Carousel>
    </section>
  );
}
