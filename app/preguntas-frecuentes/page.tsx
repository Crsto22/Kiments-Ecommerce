import { FaqCta } from "@/components/preguntas-frecuentes/FaqCta";
import { FaqHero } from "@/components/preguntas-frecuentes/FaqHero";
import { FaqSections, type FaqSection } from "@/components/preguntas-frecuentes/FaqSections";

export const metadata = {
  title: "Preguntas Frecuentes",
  alternates: { canonical: "/preguntas-frecuentes" },
  description: "Resuelve tus dudas sobre envíos, pagos y devoluciones en KIMENTS.",
};

const faqs: FaqSection[] = [
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
      <FaqHero />
      <FaqSections sections={faqs} />
      <FaqCta />
    </main>
  );
}
