"use client";

import { CaretLeft, CaretRight, Tag } from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { ComboOfferCard } from "@/components/home/HomeComboOffers";
import { fetchPromociones } from "@/lib/api";
import type { EcommerceInicioCombo } from "@/types/producto";

const PAGE_SIZE = 9;
const SKELETON_KEYS = Array.from({ length: PAGE_SIZE }, (_, index) => `promo-skeleton-${index}`);

export default function PromocionesClient() {
  const [promociones, setPromociones] = useState<EcommerceInicioCombo[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPromociones({ page: pageNum, size: PAGE_SIZE });
      setPromociones(data.content ?? []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      fetchData(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    return () => {
      cancelled = true;
    };
  }, [fetchData, page]);

  const goToPage = (nextPage: number) => {
    if (nextPage >= 0 && nextPage < totalPages) {
      setPage(nextPage);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-6 pb-20 pt-24 text-[#252525] sm:px-10 lg:px-16 xl:px-24">
      <section className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
            Ecommerce
          </p>
          <h1 className="text-3xl font-semibold uppercase tracking-[0.08em] sm:text-4xl">
            Promociones
          </h1>
          {!loading && !error && (
            <p className="text-sm font-light text-black/50">
              {totalElements} promocion{totalElements !== 1 ? "es" : ""} disponible{totalElements !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {loading && (
          <div className="grid gap-8 md:grid-cols-3">
            {SKELETON_KEYS.map((key) => (
              <div key={key} className="animate-pulse">
                <div className="mx-auto h-64 max-w-sm bg-white/70" />
                <div className="mx-auto mt-5 h-4 w-2/3 bg-black/10" />
                <div className="mx-auto mt-3 h-3 w-1/2 bg-black/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag size={40} weight="light" className="mb-4 text-black/30" />
            <p className="text-sm font-light text-black/60">{error}</p>
            <button
              type="button"
              onClick={() => fetchData(page)}
              className="mt-4 inline-flex h-9 items-center border border-black/15 bg-white px-4 text-sm font-light transition-colors hover:border-black"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && promociones.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag size={40} weight="light" className="mb-4 text-black/30" />
            <p className="text-sm font-light text-black/60">
              No hay promociones disponibles en este momento.
            </p>
          </div>
        )}

        {!loading && !error && promociones.length > 0 && (
          <>
            <div className="grid gap-10 md:grid-cols-3">
              {promociones.map((promo) => (
                <ComboOfferCard key={promo.idPromocionCombo} combo={promo} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-14 flex items-center justify-center gap-6">
                <button
                  type="button"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                  className="flex items-center gap-1.5 text-[13px] font-light text-black/50 transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <CaretLeft size={14} weight="bold" />
                  Anterior
                </button>

                <span className="text-[13px] font-light tabular-nums text-black/50">
                  {page + 1} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="flex items-center gap-1.5 text-[13px] font-light text-black/50 transition-colors hover:text-black disabled:cursor-not-allowed disabled:opacity-25"
                >
                  Siguiente
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
