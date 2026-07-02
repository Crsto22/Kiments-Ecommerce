"use client";

import { Storefront, Warning } from "@phosphor-icons/react";

interface HomeStateSectionsProps {
  error: string | null;
  loading: boolean;
  tiendaConfigurada: boolean;
}

export function HomeStateSections({ error, loading, tiendaConfigurada }: HomeStateSectionsProps) {
  if (loading) {
    return (
      <section className="bg-white px-7 py-12 sm:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-10 xl:gap-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="min-w-0 animate-pulse">
                <div className="aspect-[3/4] bg-[#eee9e2]" />
                <div className="mt-3 space-y-2">
                  <div className="size-4 rounded-full bg-black/10" />
                  <div className="h-4 w-3/4 rounded bg-black/10" />
                  <div className="h-3 w-1/3 rounded bg-black/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white px-7 py-16 sm:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <Warning size={32} weight="light" className="text-black/20" />
          <p className="text-sm font-light text-black/50">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-[13px] font-light text-black/60 underline transition-colors hover:text-black"
          >
            Reintentar
          </button>
        </div>
      </section>
    );
  }

  if (!tiendaConfigurada) {
    return (
      <section className="bg-white px-7 py-16 sm:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
          <Storefront size={32} weight="light" className="text-black/20" />
          <p className="text-sm font-light text-black/50">
            Tienda ecommerce no configurada
          </p>
          <p className="text-[13px] text-black/40">
            Vuelve pronto. Estamos preparando la tienda.
          </p>
        </div>
      </section>
    );
  }

  return null;
}
