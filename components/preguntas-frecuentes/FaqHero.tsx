import Image from "next/image";
import { Question } from "@phosphor-icons/react/dist/ssr";

export function FaqHero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#111318] px-7 py-32 pt-40 text-center text-white sm:px-10 lg:px-16 xl:px-20">
      <div className="absolute inset-0 z-0">
        <Image
          src="/img/banner-4.jpg"
          alt="Fondo Preguntas"
          fill
          sizes="100vw"
          className="object-cover opacity-50 mix-blend-overlay grayscale"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
        <Question size={32} weight="thin" className="mb-6 opacity-80" />
        <h1 className="text-[32px] font-medium tracking-[0.14em] sm:text-[40px] lg:text-[52px]">
          PREGUNTAS FRECUENTES
        </h1>
        <p className="mt-6 text-[12px] font-light tracking-[0.05em] text-white/70 sm:text-sm">
          Estamos aquí para ayudarte a resolver cualquier inquietud.
        </p>
      </div>
    </section>
  );
}
