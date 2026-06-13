"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretLeft } from "@phosphor-icons/react";
import { type ReactNode } from "react";

interface CartItem {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

const cartItems: CartItem[] = [
  {
    id: "1",
    name: "Modelo Anguie",
    color: "Ivory",
    size: "10",
    price: 249.0,
    quantity: 1,
    image: "/img/productos/Producto02.jpg",
  },
];

interface CartContentProps {
  backHref: string;
  backLabel: string;
  footer: ReactNode;
}

export function CartContent({ backHref, backLabel, footer }: CartContentProps) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <div className="flex h-full flex-col bg-white text-black">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 sm:px-8">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-[13px] font-light text-black/50 transition-colors hover:text-black"
        >
          <CaretLeft size={14} weight="bold" />
          {backLabel}
        </Link>
        <p className="text-sm font-light uppercase tracking-wider text-black/50">
          Carrito ({cartItems.length})
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-lg font-light text-black/40 mb-2">
              Tu carrito está vacío
            </p>
            <Link
              href="/productos"
              className="mt-4 text-[13px] font-light text-black/60 underline hover:text-black transition-colors"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {cartItems.map((item) => (
              <article
                key={item.id}
                className="grid grid-cols-[90px_1fr] gap-5 border-b border-black/5 pb-6"
              >
                <div className="relative aspect-[3/4] overflow-hidden border border-black/5 bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="90px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[13px] font-medium uppercase tracking-wide text-black">
                        {item.name}
                      </h3>
                      <p className="mt-1.5 text-[11px] font-light uppercase tracking-wider text-black/50">
                        Color: {item.color}
                      </p>
                      <p className="mt-0.5 text-[11px] font-light uppercase tracking-wider text-black/50">
                        Talla: {item.size}
                      </p>
                    </div>
                    <p className="shrink-0 text-[13px] font-medium">
                      S/ {item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4">
                    <div className="inline-flex h-8 items-center rounded border border-gray-200 bg-white text-xs font-light shadow-sm">
                      <button
                        type="button"
                        aria-label="Disminuir cantidad"
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
                        className="flex size-8 items-center justify-center transition-colors hover:bg-gray-50 hover:text-black/70"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="text-[10px] uppercase tracking-widest text-black/40 hover:text-black underline-offset-4 hover:underline transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
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
          <p className="mt-2 text-[11px] font-light text-black/50">
            Los impuestos y gastos de envío se calculan en la pantalla de pago.
          </p>

          {footer}
        </div>
      )}
    </div>
  );
}
