"use client";

import { useState } from "react";
import { Plus, Minus } from "@phosphor-icons/react/dist/ssr";

interface FaqAccordionProps {
  items: { question: string; answer: string }[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="border-b border-black/15 last:border-0">
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="group flex w-full items-center justify-between py-7 text-left transition-colors"
            >
              <h3 className={`text-[13px] font-medium uppercase tracking-[0.06em] transition-colors sm:text-sm ${isOpen ? 'text-black' : 'text-black/80 group-hover:text-black'}`}>
                {item.question}
              </h3>
              <span className={`ml-6 shrink-0 transition-transform duration-500 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
                {isOpen ? (
                  <Minus size={20} weight="thin" className="text-black" />
                ) : (
                  <Plus size={20} weight="thin" className="text-black/60 group-hover:text-black" />
                )}
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? "max-h-[500px] opacity-100 pb-7" : "max-h-0 opacity-0"
              }`}
            >
              <p className="pr-8 text-sm font-light leading-relaxed text-black/60 sm:text-[15px]">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
