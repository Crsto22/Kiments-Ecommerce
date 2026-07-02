import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { ProductoItem } from "@/types/producto";

interface HomeBestSellersProps {
  items: ProductoItem[];
  visible: boolean;
}

export function HomeBestSellers({ items, visible }: HomeBestSellersProps) {
  if (!visible) return null;

  return (
    <section className="bg-white px-6 py-12 text-[#242424]">
      <div className="grid items-center gap-10 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-[0.08em] sm:text-3xl">
            Productos más vendidos
          </h2>
          <p className="mt-3 text-sm font-light text-black/60">
            Descubre más de todos los productos mas vendidos
          </p>
          <div className="mt-6">
            <Link
              href="/productos"
              className="inline-flex h-10 min-w-28 items-center justify-center bg-[#3d3d3d] px-8 text-[11px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-black"
            >
              Explorar
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={`${item.producto.idProducto}-${item.color.idColor}`}>
              <ProductCard item={item} centered />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
