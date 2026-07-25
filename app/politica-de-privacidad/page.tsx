import Link from "next/link";

export const metadata = {
  title: "Politica de Privacidad",
  alternates: { canonical: "/politica-de-privacidad" },
  description: "Politica de privacidad de KIMENTS para compras, navegacion y atencion en la tienda online.",
};

const privacySections = [
  {
    title: "01. Informacion que podemos recopilar",
    paragraphs: [
      "Cuando usas nuestro ecommerce podemos recopilar datos necesarios para navegar, comprar y recibir atencion.",
    ],
    bullets: [
      "Datos de contacto que ingreses durante una compra o consulta.",
      "Informacion del pedido, productos, tallas, colores y cantidades seleccionadas.",
      "Comprobantes o archivos que subas durante el proceso de pago.",
      "Datos tecnicos de navegacion, como paginas visitadas, dispositivo, navegador y eventos de uso.",
    ],
  },
  {
    title: "02. Para que usamos tus datos",
    bullets: [
      "Procesar pedidos realizados en la tienda online.",
      "Coordinar pagos, entregas, cambios permitidos y atencion postventa.",
      "Responder consultas por nuestros canales de contacto.",
      "Mejorar la experiencia del ecommerce y revisar estadisticas de uso.",
      "Cumplir obligaciones legales, tributarias o de proteccion al consumidor.",
    ],
  },
  {
    title: "03. Herramientas de medicion",
    paragraphs: [
      "KIMENTS usa Google Analytics para entender el comportamiento general de navegacion en el sitio. Esta herramienta puede usar cookies o identificadores del navegador para generar estadisticas agregadas.",
      "El aviso de cookies del sitio es informativo y no bloquea la medicion actual.",
    ],
  },
  {
    title: "04. Almacenamiento local y carrito",
    paragraphs: [
      "El carrito se guarda en el navegador mediante localStorage para mantener tus productos seleccionados entre visitas. Esta informacion permanece en tu dispositivo hasta que limpies el carrito o borres los datos del navegador.",
    ],
  },
  {
    title: "05. Terceros y enlaces",
    paragraphs: [
      "Podemos apoyarnos en servicios externos para medicion, pagos, comunicaciones, alojamiento o funcionalidades necesarias de la tienda. Tambien podemos enlazar a redes sociales u otros canales oficiales de KIMENTS.",
    ],
  },
  {
    title: "06. Tus derechos",
    paragraphs: [
      "Puedes solicitar informacion, actualizacion o eliminacion de tus datos cuando corresponda segun la normativa aplicable. Para consultas, comunicate con KIMENTS por WhatsApp.",
    ],
  },
];

export default function PoliticaDePrivacidadPage() {
  return (
    <main className="min-h-screen bg-white px-7 py-28 text-black sm:px-10 lg:px-16 xl:px-20">
      <section className="mx-auto max-w-3xl">
        <p className="text-[10px] font-light uppercase tracking-[0.22em] text-black/55 sm:text-[11px]">
          Informacion legal
        </p>
        <h1 className="mt-5 text-3xl font-medium uppercase tracking-[0.12em] sm:text-4xl">
          Politica de Privacidad
        </h1>
        <p className="mt-5 text-sm font-light leading-7 text-black/70 sm:text-base">
          Esta politica explica como KIMENTS puede recopilar y usar datos relacionados con la navegacion,
          compras y atencion dentro del ecommerce.
        </p>

        <div className="mt-16 space-y-14">
          {privacySections.map((section) => (
            <article key={section.title}>
              <h2 className="text-lg font-medium uppercase tracking-[0.08em] text-black">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4 text-sm font-light leading-7 text-black/70 sm:text-base">
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 border-t border-black/10 pt-8 text-sm font-light leading-7 text-black/65">
          <p>Ultima actualizacion: Julio de 2026.</p>
          <p className="mt-3">
            Tambien puedes revisar nuestra{" "}
            <Link href="/politica-de-cookies" className="font-medium text-black underline underline-offset-4">
              politica de cookies
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
