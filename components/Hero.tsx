"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { buildImageUrl } from "@/lib/api";
import type { EcommercePortada } from "@/types/producto";

const fallbackSlides = [
  {
    id: "original",
    desktop: "/img/Portadas/portada-destock.png",
    mobile: "/img/Portadas/portada-mobil.png",
  },
  {
    id: "destock",
    desktop: "/img/Portadas/portada-destock(1).png",
    mobile: "/img/Portadas/portada-mobil(1).png",
  },
];

const AUTOPLAY_DELAY = 6000;
const EMPTY_PORTADAS: EcommercePortada[] = [];

export function Hero({ portadas = EMPTY_PORTADAS }: { portadas?: EcommercePortada[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(
    () => portadas.length
      ? portadas.map((portada) => ({
        id: String(portada.idEcommercePortada),
        desktop: buildImageUrl(portada.desktopUrl) ?? portada.desktopUrl,
        mobile: buildImageUrl(portada.mobileUrl) ?? portada.mobileUrl,
      }))
      : fallbackSlides,
    [portadas],
  );
  const activeSlideIndex = activeIndex % slides.length;

  const goToPrev = useCallback(() => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((current) => (current + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full bg-black">
      <Link href="/productos" aria-label="Ver productos" className="relative block aspect-square w-full overflow-hidden md:hidden">
        {slides.map((slide, index) => (
          <Image
            key={slide.id}
            src={slide.mobile}
            alt="Portada KIMENTS"
            fill
            unoptimized
            sizes="100vw"
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === activeSlideIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </Link>

      <Link href="/productos" aria-label="Ver productos" className="relative hidden aspect-[16/9] w-full overflow-hidden md:block">
        {slides.map((slide, index) => (
          <Image
            key={slide.desktop}
            src={slide.desktop}
            alt="Portada KIMENTS"
            fill
            unoptimized
            sizes="100vw"
            className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === activeSlideIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </Link>

      <button
        type="button"
        aria-label="Portada anterior"
        onClick={goToPrev}
        className="group absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-all duration-300 hover:bg-white/15 hover:text-white md:left-6 md:size-12"
      >
        <CaretLeft
          size={28}
          weight="thin"
          className="transition-transform duration-300 group-hover:-translate-x-0.5"
        />
      </button>
      <button
        type="button"
        aria-label="Portada siguiente"
        onClick={goToNext}
        className="group absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white/70 transition-all duration-300 hover:bg-white/15 hover:text-white md:right-6 md:size-12"
      >
        <CaretRight
          size={28}
          weight="thin"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </button>
    </section>
  );
}
