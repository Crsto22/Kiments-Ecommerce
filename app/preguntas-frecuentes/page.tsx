import Image from "next/image";
import Link from "next/link";
import { Question } from "@phosphor-icons/react/dist/ssr";
import { FaqAccordion } from "./faq-accordion";

export const metadata = {
  title: "Preguntas Frecuentes | KIMENTS",
  description: "Resuelve tus dudas sobre envíos, pagos y devoluciones en KIMENTS.",
};

const faqs = [
  {
    category: "01. ENVÍOS Y ENTREGAS",
    items: [
      {
        question: "¿Cuánto tiempo tarda en llegar mi pedido?",
        answer: "Una vez aceptado tu pedido, nuestro equipo se comunicará directamente contigo para coordinar el tiempo exacto y el tipo de envío, asegurándonos de brindarte la mejor opción (especialmente si es un envío a provincia).",
      },
      {
        question: "¿Puedo hacer seguimiento a mi pedido?",
        answer: "Ni bien revisemos la captura de tu pago, te llegará al correo registrado tu comprobante y la confirmación del pedido aceptado. A partir de ahí, nuestro equipo estará en contacto constante contigo para coordinar todos los detalles de la entrega.",
      },
      {
        question: "¿Hacen envíos internacionales?",
        answer: "Por el momento, nuestros envíos cubren únicamente el territorio peruano. Esperamos pronto llevar la experiencia KIMENTS a más países.",
      },
    ],
  },
  {
    category: "02. CAMBIOS Y DEVOLUCIONES",
    items: [
      {
        question: "¿Cuál es la política de cambios?",
        answer: "No aceptamos cambios ni devoluciones de prendas. La única excepción a esta regla es si el producto que recibiste presenta una falla comprobable de fábrica o si hubo un error por parte de nuestro equipo al procesar tu orden.",
      },
      {
        question: "¿Puedo devolver un producto si no me gusta?",
        answer: "No. Al confirmar tu compra, aceptas que no realizamos devoluciones por insatisfacción, cambio de opinión o error en la elección de talla por parte del cliente. Te sugerimos revisar bien los detalles de tu pedido antes de finalizarlo.",
      },
      {
        question: "¿Qué prendas no admiten cambios?",
        answer: "Por política estricta de la empresa, ninguna de nuestras prendas admite cambios ni devoluciones, salvo las excepciones puntuales mencionadas anteriormente por fallas de fábrica.",
      },
    ],
  },
  {
    category: "03. PAGOS Y SEGURIDAD",
    items: [
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos únicamente transferencias bancarias directas y Yape a través de nuestra plataforma segura.",
      },
      {
        question: "¿Es seguro comprar en KIMENTS?",
        answer: "Totalmente. Nuestro sitio web cuenta con un certificado SSL que encripta tus datos personales y bancarios. Nosotros no almacenamos la información de tus tarjetas; todo es procesado de manera segura por nuestra pasarela de pagos avalada.",
      },
      {
        question: "¿Cuánto tiempo tengo para realizar y confirmar mi pago?",
        answer: "Al llegar al Paso 2, tendrás exactamente 10 minutos para realizar tu pago (vía Yape o depósito) y subir la captura de pantalla de tu comprobante. Si transcurren los 10 minutos sin confirmación, la compra quedará invalidada. Al iniciar este paso, te enviaremos un correo con un enlace de recuperación por si recargas, cierras o pierdes la página por error (dicho enlace también caducará al agotarse tus 10 minutos iniciales).",
      },
    ],
  },
  {
    category: "04. PROCESO DE COMPRA",
    items: [
      {
        question: "¿Cuántos productos de una misma variante puedo comprar?",
        answer: "Para garantizar que todos nuestros clientes tengan la oportunidad de adquirir nuestras prendas, puedes comprar un máximo de 5 unidades por variante (es decir, el mismo modelo, color y talla) en un solo pedido.",
      },
      {
        question: "¿Qué hago cuando ya completé todos los pasos de mi compra?",
        answer: "Una vez que hayas completado tu proceso de pago y subido tu comprobante correctamente, nuestro equipo verificará tu pedido y comenzaremos a prepararlo. Si necesitas ayuda adicional o quieres agilizar una consulta sobre tu orden, puedes comunicarte de inmediato con nosotros a nuestro WhatsApp: +51 933918047.",
      },
    ],
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#111318] px-7 py-32 text-center text-white sm:px-10 lg:px-16 xl:px-20 pt-40">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/banner-4.jpg"
            alt="Fondo Preguntas"
            fill
            className="object-cover opacity-50 mix-blend-overlay grayscale"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center">
          <Question size={32} weight="thin" className="mb-6 opacity-80" />
          <h1 className="text-[32px] font-medium tracking-[0.14em] sm:text-[40px] lg:text-[52px]">
            PREGUNTAS FRECUENTES
          </h1>
          <p className="mt-6 text-[12px] font-light tracking-[0.05em] text-white/70 sm:text-sm">
            Estamos aquí para ayudarte a resolver cualquier inquietud.
          </p>
        </div>
      </section>

      {/* FAQ Accordion/Grid Layout */}
      <section className="px-7 py-20 sm:px-10 lg:px-16 lg:py-28 xl:px-20">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-16 lg:space-y-24">
            {faqs.map((section) => (
              <div key={section.category} className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">

                {/* Category Title */}
                <div>
                  <h2 className="sticky top-24 text-lg font-medium tracking-[0.08em] text-black sm:text-xl">
                    {section.category}
                  </h2>
                  <div className="mt-4 h-[1px] w-12 bg-black/20 lg:hidden" />
                </div>

                {/* Questions & Answers Accordion */}
                <div className="w-full">
                  <FaqAccordion items={section.items} />
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Call to Action */}
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
    </main>
  );
}
