import Link from "next/link";
import { ArrowLeft, House } from "@phosphor-icons/react/dist/ssr";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-32 text-[#242424]">
      <section className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-black/45">404</p>
        <h1 className="mt-4 text-3xl font-light uppercase tracking-[0.08em]">Pagina no encontrada</h1>
        <p className="mt-4 max-w-md text-sm font-light leading-6 text-black/60">
          El enlace no existe o el producto ya no esta disponible en la tienda.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/productos"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-[12px] font-light uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/80"
          >
            <ArrowLeft size={16} />
            Ver productos
          </Link>
          <Link
            href="/"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black/15 bg-white px-5 text-[12px] font-light uppercase tracking-[0.12em] text-black transition-colors hover:border-black"
          >
            <House size={16} />
            Inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
