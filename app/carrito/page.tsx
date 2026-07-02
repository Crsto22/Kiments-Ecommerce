"use client";

import { CartContent } from "@/components/CartContent";
import { useCart } from "@/components/CartProvider";
import { CartCheckoutBar } from "@/components/carrito/CartCheckoutBar";

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
      {items.length > 0 && <CartCheckoutBar subtotal={subtotal} />}
    </main>
  );
}
