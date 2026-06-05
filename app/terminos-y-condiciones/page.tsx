import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Términos y Condiciones | KIMENTS",
  description: "Términos y condiciones de uso de la tienda virtual KIMENTS.",
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Elegant Header for Legal Page */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#eee9e2] px-7 py-32 text-center sm:px-10 lg:px-16 xl:px-20 pt-40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/banner-5.jpg"
            alt="Fondo Legal"
            fill
            className="object-cover opacity-20 mix-blend-multiply grayscale"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl">
          <p className="mb-4 text-[10px] font-light uppercase tracking-[0.22em] text-black/60 sm:text-[11px]">
            Información Legal
          </p>
          <h1 className="font-[family-name:var(--font-kiments)] text-[32px] font-normal tracking-[0.14em] text-black sm:text-[40px] lg:text-[52px]">
            TÉRMINOS Y CONDICIONES
          </h1>
          <p className="mt-6 text-[12px] font-light tracking-[0.05em] text-black/70 sm:text-sm">
            Última actualización: Junio de 2026
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="px-7 py-20 sm:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto max-w-3xl space-y-16">

          {/* Section 1 */}
          <div>
            <h2 className="font-[family-name:var(--font-kiments)] text-xl font-normal tracking-[0.08em] text-black mb-6">
              01. ASPECTOS GENERALES
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-black/75 sm:text-base">
              <p>
                Bienvenido a <span className="font-semibold text-black">KIMENTS</span>. El acceso y uso de este sitio web, así como la compra de nuestros productos, están sujetos a los siguientes términos y condiciones. Al utilizar nuestro sitio, aceptas estas políticas en su totalidad.
              </p>
              <p>
                KIMENTS se reserva el derecho de actualizar, modificar o reemplazar cualquier parte de estas condiciones mediante la publicación de actualizaciones en nuestro sitio web. Es tu responsabilidad revisar esta página periódicamente para verificar los cambios.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="font-[family-name:var(--font-kiments)] text-xl font-normal tracking-[0.08em] text-black mb-6">
              02. POLÍTICA DE COMPRA Y PAGOS
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-black/75 sm:text-base">
              <p>
                Todos los precios indicados en nuestro sitio web incluyen los impuestos correspondientes vigentes en Perú, salvo que se indique lo contrario. Los costos de envío se calculan de manera independiente al finalizar la compra.
              </p>
              <p>
                Aceptamos los principales métodos de pago, incluyendo tarjetas de crédito, débito y transferencias bancarias a través de plataformas de pago seguras y encriptadas. Tu información financiera nunca es almacenada en nuestros servidores.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="font-[family-name:var(--font-kiments)] text-xl font-normal tracking-[0.08em] text-black mb-6">
              03. ENVÍOS Y ENTREGAS
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-black/75 sm:text-base">
              <p>
                Procesamos los pedidos con la mayor agilidad posible. Los tiempos de entrega estimados varían entre 2 a 5 días hábiles para Lima Metropolitana, y de 5 a 10 días hábiles para provincias, dependiendo del operador logístico.
              </p>
              <p>
                KIMENTS no se hace responsable por retrasos generados por eventos de fuerza mayor o problemas ajenos a nuestra logística, pero siempre estaremos a tu disposición para ayudarte a rastrear tu pedido.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="font-[family-name:var(--font-kiments)] text-xl font-normal tracking-[0.08em] text-black mb-6">
              04. CAMBIOS Y DEVOLUCIONES
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-black/75 sm:text-base">
              <p>
                Queremos que estés completamente satisfecho con tus prendas. Aceptamos cambios dentro de los 7 días calendario posteriores a la recepción del producto, siempre y cuando las prendas no hayan sido usadas, lavadas y conserven sus etiquetas originales.
              </p>
              <p>
                Por razones de higiene, no se aceptan devoluciones de accesorios, trajes de baño o prendas íntimas, salvo por defecto de fábrica comprobado.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="font-[family-name:var(--font-kiments)] text-xl font-normal tracking-[0.08em] text-black mb-6">
              05. PRIVACIDAD DE DATOS
            </h2>
            <div className="space-y-4 text-sm font-light leading-relaxed text-black/75 sm:text-base">
              <p>
                Respetamos tu privacidad. Los datos personales proporcionados durante la navegación o compra serán utilizados única y exclusivamente para procesar tus pedidos y, si nos autorizas, para enviarte comunicaciones exclusivas sobre nuestras colecciones. No compartiremos tu información con terceros sin tu consentimiento.
              </p>
            </div>
          </div>

        </div>

        {/* Contact Note */}
        <div className="mx-auto mt-24 max-w-3xl border-t border-black/10 pt-12 text-center">
          <p className="text-sm font-light text-black/60">
            ¿Tienes alguna duda adicional sobre nuestras políticas? <br className="sm:hidden" />
            Escríbenos a <a href="mailto:contacto@kiments.com" className="text-black font-medium border-b border-black/20 hover:border-black transition-colors pb-0.5">contacto@kiments.com</a>
          </p>
        </div>
      </section>

      {/* Clean Call to Action */}
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
          <h2 className="font-[family-name:var(--font-kiments)] text-2xl font-light tracking-[0.14em] text-white sm:text-3xl">
            CONTINUAR EXPLORANDO
          </h2>
          <Link
            href="/categorias"
            className="group mt-10 inline-flex h-[52px] items-center justify-center bg-white px-12 text-[11px] font-light uppercase tracking-[0.14em] text-black transition-colors hover:bg-[#e0e0e0]"
          >
            Ir a la tienda
            <ArrowRight size={16} weight="light" className="ml-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}
