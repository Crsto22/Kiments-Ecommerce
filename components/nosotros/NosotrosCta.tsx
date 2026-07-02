import Image from "next/image";
import Link from "next/link";

export function NosotrosCta() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#111318] px-7 py-24 text-center text-white sm:px-10 lg:px-16 lg:py-32 xl:px-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/banner-nosotros2.jpg"
          alt="Viste con proposito fondo"
          fill
          className="object-cover opacity-50 mix-blend-overlay grayscale"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        <h2 className="text-3xl font-medium tracking-[0.14em] sm:text-4xl lg:text-5xl">
          VISTE CON PROPOSITO
        </h2>
        <p className="mt-8 text-sm font-light leading-relaxed text-white/80 sm:text-base lg:text-lg">
          Unete a nuestra comunidad y descubre disenos exclusivos pensados para ti. En KIMENTS, la moda se encuentra con la elegancia cotidiana para redefinir tu estilo personal.
        </p>
        <div className="mt-12">
          <Link
            href="/productos"
            className="inline-flex h-[52px] items-center justify-center bg-white px-12 text-[11px] font-light uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#e0e0e0]"
          >
            Ir a la tienda
          </Link>
        </div>
      </div>
    </section>
  );
}
