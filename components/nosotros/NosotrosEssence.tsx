import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function NosotrosEssence() {
  return (
    <section className="px-7 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32 xl:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">
          <div className="relative order-2 aspect-[4/5] w-full overflow-hidden bg-[#eee9e2] lg:order-1">
            <Image
              src="/img/productos/Producto01.jpg"
              alt="Nuestra Esencia"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
          </div>

          <div className="order-1 flex flex-col justify-center text-[#242424] lg:order-2">
            <h2 className="text-2xl font-medium uppercase tracking-[0.12em] sm:text-3xl lg:text-4xl">
              Nuestra Esencia
            </h2>
            <div className="mt-8 space-y-6 text-sm font-light leading-relaxed text-black/70 sm:text-base lg:text-lg lg:leading-loose">
              <p>
                En <span className="font-semibold text-black">KIMENTS</span>, creemos en la moda como una forma de expresion personal y autentica. Nacimos con el proposito de ofrecer prendas que combinen elegancia, comodidad y un estilo atemporal que trascienda temporadas.
              </p>
              <p>
                Cada una de nuestras piezas es cuidadosamente seleccionada y disenada para resaltar la belleza natural. Utilizamos materiales de la mas alta calidad y prestamos una meticulosa atencion a cada detalle.
              </p>
              <p>
                Nuestro compromiso es brindarte no solo ropa, sino una experiencia de estilo completa que te acompane en cada momento importante de tu vida.
              </p>
            </div>

            <div className="mt-12">
              <Link
                href="/productos"
                className="group inline-flex items-center gap-4 border-b border-black pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-black transition-all hover:gap-6 hover:text-black/70"
              >
                Descubrir Colecciones
                <ArrowRight size={16} weight="light" className="transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
