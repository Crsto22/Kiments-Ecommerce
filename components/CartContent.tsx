"use client";

import Image from "next/image";
import Link from "next/link";
import { Basket, CaretLeft } from "@phosphor-icons/react";
import { type ReactNode, useCallback, useState } from "react";
import { MAX_CART_QUANTITY_PER_VARIANT, useCart } from "@/components/CartProvider";

interface CartContentProps {
  backHref: string;
  backLabel: string;
  footer: ReactNode;
  hideTotals?: boolean;
}

const EXIT_ANIMATION_MS = 400;

export function CartContent({ backHref, backLabel, footer, hideTotals }: CartContentProps) {
  const { items, count, subtotal, increase, decrease, remove } = useCart();
  const [removing, setRemoving] = useState<Set<number>>(new Set());
  const backClassName =
    "inline-flex items-center gap-2 text-[13px] font-light text-black/50 transition-colors hover:text-black";

  const animateOut = useCallback(
    (idProductoVariante: number) => {
      setRemoving((prev) => {
        if (prev.has(idProductoVariante)) return prev;
        const next = new Set(prev);
        next.add(idProductoVariante);
        return next;
      });
      window.setTimeout(() => {
        remove(idProductoVariante);
        setRemoving((prev) => {
          if (!prev.has(idProductoVariante)) return prev;
          const next = new Set(prev);
          next.delete(idProductoVariante);
          return next;
        });
      }, EXIT_ANIMATION_MS);
    },
    [remove],
  );

  const handleDecrease = useCallback(
    (idProductoVariante: number, currentQuantity: number) => {
      if (currentQuantity <= 1) {
        animateOut(idProductoVariante);
      } else {
        decrease(idProductoVariante);
      }
    },
    [animateOut, decrease],
  );

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-black/10 bg-white px-5 py-4 sm:px-8">
        {backHref === "back" ? (
          <button type="button" onClick={() => window.history.back()} className={backClassName}>
            <CaretLeft size={14} weight="bold" />
            {backLabel}
          </button>
        ) : (
          <Link href={backHref} className={backClassName}>
            <CaretLeft size={14} weight="bold" />
            {backLabel}
          </Link>
        )}
        <p className="text-sm font-light uppercase tracking-wider text-black/50">
          Carrito ({count})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-20 sm:px-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Basket size={48} weight="thin" className="mb-4 text-black/20" />
            <p className="mb-2 text-lg font-light text-black/40">
              Tu carrito está vacío
            </p>
            <Link
              href="/productos"
              className="mt-4 text-[13px] font-light text-black/60 underline transition-colors hover:text-black"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {items.map((item, index) => {
              const isRemoving = removing.has(item.idProductoVariante);
              return (
                <article
                  key={item.idProductoVariante}
                  className={`grid grid-cols-[90px_1fr] gap-5 border-b border-black/5 pb-6 ${
                    isRemoving
                      ? "cart-item-exit pointer-events-none"
                      : "animate-product-enter"
                  }`}
                  style={
                    isRemoving
                      ? undefined
                      : { animationDelay: `${Math.min(index, 8) * 60}ms` }
                  }
                >
                  <div className="relative aspect-[3/4] overflow-hidden border border-black/5 bg-gray-50">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        sizes="90px"
                        className="object-cover object-center"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-black/20">
                        <Basket size={24} weight="thin" />
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[13px] font-medium uppercase tracking-wide text-black">
                          {item.name}
                        </h3>
                        <p className="mt-1.5 text-[11px] font-light uppercase tracking-wider text-black/50">
                          Color: {item.colorName}
                        </p>
                        <p className="mt-0.5 text-[11px] font-light uppercase tracking-wider text-black/50">
                          Talla: {item.sizeName}
                        </p>
                      </div>
                      <p className="shrink-0 text-[13px] font-medium">
                        S/ {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-4">
                      <div className="inline-flex h-8 items-center rounded border border-gray-200 bg-white text-xs font-light shadow-sm">
                        <button
                          type="button"
                          aria-label="Disminuir cantidad"
                          onClick={() => handleDecrease(item.idProductoVariante, item.quantity)}
                          className="flex size-8 items-center justify-center transition-colors hover:bg-gray-50 hover:text-black/70"
                        >
                          -
                        </button>
                        <span className="flex w-8 items-center justify-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label="Aumentar cantidad"
                          onClick={() => increase(item.idProductoVariante)}
                          disabled={item.quantity >= Math.min(item.stock, MAX_CART_QUANTITY_PER_VARIANT)}
                          className="flex size-8 items-center justify-center transition-colors hover:bg-gray-50 hover:text-black/70 disabled:cursor-not-allowed disabled:text-black/20"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => animateOut(item.idProductoVariante)}
                        className="text-[10px] uppercase tracking-widest text-black/40 underline-offset-4 transition-colors hover:text-black hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {items.length > 0 && !hideTotals && (
        <div className="border-t border-black/10 bg-white px-5 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium uppercase tracking-widest">
              Total
            </span>
            <div className="flex items-end gap-2">
              <span className="mb-0.5 text-[10px] text-black/50">PEN</span>
              <span className="text-xl font-semibold">
                S/ {subtotal.toFixed(2)}
              </span>
            </div>
          </div>
          {footer}
        </div>
      )}
    </div>
  );
}
