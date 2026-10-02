"use client";

import { useEffect, useState } from "react";

import { fetchEcommerceContacto } from "@/lib/api";
import type { CartItem } from "@/components/CartProvider";

export function buildCartWhatsAppUrl(
  numeroInternacional: string,
  items: CartItem[],
  subtotal: number,
  total: number,
  descuentoPromocion: number,
): string {
  const lines: string[] = ["Hola KIMENTS, quiero comprar por WhatsApp:"];

  items.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    lines.push(
      "",
      `${index + 1}. ${item.name}`,
      `Color: ${item.colorName} | Talla: ${item.sizeName}`,
      `Cantidad: ${item.quantity} x S/ ${item.price.toFixed(2)} = S/ ${lineTotal.toFixed(2)}`,
    );
  });

  lines.push("", `Subtotal: S/ ${subtotal.toFixed(2)}`);
  if (descuentoPromocion > 0) {
    lines.push(`Descuento: -S/ ${descuentoPromocion.toFixed(2)}`);
  }
  lines.push(`Total: S/ ${total.toFixed(2)}`);

  return `https://wa.me/${numeroInternacional}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function useEcommerceWhatsApp(): string | null {
  const [numeroInternacional, setNumeroInternacional] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchEcommerceContacto()
      .then((data) => {
        if (cancelled) return;
        setNumeroInternacional(
          data.configurado ? data.whatsappNumeroInternacional ?? null : null,
        );
      })
      .catch(() => {
        if (!cancelled) setNumeroInternacional(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return numeroInternacional;
}
