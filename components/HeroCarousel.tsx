"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "Modelo Brenda",
    title: "Nueva coleccion",
    image: "/img/portada2.png",
    alt: "Modelo Brenda nueva coleccion",
    align: "left",
    overlay: "from-black/60 via-black/22 to-transparent",
  },
  {
    eyebrow: "",
    title: "Modelo Georgina",
    image: "/img/portada3.png",
    alt: "Modelo Georgina",
    align: "right",
    overlay: "from-transparent via-black/16 to-black/58",
  },
];

export function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5500);

    return () => {
      window.clearInterval(slideTimer);
    };
  }, []);

  const goToPrevious = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
  };

  return (
    <section className="relative min-h-screen overflow-hidden">
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;
        const isRightAligned = slide.align === "right";

        return (
          <div
            key={slide.image}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

            <div
              className={`relative z-10 flex min-h-screen items-center px-6 py-16 sm:px-12 lg:px-20 xl:px-28 ${
                isRightAligned ? "justify-end text-right" : "justify-start text-left"
              }`}
            >
              <div className="max-w-[32rem] text-white">
                <p className="text-sm font-light uppercase tracking-[0.26em] sm:text-base xl:text-lg">
                  {slide.eyebrow}
                </p>
                <h1 className="mt-3 text-4xl font-light uppercase leading-[1.05] sm:text-6xl lg:text-7xl xl:text-8xl">
                  {slide.title}
                </h1>
                <Link
                  href="/productos"
                  className={`mt-8 inline-flex h-12 items-center justify-center border border-white px-9 text-sm font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black sm:h-14 sm:px-11 sm:text-base ${
                    isRightAligned ? "ml-auto" : ""
                  }`}
                >
                  Comprar
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        aria-label="Portada anterior"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/65 text-white transition-colors hover:bg-white hover:text-black sm:flex"
      >
        <CaretLeft size={22} weight="thin" />
      </button>
      <button
        type="button"
        aria-label="Portada siguiente"
        onClick={goToNext}
        className="absolute right-4 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/65 text-white transition-colors hover:bg-white hover:text-black sm:flex"
      >
        <CaretRight size={22} weight="thin" />
      </button>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={slide.image}
            type="button"
            aria-label={`Ver portada ${index + 1}`}
            onClick={() => setActiveSlide(index)}
            className={`size-2.5 rounded-full border border-white transition-colors ${
              index === activeSlide ? "bg-white" : "bg-transparent"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
