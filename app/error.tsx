"use client";

import Link from "next/link";
import { ArrowClockwise, House, WarningCircle } from "@phosphor-icons/react";

export default function ErrorPage({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-32 text-[#242424]">
      <section className="mx-auto flex max-w-xl flex-col items-center text-center">
        <WarningCircle size={42} weight="light" className="text-black/35" />
        <h1 className="mt-5 text-3xl font-light uppercase tracking-[0.08em]">Algo salio mal</h1>
        <p className="mt-4 max-w-md text-sm font-light leading-6 text-black/60">
          No pudimos cargar esta vista. Intenta nuevamente o vuelve al inicio.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-[12px] font-light uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/80"
          >
            <ArrowClockwise size={16} />
            Reintentar
          </button>
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
