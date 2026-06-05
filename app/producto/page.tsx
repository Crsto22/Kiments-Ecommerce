"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretUp } from "@phosphor-icons/react";
import { useState } from "react";

const productImages = [
  "/img/productos/Producto01.jpg",
  "/img/productos/Producto02.jpg",
  "/img/productos/Producto03.jpg",
];

const colors = [
  { name: "Marron", value: "#5b4a4a" },
  { name: "Rojo", value: "#8b1114" },
  { name: "Azul", value: "#045cbb" },
  { name: "Turquesa", value: "#079aaa" },
  { name: "Fucsia", value: "#ef55b2" },
  { name: "Azul oscuro", value: "#004eac" },
  { name: "Durazno", value: "#f7b856" },
  { name: "Naranja", value: "#fb7416" },
];

const sizes = ["S", "M", "XL"];

export default function ProductoPage() {
  const [activeImage, setActiveImage] = useState(productImages[0]);
  const [selectedColor, setSelectedColor] = useState(colors[7].name);
  const [selectedSize, setSelectedSize] = useState("S");

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-24 text-[#171717] sm:px-10 lg:px-16 xl:px-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.35fr_1fr]">
        <section className="grid gap-3 sm:grid-cols-[1fr_126px]">
          <div className="relative aspect-[3/4] overflow-hidden bg-white">
            <Image
              src={activeImage}
              alt="Modelo Anguie"
              fill
              priority
              sizes="(min-width: 1024px) 44vw, 92vw"
              className="object-cover object-center"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:self-start">
            {productImages.map((image) => (
              <button
                key={image}
                type="button"
                aria-label="Cambiar imagen del producto"
                onClick={() => setActiveImage(image)}
                className={`relative aspect-[3/4] overflow-hidden bg-white ${
                  activeImage === image ? "ring-1 ring-black" : ""
                }`}
              >
                <Image
                  src={image}
                  alt="Vista del producto"
                  fill
                  sizes="126px"
                  className="object-cover object-center"
                />
              </button>
            ))}
          </div>
        </section>

        <section className="pt-2 lg:pl-10">
          <p className="text-xs font-light uppercase tracking-[0.08em] text-black/70">
            Kiments
          </p>
          <h1 className="mt-2 text-3xl font-semibold uppercase leading-tight">
            Modelo Anguie
          </h1>
          <p className="mt-5 text-[11px] font-light uppercase">SKU: 10371521</p>
          <p className="mt-5 text-xl font-light">S/. 289.90</p>

          <div className="mt-7">
            <p className="text-sm font-semibold">
              Color: <span className="font-light">{selectedColor}</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              {colors.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  aria-label={`Elegir color ${color.name}`}
                  onClick={() => setSelectedColor(color.name)}
                  className={`size-9 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)] ${
                    selectedColor === color.name ? "ring-2 ring-black/70 ring-offset-2" : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold">Talla</p>
              <Link
                href="/guia-de-tallas"
                className="inline-flex h-9 items-center justify-center rounded-md border border-black/15 bg-white px-4 text-[10px] font-light uppercase tracking-[0.06em] text-black transition-colors hover:border-black"
              >
                Guia de tallas
              </Link>
            </div>
            <div className="mt-3 flex gap-3">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`flex size-12 items-center justify-center rounded-md border text-sm font-light transition-colors ${
                    selectedSize === size
                      ? "border-black bg-white text-black"
                      : "border-black/15 bg-white/75 text-black hover:border-black/50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <button className="mt-8 flex h-14 w-full items-center justify-center bg-[#181516] text-sm font-light uppercase tracking-[0.04em] text-white transition-colors hover:bg-black">
            Añadir al carrito
          </button>

          <div className="mt-5 bg-white">
            <button className="flex w-full items-center justify-between border-b border-black/10 px-3 py-2 text-left text-sm font-light">
              Descripción
              <CaretUp size={14} weight="light" />
            </button>
            <ul className="list-disc px-8 py-4 text-xs font-light leading-6 text-black/75">
              <li>Corte semiceñido</li>
              <li>Mangas acampanadas</li>
              <li>Cierre de botones frontal</li>
              <li>Base principal poliester (100%)</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
