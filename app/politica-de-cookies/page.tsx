import Link from "next/link";

export const metadata = {
  title: "Politica de Cookies",
  alternates: { canonical: "/politica-de-cookies" },
  description: "Politica de cookies y tecnologias similares usadas por KIMENTS en su ecommerce.",
};

const cookieSections = [
  {
    title: "01. Que son las cookies",
    paragraphs: [
      "Las cookies son pequenos archivos o identificadores que un sitio puede usar para recordar informacion del navegador, medir visitas o mejorar la experiencia de uso.",
    ],
  },
  {
    title: "02. Cookies y tecnologias que usamos",
    bullets: [
      "Cookies necesarias para que la tienda funcione correctamente.",
      "Cookies de preferencia para recordar algunos ajustes de navegacion.",
      "Cookies de medicion para conocer de forma general como se usa el sitio.",
    ],
  },
  {
    title: "03. Para que sirven",
    bullets: [
      "Entender que paginas se visitan mas.",
      "Mejorar secciones como productos, promociones, busqueda y carrito.",
      "Mantener productos agregados al carrito aunque cambies de pagina.",
      "Evitar mostrar repetidamente el aviso informativo de cookies.",
    ],
  },
  {
    title: "04. Medicion y mejora del sitio",
    paragraphs: [
      "Usamos informacion general de navegacion para entender que secciones funcionan mejor, detectar posibles mejoras y ofrecer una experiencia mas clara dentro de la tienda.",
      "Esta informacion se revisa de manera general y nos ayuda a mejorar paginas como productos, promociones, busqueda y carrito.",
    ],
  },
  {
    title: "05. Como controlar cookies",
    paragraphs: [
      "Puedes borrar o bloquear cookies desde la configuracion de tu navegador. Ten en cuenta que algunas funciones de la tienda podrian verse afectadas si desactivas todas las cookies.",
    ],
  },
];

export default function PoliticaDeCookiesPage() {
  return (
    <main className="min-h-screen bg-white px-7 py-28 text-black sm:px-10 lg:px-16 xl:px-20">
      <section className="mx-auto max-w-3xl">
        <p className="text-[10px] font-light uppercase tracking-[0.22em] text-black/55 sm:text-[11px]">
          Informacion legal
        </p>
        <h1 className="mt-5 text-3xl font-medium uppercase tracking-[0.12em] sm:text-4xl">
          Politica de Cookies
        </h1>
        <p className="mt-5 text-sm font-light leading-7 text-black/70 sm:text-base">
          Esta politica explica de forma simple como usamos cookies y tecnologias similares dentro del
          ecommerce KIMENTS.
        </p>

        <div className="mt-16 space-y-14">
          {cookieSections.map((section) => (
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
            <Link href="/politica-de-privacidad" className="font-medium text-black underline underline-offset-4">
              politica de privacidad
            </Link>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
