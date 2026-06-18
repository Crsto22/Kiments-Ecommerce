"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const slides = [
  {
    model: "Modelo Angie",
    align: "left" as const,
    overlay: "bg-gradient-to-r from-black/70 via-black/40 to-transparent",
    modelImage: "/img/modelo1.png",
  },
  {
    model: "Modelo Julieta",
    align: "right" as const,
    overlay: "bg-gradient-to-l from-black/70 via-black/40 to-transparent",
    modelImage: "/img/modelo2.png",
  },
  {
    model: "Modelo Michelle",
    align: "left" as const,
    overlay: "bg-gradient-to-r from-black/70 via-black/40 to-transparent",
    modelImage: "/img/modelo3.png",
  },
];

export function HeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const slideTimer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 8000);

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
            key={slide.model}
            className={`absolute inset-0 transition-opacity duration-700 ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            {/* Desktop background */}
            <Image
              src="/img/PortadaInicio.png"
              alt={slide.model}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`hidden md:block object-cover object-center ${isActive ? "animate-hero-image" : ""}`}
            />

            {/* Mobile background */}
            <Image
              src="/img/PortadaInicioMobile.png"
              alt={slide.model}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`md:hidden object-cover object-center ${isActive ? "animate-hero-image" : ""}`}
            />

            {/* Desktop overlay */}
            <div
              className={`hidden md:block absolute inset-y-0 ${
                isRightAligned ? "right-0 w-1/2" : "left-0 w-1/2"
              } ${slide.overlay}`}
            />

            {/* Mobile overlay */}
            <div className="md:hidden absolute inset-0 bg-black/40" />

            {/* Mobile bottom gradient */}
            <div className="md:hidden absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-[5]" />

            {/* Desktop model image */}
            {slide.modelImage && (
              <div
                className={`hidden md:flex absolute inset-y-0 z-10 items-center ${
                  isRightAligned
                    ? "left-0 w-1/2 justify-center"
                    : "right-0 w-1/2 justify-center"
                }`}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={slide.modelImage}
                    alt={slide.model}
                    fill
                    sizes="50vw"
                    className={`object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] ${isActive ? "animate-hero-text-top" : ""}`}
                  />
                </div>
              </div>
            )}

            {/* Mobile model image */}
            {slide.modelImage && (
              <div className="md:hidden absolute inset-0 z-10 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={slide.modelImage}
                    alt={slide.model}
                    fill
                    sizes="60vw"
                    className={`object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] ${isActive ? "animate-hero-text-top" : ""}`}
                  />
                </div>
              </div>
            )}

            {/* Desktop text */}
            <div
              className={`hidden md:flex relative z-10 min-h-screen items-center px-6 py-16 sm:px-12 lg:px-20 xl:px-28 ${
                isRightAligned ? "justify-end text-right" : "justify-start text-left"
              }`}
            >
              <div className="max-w-[28rem] text-white">
                <h1
                  className={`mt-3 text-4xl font-light uppercase leading-[1.05] sm:text-6xl lg:text-7xl xl:text-8xl ${isActive ? "animate-hero-text-top" : ""}`}
                >
                  {slide.model}
                </h1>
                <Link
                  href="/productos"
                  className={`mt-8 inline-flex h-12 items-center justify-center border border-white px-9 text-sm font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black sm:h-14 sm:px-11 sm:text-base ${isActive ? "animate-hero-text-bottom" : ""}`}
                >
                  Comprar Ahora
                </Link>
              </div>
            </div>

            {/* Mobile text */}
            <div className="md:hidden absolute bottom-0 inset-x-0 z-10 flex flex-col items-center text-center px-6 pb-28">
              <div className="text-white">
                <h1
                  className={`text-2xl font-light uppercase tracking-[0.08em] leading-[1.05] ${isActive ? "animate-hero-text-top" : ""}`}
                >
                  {slide.model}
                </h1>
                <Link
                  href="/productos"
                  className={`mt-5 inline-flex h-10 items-center justify-center border border-white px-7 text-xs font-medium uppercase tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black ${isActive ? "animate-hero-text-bottom" : ""}`}
                >
                  Comprar Ahora
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
            key={slide.model}
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
