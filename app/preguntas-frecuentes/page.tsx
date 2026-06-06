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
        answer: "Para Lima Metropolitana, el tiempo de entrega es de 2 a 5 días hábiles. Para envíos a provincias, el tiempo estimado es de 5 a 10 días hábiles dependiendo del destino y del operador logístico.",
      },
      {
        question: "¿Puedo hacer seguimiento a mi pedido?",
        answer: "¡Por supuesto! Una vez que tu pedido sea despachado, recibirás un correo electrónico con tu número de guía y un enlace para que puedas rastrearlo en todo momento.",
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
        answer: "Aceptamos cambios dentro de los 7 días calendario posteriores a la recepción de tu prenda. El producto debe estar en perfectas condiciones, sin uso, sin lavar y con sus etiquetas originales puestas.",
      },
      {
        question: "¿Puedo devolver un producto si no me gusta?",
        answer: "Sí, puedes realizar la devolución bajo las mismas condiciones de los cambios (7 días, etiquetas originales). Una vez verificado el estado de la prenda, emitiremos una nota de crédito o el reembolso correspondiente según el método de pago original.",
      },
      {
        question: "¿Qué prendas no admiten cambios?",
        answer: "Por motivos estrictos de higiene y seguridad, no aceptamos cambios ni devoluciones en prendas íntimas, trajes de baño y ciertos accesorios, salvo que presenten una falla comprobable de fábrica.",
      },
    ],
  },
  {
    category: "03. PAGOS Y SEGURIDAD",
    items: [
      {
        question: "¿Qué métodos de pago aceptan?",
        answer: "Aceptamos todas las tarjetas de crédito y débito (Visa, Mastercard, American Express, Diners Club) a través de nuestra pasarela de pagos segura. También ofrecemos la opción de transferencia bancaria directa o Yape/Plin.",
      },
      {
        question: "¿Es seguro comprar en KIMENTS?",
        answer: "Totalmente. Nuestro sitio web cuenta con un certificado SSL que encripta tus datos personales y bancarios. Nosotros no almacenamos la información de tus tarjetas; todo es procesado de manera segura por nuestra pasarela de pagos avalada.",
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
            <Link
              href="mailto:contacto@kiments.com"
              className="group inline-flex h-[52px] items-center justify-center bg-black px-12 text-[11px] font-light uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#3d3d3d]"
            >
              Contáctanos
            </Link>
            <Link
              href="/categorias"
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
