import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Storefront } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Nosotros | KIMENTS",
  description: "Conoce la esencia y el propósito detrás de KIMENTS.",
};

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative flex min-h-[50vh] flex-col items-center justify-center overflow-hidden bg-[#eee9e2] px-7 sm:min-h-[60vh] sm:px-10 lg:px-16 xl:px-20 pt-20">
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

      {/* Main Content Area */}
      <section className="px-7 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-32 xl:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-24">

            {/* Image Column */}
            <div className="relative order-2 lg:order-1 aspect-[4/5] w-full overflow-hidden bg-[#eee9e2]">
              <Image
                src="/img/productos/Producto01.jpg"
                alt="Nuestra Esencia"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10" />
            </div>

            {/* Text Column */}
            <div className="order-1 lg:order-2 flex flex-col justify-center text-[#242424]">
              <h2 className="text-2xl font-medium uppercase tracking-[0.12em] sm:text-3xl lg:text-4xl">
                Nuestra Esencia
              </h2>
              <div className="mt-8 space-y-6 text-sm font-light leading-relaxed text-black/70 sm:text-base lg:text-lg lg:leading-loose">
                <p>
                  En <span className="font-semibold text-black">KIMENTS</span>, creemos en la moda como una forma de expresión personal y auténtica. Nacimos con el propósito de ofrecer prendas que combinen elegancia, comodidad y un estilo atemporal que trascienda temporadas.
                </p>
                <p>
                  Cada una de nuestras piezas es cuidadosamente seleccionada y diseñada para resaltar la belleza natural. Utilizamos materiales de la más alta calidad y prestamos una meticulosa atención a cada detalle, asegurando que cada prenda cuente una historia de dedicación.
                </p>
                <p>
                  Nuestro compromiso es brindarte no solo ropa, sino una experiencia de estilo completa que te acompañe en cada momento importante de tu vida. Descubre la diferencia de vestir con propósito, pasión y una identidad única.
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

      {/* Valores Section */}
      <section className="bg-white px-7 py-20 sm:px-10 lg:px-16 xl:px-20 border-t border-black/5">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-2xl font-medium uppercase tracking-[0.12em] sm:text-3xl text-[#242424]">
              Nuestros Valores
            </h2>
            <div className="mx-auto mt-6 h-[1px] w-12 bg-black/20" />
          </div>

          <div className="grid gap-12 sm:grid-cols-3 lg:gap-16">
            {/* Valor 1 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-light uppercase tracking-[0.2em] text-black/40 mb-4">01</span>
              <h3 className="text-xl font-medium tracking-[0.08em] text-black mb-4">Elegancia Atemporal</h3>
              <p className="text-sm font-light leading-relaxed text-black/60">
                Diseños que trascienden las tendencias pasajeras, creados para mantener su relevancia y sofisticación a lo largo del tiempo.
              </p>
            </div>
            {/* Valor 2 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-light uppercase tracking-[0.2em] text-black/40 mb-4">02</span>
              <h3 className="text-xl font-medium tracking-[0.08em] text-black mb-4">Calidad Premium</h3>
              <p className="text-sm font-light leading-relaxed text-black/60">
                Seleccionamos cada tejido y perfeccionamos cada costura, garantizando que cada pieza se sienta tan lujosa como se ve.
              </p>
            </div>
            {/* Valor 3 */}
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-light uppercase tracking-[0.2em] text-black/40 mb-4">03</span>
              <h3 className="text-xl font-medium tracking-[0.08em] text-black mb-4">Autenticidad</h3>
              <p className="text-sm font-light leading-relaxed text-black/60">
                Creemos que tu estilo es tu voz. Ofrecemos prendas que empoderan tu individualidad con carácter y sutileza.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tienda Fisica Section */}
      <section className="bg-[#eee9e2] px-7 py-20 sm:px-10 lg:px-16 xl:px-20 border-t border-black/5">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-24">
            
            {/* Info Column */}
            <div className="order-2 lg:order-1 flex flex-col justify-center text-[#242424]">
              <h2 className="text-2xl font-medium uppercase tracking-[0.12em] sm:text-3xl lg:text-4xl">
                Nuestra Tienda
              </h2>
              <p className="mt-6 text-sm font-light leading-relaxed text-black/70 sm:text-base lg:text-lg">
                Visítanos y descubre nuestras colecciones en persona. Experimenta la calidad y el diseño de cada prenda de KIMENTS en nuestra tienda física.
              </p>
              
              <div className="mt-10 flex flex-col gap-8">
                <div className="flex items-start gap-5">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-black/5">
                    <MapPin size={24} weight="light" className="text-black" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium uppercase tracking-[0.1em] text-black">Dirección</h4>
                    <p className="mt-2 text-sm font-light text-black/70 leading-relaxed">KIMENT'S, Jr. Huánuco 1705-1707, La Victoria 15018, Perú</p>
                    <a href="https://maps.app.goo.gl/y2UpRRku5TkaRwG98" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-black hover:text-black/60 transition-colors">
                      Ver en Google Maps <ArrowRight size={14} weight="light" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-5">
                  <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-black/5">
                    <Storefront size={24} weight="light" className="text-black" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-medium uppercase tracking-[0.1em] text-black">Horario de Atención</h4>
                    <p className="mt-2 text-sm font-light text-black/70 leading-relaxed">
                      Lunes a Viernes: 9:00 am - 7:00 pm<br/>
                      Sábados: 9:00 am - 5:00 pm<br/>
                      Domingos: No hay atención
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Column */}
            <div className="order-1 lg:order-2 relative aspect-square w-full lg:aspect-[4/3] overflow-hidden bg-white ring-1 ring-inset ring-black/10">
              <iframe 
                src="https://maps.google.com/maps?q=-12.0656129,-77.0148385&hl=es&z=17&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={false} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Secondary Banner */}
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
            VISTE CON PROPÓSITO
          </h2>
          <p className="mt-8 text-sm font-light leading-relaxed text-white/80 sm:text-base lg:text-lg">
            Únete a nuestra comunidad y descubre diseños exclusivos pensados para ti. En KIMENTS, la moda se encuentra con la elegancia cotidiana para redefinir tu estilo personal.
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
    </main>
  );
}
