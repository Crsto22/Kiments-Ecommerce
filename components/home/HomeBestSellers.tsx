import { ProductCard } from "@/components/ProductCard";
import { MobileBestSellersCarousel } from "@/components/home/MobileBestSellersCarousel";
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
            Productos mas vendidos
          </h2>
        </div>

        <MobileBestSellersCarousel items={items} />

        <div className="hidden gap-x-3 gap-y-8 sm:grid sm:grid-cols-3 lg:grid-cols-4">
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
