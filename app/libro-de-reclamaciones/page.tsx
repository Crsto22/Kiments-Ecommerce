import Link from "next/link";

export const metadata = {
  title: "Libro de Reclamaciones | KIMENTS",
  description: "Canal de atención para reclamos y quejas de KIMENTS.",
};

export default function LibroDeReclamacionesPage() {
  return (
    <main className="min-h-screen bg-white px-7 py-28 sm:px-10 lg:px-16 xl:px-20">
      <section className="mx-auto max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/50">
          Atención al cliente
        </p>
        <h1 className="mt-4 text-3xl font-medium tracking-[0.08em] text-black sm:text-4xl">
          Libro de Reclamaciones
        </h1>
        <div className="mt-8 space-y-4 text-sm font-light leading-relaxed text-black/70 sm:text-base">
          <p>
            Si necesitas registrar una queja o reclamo sobre tu compra, comunícate con nuestro equipo para atender tu caso y solicitar la información necesaria.
          </p>
          <p>
            Incluye tu nombre completo, número de pedido, documento de identidad, detalle del caso y fotografías si corresponde.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <a
            href="https://wa.me/51933918047"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white transition-colors hover:bg-black/80"
          >
            Escribir por WhatsApp
          </a>
          <Link
            href="/terminos-y-condiciones"
            className="flex h-12 items-center justify-center rounded-md border border-black/15 px-5 text-sm font-medium text-black transition-colors hover:border-black"
          >
            Ver políticas
          </Link>
        </div>
      </section>
    </main>
  );
}
