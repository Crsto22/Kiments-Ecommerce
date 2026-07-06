"use client";

import Image from "next/image";

export interface OrderSummaryItem {
  key: string;
  name: string;
  colorName: string;
  sizeName: string;
  quantity: number;
  subtotal: number;
  image: string | null;
}

interface OrderSummaryProps {
  items: OrderSummaryItem[];
}

export default function OrderSummary({ items }: Readonly<OrderSummaryProps>) {
  return (
    <>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
            {item.image ? (
              <Image
                src={item.image}
                alt={item.name}
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.16em] text-black/25">
                KIMENTS
              </div>
            )}
            <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-medium text-white">
              {item.quantity}
            </span>
          </div>
          <div className="flex-1 text-sm font-light min-w-0">
            <p className="font-medium text-black truncate">{item.name}</p>
            <p className="text-black/60 truncate">{item.colorName} / {item.sizeName}</p>
          </div>
          <div className="text-sm font-medium shrink-0">S/ {item.subtotal.toFixed(2)}</div>
        </div>
      ))}
    </>
  );
}
