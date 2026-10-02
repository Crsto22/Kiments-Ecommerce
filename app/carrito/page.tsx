"use client";

import { CartContent } from "@/components/CartContent";
import { useCart } from "@/components/CartProvider";
import { CartCheckoutBar } from "@/components/carrito/CartCheckoutBar";
import { useEcommerceWhatsApp } from "@/lib/whatsapp";

export default function CarritoPage() {
  const { items, subtotal, total, descuentoPromocion, comboResumen } = useCart();
  const whatsappNumeroInternacional = useEcommerceWhatsApp();

  return (
    <main className="flex min-h-screen flex-col bg-white pb-52 text-[#171717]">
      <CartContent
        backHref="back"
        backLabel="Regresar"
        footer={null}
        hideTotals
      />
      {items.length > 0 && (
        <CartCheckoutBar
          items={items}
          subtotal={subtotal}
          total={total}
          descuentoPromocion={descuentoPromocion}
          combosAplicados={comboResumen?.combosAplicados}
          combosPendientes={comboResumen?.combosPendientes}
          whatsappNumeroInternacional={whatsappNumeroInternacional}
        />
      )}
    </main>
  );
}
