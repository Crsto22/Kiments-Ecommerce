"use client";

import Link from "next/link";
import { CartContent } from "@/components/CartContent";
import { useCart } from "@/components/CartProvider";

export default function CarritoPage() {
  const { items, subtotal } = useCart();

  return (
    <main className="flex min-h-screen flex-col bg-white pb-40 text-[#171717]">
      <CartContent
        backHref="back"
        backLabel="Regresar"
        footer={null}
        hideTotals
      />
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white px-5 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] sm:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[13px] font-medium uppercase tracking-widest">
                Total
              </span>
              <div className="flex items-end gap-2">
                <span className="mb-0.5 text-[10px] text-black/50">PEN</span>
                <span className="text-xl font-semibold">S/ {subtotal.toFixed(2)}</span>
              </div>
            </div>
            <Link
              href="/pago"
              className="flex h-[48px] items-center justify-center rounded-md bg-black px-5 text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/80 active:scale-[0.98]"
            >
              Ir a Pagar
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
