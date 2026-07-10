"use client";

import Link from "next/link";
import { Tag } from "@phosphor-icons/react";
import type { CartComboPendiente, CartComboResumen } from "@/components/CartProvider";

interface CartCheckoutBarProps {
  subtotal: number;
  total: number;
  descuentoPromocion: number;
  combosAplicados?: CartComboResumen[];
  combosPendientes?: CartComboPendiente[];
}

function pendingComboText(combo: CartComboPendiente) {
  const pending = combo.faltantes?.[0];
  if (pending) {
    return `Agrega ${pending.cantidadFaltante} ${pending.nombreProducto} mas para acceder al descuento`;
  }
  if (combo.mensaje) {
    return combo.mensaje.replace(/\s+para\s+.+$/i, " para acceder al descuento");
  }
  return combo.regla;
}

function comboDiscountRows(combos: CartComboResumen[]) {
  const rows = new Map<string, { label: string; descuento: number }>();
  for (const combo of combos) {
    const key = `${combo.nombre}-${combo.regla}`;
    const row = rows.get(key);
    rows.set(key, {
      label: `Descuento ${combo.regla}`,
      descuento: (row?.descuento ?? 0) + combo.descuento,
    });
  }
  return Array.from(rows.entries());
}

function pendingComboRows(combos: CartComboPendiente[]) {
  return Array.from(new Set(combos.map(pendingComboText))).slice(0, 2);
}

export function CartCheckoutBar({
  subtotal,
  total,
  descuentoPromocion,
  combosAplicados = [],
  combosPendientes = [],
}: CartCheckoutBarProps) {
  const discountRows = comboDiscountRows(combosAplicados);
  const pendingRows = pendingComboRows(combosPendientes);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white px-5 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] sm:px-8">
      <div className="mx-auto max-w-5xl">
        {pendingRows.length > 0 && (
          <div className="mb-4 space-y-2 border-b border-black/10 pb-4 text-[12px] text-emerald-700">
            {pendingRows.map((text) => (
              <p key={text} className="flex items-start gap-2">
                <Tag size={14} weight="bold" className="mt-0.5 shrink-0" />
                <span>{text}</span>
              </p>
            ))}
          </div>
        )}
        {descuentoPromocion > 0 && (
          <div className="mb-4 space-y-2 border-b border-black/10 pb-4 text-[12px]">
            <div className="flex items-center justify-between text-black/55">
              <span>Subtotal</span>
              <span>S/ {subtotal.toFixed(2)}</span>
            </div>
            {discountRows.map(([key, combo]) => (
              <div key={key} className="flex items-start justify-between gap-4 text-emerald-700">
                <span>{combo.label}</span>
                <span className="shrink-0">-S/ {combo.descuento.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[13px] font-medium uppercase tracking-widest">
            Total
          </span>
          <div className="flex items-end gap-2">
            <span className="mb-0.5 text-[10px] text-black/50">PEN</span>
            <span className="text-xl font-semibold">S/ {total.toFixed(2)}</span>
          </div>
        </div>
        <Link
          href="/pago"
          className="flex h-[48px] w-full items-center justify-center rounded-md bg-black px-5 text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/80 active:scale-[0.98]"
        >
          Ir a Pagar
        </Link>
      </div>
    </div>
  );
}
