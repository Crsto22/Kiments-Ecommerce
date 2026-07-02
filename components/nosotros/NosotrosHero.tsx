import Image from "next/image";

export function NosotrosHero() {
  return (
    <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-[#eee9e2] px-7 pt-20 sm:min-h-[60vh] sm:px-10 lg:px-16 xl:px-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/banner-arriba.jpg"
          alt="Fondo Nosotros"
          fill
          className="object-cover opacity-30 mix-blend-multiply"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="text-[38px] font-medium tracking-[0.14em] text-black sm:text-[48px] lg:text-[64px] xl:text-[80px]">
          NOSOTROS
        </h1>
        <p className="mt-5 text-[10px] font-light uppercase tracking-[0.22em] text-black/70 sm:text-[12px] lg:text-[13px]">
          Nuestra Historia y Esencia
        </p>
      </div>
    </section>
  );
}
