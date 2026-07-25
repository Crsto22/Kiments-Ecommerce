"use client";

import { CaretLeft, CaretRight, Tag } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ComboOfferCard } from "@/components/home/HomeComboOffers";
import { fetchPromociones } from "@/lib/api";
import type { EcommerceInicioCombo, EcommercePromocionesResponse } from "@/types/producto";

const PAGE_SIZE = 9;
const SKELETON_KEYS = Array.from({ length: PAGE_SIZE }, (_, index) => `promo-skeleton-${index}`);

export default function PromocionesClient({ initialData }: Readonly<{ initialData: EcommercePromocionesResponse | null }>) {
  const [promociones, setPromociones] = useState<EcommerceInicioCombo[]>(() => initialData?.content ?? []);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 0);
  const [totalElements, setTotalElements] = useState(initialData?.totalElements ?? 0);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetch = useRef(Boolean(initialData));

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
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
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
          <div className="grid gap-5 lg:grid-cols-2">
            {SKELETON_KEYS.map((key) => (
              <PromotionSkeletonCard key={key} />
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
            <div className="grid gap-5 lg:grid-cols-2">
              {promociones.map((promo, index) => (
                <div
                  key={promo.idPromocionCombo}
                  className="animate-product-enter"
                  style={{ animationDelay: `${Math.min(index, 5) * 70}ms` }}
                >
                  <ComboOfferCard combo={promo} />
                </div>
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

function PromotionSkeletonCard() {
  return (
    <div className="grid grid-cols-[1.1fr_0.9fr] overflow-hidden border border-black/10 bg-[#fbfaf7] sm:min-h-72 sm:grid-cols-[1.2fr_0.8fr]">
      <div className="grid min-h-44 grid-cols-2 bg-[#eee9e2] sm:min-h-72">
        <div className="animate-pulse bg-white" />
        <div className="animate-pulse border-l border-[#eee9e2] bg-white/80" />
      </div>
      <div className="flex min-w-0 flex-col justify-between border-l border-black/10 p-3.5 sm:p-6">
        <div className="animate-pulse space-y-2">
          <div className="h-2 w-24 rounded bg-black/10" />
          <div className="mt-4 h-4 w-4/5 rounded bg-black/10" />
          <div className="h-4 w-2/3 rounded bg-black/5" />
          <div className="mt-4 h-3 w-3/4 rounded bg-black/5" />
        </div>
        <div className="mt-3 border-t border-black/10 pt-3 sm:mt-6 sm:pt-4">
          <div className="h-2 w-20 animate-pulse rounded bg-black/10" />
          <div className="mt-3 flex items-baseline gap-2">
            <div className="h-5 w-24 animate-pulse rounded bg-black/10" />
            <div className="h-3 w-14 animate-pulse rounded bg-black/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
