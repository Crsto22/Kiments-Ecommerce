import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function TermsCta() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-black px-7 py-20 text-center sm:px-10 lg:px-16 xl:px-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/banner-arriba.jpg"
          alt="Fondo Explorar"
          fill
          className="object-cover opacity-50 mix-blend-overlay grayscale"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-lg flex-col items-center">
        <h2 className="text-2xl font-medium tracking-[0.14em] text-white sm:text-3xl">
          CONTINUAR EXPLORANDO
        </h2>
        <Link
          href="/productos"
          className="group mt-10 inline-flex h-[52px] items-center justify-center bg-white px-12 text-[11px] font-light uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#e0e0e0]"
        >
          Ir a la tienda
          <ArrowRight size={16} weight="light" className="ml-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
