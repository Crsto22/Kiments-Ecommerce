import Image from "next/image";
import Link from "next/link";

export function FaqCta() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#eee9e2] px-7 py-20 text-center sm:px-10 lg:px-16 xl:px-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/banner-ayuda.jpg"
          alt="Fondo Dudas"
          fill
          className="object-cover opacity-20 mix-blend-multiply grayscale"
        />
      </div>
      <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
        <h2 className="text-2xl font-medium tracking-[0.12em] text-black sm:text-3xl">
          ¿AÚN TIENES DUDAS?
        </h2>
        <p className="mt-6 text-sm font-light text-black/70">
          Nuestro equipo de atención al cliente está siempre disponible para brindarte la mejor experiencia.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href="https://wa.me/51933918047"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex h-[52px] items-center justify-center bg-black px-12 text-[11px] font-light uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#3d3d3d]"
          >
            Contáctanos
          </a>
          <Link
            href="/productos"
            className="group inline-flex h-[52px] items-center justify-center border border-black px-12 text-[11px] font-light uppercase tracking-[0.14em] text-black transition-colors hover:bg-black hover:text-white"
          >
            Ver Tienda
          </Link>
        </div>
      </div>
    </section>
  );
}
