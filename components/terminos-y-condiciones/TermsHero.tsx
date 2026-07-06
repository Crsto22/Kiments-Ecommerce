import Image from "next/image";

export function TermsHero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#eee9e2] px-7 py-32 pt-40 text-center sm:px-10 lg:px-16 xl:px-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/banner-5.jpg"
          alt="Fondo Legal"
          fill
          sizes="100vw"
          className="object-cover opacity-20 mix-blend-multiply grayscale"
          priority
        />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mb-4 text-[10px] font-light uppercase tracking-[0.22em] text-black/60 sm:text-[11px]">
          Información Legal
        </p>
        <h1 className="text-[32px] font-medium tracking-[0.14em] text-black sm:text-[40px] lg:text-[52px]">
          TÉRMINOS Y CONDICIONES
        </h1>
        <p className="mt-6 text-[12px] font-light tracking-[0.05em] text-black/70 sm:text-sm">
          Última actualización: Julio de 2026
        </p>
      </div>
    </section>
  );
}
