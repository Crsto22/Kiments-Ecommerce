"use client";

import { MagnifyingGlass, Warning } from "@phosphor-icons/react";
import { FormEvent, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { fetchProductos } from "@/lib/api";
import type { ProductoItem } from "@/types/producto";

const SKELETON_KEYS = Array.from({ length: 8 }, (_, index) => `search-skeleton-${index}`);

export default function BuscarClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const response = await fetchProductos({
        q: term,
        size: 24,
        soloDisponibles: false,
      });
      setResults(response.content);
    } catch (err) {
      setResults([]);
      setError(err instanceof Error ? err.message : "No se pudo realizar la busqueda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-5 pb-24 pt-20 text-[#252525] sm:px-10 sm:pb-20 sm:pt-24 lg:px-16 xl:px-24">
      <section className="mx-auto max-w-7xl">
        <h1 className="sr-only">Buscar productos</h1>
        <form onSubmit={search} className="mx-auto flex h-12 max-w-2xl border border-gray-300 bg-white">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar productos"
            placeholder="Buscar productos"
            className="min-w-0 flex-1 bg-transparent px-4 text-sm font-light outline-none placeholder:text-black/40"
          />
          <button
            type="submit"
            disabled={query.trim().length < 2 || loading}
            aria-label="Buscar"
            className="flex w-12 shrink-0 items-center justify-center bg-black text-white transition-opacity disabled:opacity-35"
          >
            <MagnifyingGlass size={20} weight="regular" />
          </button>
        </form>

        {!loading && !error && searched && (
          <p className="mt-5 text-center text-sm font-light text-black/50">
            {results.length} resultado{results.length === 1 ? "" : "s"}
          </p>
        )}

        {loading && (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
            {SKELETON_KEYS.map((key) => (
              <div key={key} className="animate-pulse">
                <div className="aspect-[3/4] rounded-md bg-white/70" />
                <div className="mt-4 h-3 w-2/3 bg-black/10" />
                <div className="mt-3 h-3 w-1/3 bg-black/5" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-20 text-center">
            <Warning size={38} weight="light" className="mb-4 text-black/30" />
            <p className="text-sm font-light text-black/60">{error}</p>
          </div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <p className="py-20 text-center text-sm font-light text-black/50">
            No se encontraron productos.
          </p>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-8 lg:grid-cols-4">
            {results.map((item) => (
              <ProductCard
                key={`${item.producto.idProducto}-${item.color.idColor}`}
                item={item}
                centered
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
