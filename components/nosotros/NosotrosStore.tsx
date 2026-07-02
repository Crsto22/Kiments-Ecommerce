import { ArrowRight, MapPin, Storefront } from "@phosphor-icons/react/dist/ssr";

export function NosotrosStore() {
  return (
    <section className="border-t border-black/5 bg-[#eee9e2] px-7 py-20 sm:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-24">
          <div className="order-2 flex flex-col justify-center text-[#242424] lg:order-1">
            <h2 className="text-2xl font-medium uppercase tracking-[0.12em] sm:text-3xl lg:text-4xl">
              Nuestra Tienda
            </h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-black/70 sm:text-base lg:text-lg">
              Visitanos y descubre nuestras colecciones en persona. Experimenta la calidad y el diseno de cada prenda de KIMENTS en nuestra tienda fisica.
            </p>

            <div className="mt-10 flex flex-col gap-8">
              <div className="flex items-start gap-5">
                <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
                  <MapPin size={24} weight="light" className="text-black" />
                </div>
                <div>
                  <h4 className="text-[13px] font-medium uppercase tracking-[0.1em] text-black">Direccion</h4>
                  <p className="mt-2 text-sm font-light leading-relaxed text-black/70">KIMENT&apos;S, Jr. Huanuco 1705-1707, La Victoria 15018, Peru</p>
                  <a href="https://maps.app.goo.gl/y2UpRRku5TkaRwG98" target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-black transition-colors hover:text-black/60">
                    Ver en Google Maps <ArrowRight size={14} weight="light" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/5 bg-white shadow-sm">
                  <Storefront size={24} weight="light" className="text-black" />
                </div>
                <div>
                  <h4 className="text-[13px] font-medium uppercase tracking-[0.1em] text-black">Horario de Atencion</h4>
                  <p className="mt-2 text-sm font-light leading-relaxed text-black/70">
                    Lunes a Viernes: 9:00 am - 7:00 pm<br />
                    Sabados: 9:00 am - 5:00 pm<br />
                    Domingos: No hay atencion
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative order-1 aspect-square w-full overflow-hidden bg-white ring-1 ring-inset ring-black/10 lg:order-2 lg:aspect-[4/3]">
            <iframe
              src="https://maps.google.com/maps?q=-12.0656129,-77.0148385&hl=es&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
