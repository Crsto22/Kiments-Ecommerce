"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight, InstagramLogo } from "@phosphor-icons/react";
import { useState } from "react";

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
  const [activePost, setActivePost] = useState(0);

  const goToPrevious = () => {
    setActivePost((current) =>
      current === 0 ? instagramPosts.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setActivePost((current) => (current + 1) % instagramPosts.length);
  };

  return (
    <section className="bg-white py-8">
      <div className="mx-auto mb-8 max-w-7xl px-7 sm:px-10 lg:px-16 xl:px-20">
        <div className="border-y border-[#eeeeee] py-8 text-center">
          <Link
            href="https://www.instagram.com/kiments.pe"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center border border-[#2c2c2c] px-8 text-[13px] font-light uppercase tracking-[0.14em] text-[#333333] transition-colors hover:bg-[#333333] hover:text-white"
          >
            KIMENTS.PE
          </Link>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activePost * 25}%)` }}
        >
          {instagramPosts.map((post, index) => (
            <Link
              key={post.image}
              href={post.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Ver publicacion de Instagram ${index + 1}`}
              className="group relative aspect-square min-w-[75%] overflow-hidden bg-[#f2f2f2] sm:min-w-[45%] lg:min-w-[25%]"
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
          ))}
        </div>

        <button
          type="button"
          aria-label="Instagram anterior"
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#3d3d3d] transition-colors hover:bg-white sm:size-9"
        >
          <CaretLeft size={21} weight="thin" />
        </button>
        <button
          type="button"
          aria-label="Instagram siguiente"
          onClick={goToNext}
          className="absolute right-4 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#3d3d3d] transition-colors hover:bg-white sm:size-9"
        >
          <CaretRight size={21} weight="thin" />
        </button>
      </div>
    </section>
  );
}
