"use client";

import Image from "next/image";
import Link from "next/link";
import { Storefront, ShoppingCartSimple, CaretDown, CaretUp, CaretRight } from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useState } from "react";

const cartItems = [
  {
    name: "Modelo Anguie",
    color: "Ivory",
    size: "10",
    quantity: 1,
    price: 249,
    image: "/img/productos/Producto02.jpg",
  },
  {
    name: "Modelo Anguie",
    color: "Ivory",
    size: "10",
    quantity: 1,
    price: 249,
    image: "/img/productos/Producto01.jpg",
  },
];

type ShippingMethod = {
  label: string;
  image?: string;
  imageAlt?: string;
  imageClassName?: string;
  icon?: ComponentType<{ size?: number; weight?: "light" | "regular"; className?: string }>;
};

const shippingMethods: ShippingMethod[] = [
  {
    label: "SHALOM",
  },
  {
    label: "MOTORIZADO",
    image: "/img/metodo-envio/Motorizado.png",
    imageAlt: "Motorizado",
    imageClassName: "h-10 w-12 object-contain",
  },
  {
    label: "RECOJO EN TIENDA",
    icon: Storefront,
  },
];

const paymentMethods = [
  {
    label: "YAPE",
    image: "/img/metodo-pago/yape.jpg",
    imageAlt: "Yape",
    imageClassName: "size-12 rounded-md object-contain",
    type: "yape",
  },
  {
    label: "TRANSFERENCIA",
    image: "/img/metodo-pago/bcp.svg",
    imageAlt: "BCP",
    imageClassName: "h-9 w-24 object-contain",
    type: "transfer",
  },
];

export default function PagoPage() {
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-white text-[#222]">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row-reverse lg:min-h-screen">
        
        {/* RIGHT COLUMN: ORDER SUMMARY (Mobile Accordion / Desktop Sidebar) */}
        <section className="w-full bg-[#fafafa] lg:w-[45%] lg:border-l lg:border-gray-200 xl:w-[42%]">
          {/* Mobile Accordion Toggle */}
          <div className="border-b border-gray-200 bg-[#f5f5f5] lg:hidden">
            <button
              type="button"
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="flex w-full items-center justify-between px-5 py-5 text-sm"
            >
              <div className="flex items-center gap-2 text-[#2458b8]">
                <ShoppingCartSimple size={20} />
                <span>
                  {showMobileSummary
                    ? "Ocultar resumen del pedido"
                    : "Mostrar resumen del pedido"}
                </span>
                {showMobileSummary ? <CaretUp size={14} /> : <CaretDown size={14} />}
              </div>
              <span className="text-lg font-medium text-black">
                S/ {total.toFixed(2)}
              </span>
            </button>
          </div>

          {/* Cart Content (Hidden on mobile if showMobileSummary is false, visible on Desktop) */}
          <div
            className={`px-5 py-6 sm:px-10 lg:block lg:px-10 lg:py-12 ${
              showMobileSummary ? "block" : "hidden"
            }`}
          >
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <div key={`${item.name}-${index}`} className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <span className="absolute -right-2 -top-2 flex size-[22px] items-center justify-center rounded-full bg-black/60 text-[11px] font-medium text-white shadow-sm">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 text-sm font-light">
                    <p className="font-medium text-black">{item.name}</p>
                    <p className="text-black/60">{item.color} / {item.size}</p>
                  </div>
                  <div className="text-sm font-medium">S/ {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between py-2 font-light text-black/70">
                <span>Subtotal</span>
                <span className="text-black font-medium">S/ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-light text-black/70">
                <span>Envío</span>
                <span className="text-[12px]">Calculado en el próximo paso</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4">
              <span className="text-base font-medium">Total</span>
              <div className="flex items-end gap-2">
                <span className="text-xs text-black/50 mb-1">PEN</span>
                <span className="text-2xl font-semibold">S/ {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* LEFT COLUMN: CHECKOUT FORM */}
        <section className="w-full bg-white px-5 py-8 sm:px-10 lg:w-[55%] lg:px-16 lg:py-12 xl:w-[58%] xl:px-20">
          
          {/* Mobile Header */}
          <header className="mb-6 flex items-center justify-center lg:hidden">
            <Link href="/" className="inline-block text-center">
              <span className="font-[family-name:var(--font-kiments)] text-[32px] font-normal tracking-[0.16em]">
                KIMENTS
              </span>
            </Link>
          </header>
          
          {/* Logo & Breadcrumb Header Desktop */}
          <header className="mb-8 hidden lg:block">
            <Link href="/" className="inline-block">
              <span className="font-[family-name:var(--font-kiments)] text-[36px] font-normal tracking-[0.16em]">
                KIMENTS
              </span>
            </Link>
          </header>

          <div className="mb-8 flex items-center gap-2 text-[13px] text-black/60">
            <Link href="/categorias" className="transition-colors hover:text-black">Carrito</Link>
            <CaretRight size={10} weight="bold" />
            <span className="font-medium text-black">Información y pago</span>
          </div>

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            
            {/* Contact / Doc */}
            <section>
              <h2 className="mb-4 text-xl font-medium text-[#222]">Información de contacto</h2>
              <div className="grid grid-cols-[100px_1fr] overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                <select
                  aria-label="Tipo de documento"
                  defaultValue="DNI"
                  className="h-12 border-r border-gray-300 bg-transparent px-3 text-sm font-light outline-none"
                >
                  <option>DNI</option>
                  <option>RUC</option>
                  <option>CE</option>
                </select>
                <input
                  aria-label="Numero DNI o RUC"
                  placeholder="Número de Documento"
                  className="h-12 px-4 text-sm font-light outline-none"
                />
              </div>
            </section>

            {/* Names */}
            <section>
              <h2 className="mb-4 text-xl font-medium text-[#222]">Nombre y Apellidos</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Nombres" />
                <Input placeholder="Apellidos" />
              </div>
            </section>

            {/* Shipping */}
            <section>
              <h2 className="mb-4 text-xl font-medium text-[#222]">Método de envío</h2>
              <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
                {shippingMethods.map((method, index) => (
                  <label
                    key={method.label}
                    className={`flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50 ${
                      index !== shippingMethods.length - 1 ? "border-b border-gray-200" : ""
                    } ${selectedShippingMethod === method.label ? "bg-gray-50 border-black/10" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.label}
                        checked={selectedShippingMethod === method.label}
                        onChange={() => setSelectedShippingMethod(method.label)}
                        className="size-[18px] accent-black"
                      />
                      <span className="text-sm font-light text-[#222]">{method.label}</span>
                    </div>
                    {method.image && (
                      <Image src={method.image} alt={method.label} width={40} height={40} className="object-contain" />
                    )}
                    {method.icon && <method.icon size={24} weight="light" className="text-black/60" />}
                  </label>
                ))}
              </div>
            </section>

            {/* Payment */}
            <section>
              <h2 className="mb-4 text-xl font-medium text-[#222]">Pago</h2>
              <p className="mb-4 text-[13px] text-black/60">Todas las transacciones son seguras y están cifradas.</p>
              
              <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
                {paymentMethods.map((method, index) => (
                  <div key={method.label}>
                    <label
                      className={`flex cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-50 ${
                        index !== 0 ? "border-t border-gray-200" : ""
                      } ${selectedPaymentMethod === method.label ? "bg-gray-50" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.label}
                          checked={selectedPaymentMethod === method.label}
                          onChange={() => setSelectedPaymentMethod(method.label)}
                          className="size-[18px] accent-black"
                        />
                        <span className="text-sm font-medium text-[#222]">{method.label}</span>
                      </div>
                      {method.image && (
                        <Image src={method.image} alt={method.label} width={60} height={32} className="h-6 w-auto object-contain mix-blend-multiply" />
                      )}
                    </label>

                    {/* Accordion content for selected payment method */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        selectedPaymentMethod === method.label ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="border-t border-gray-200 bg-[#fafafa] p-5">
                        {method.type === "yape" ? (
                          <div className="flex flex-col items-center gap-5 sm:flex-row">
                            <Image
                              src="/img/metodo-pago/yape.jpg"
                              alt="QR de Yape"
                              width={120}
                              height={120}
                              className="size-24 rounded-md object-contain shadow-sm border border-black/5"
                            />
                            <div className="text-center sm:text-left">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-black/50">Yapea a nombre de</p>
                              <p className="mt-1 text-base font-semibold text-[#222]">KIMENTS</p>
                              <p className="mt-2 text-[13px] text-black/70">Escanea el QR para realizar el pago al instante. El pedido será confirmado tras verificar la transacción.</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-black/50">Código de transferencia BCP</p>
                            <div className="inline-block rounded-md border border-gray-300 bg-white px-4 py-2 text-[15px] font-medium tracking-widest text-[#222] shadow-sm">
                              002-194-001234567890-51
                            </div>
                            <p className="mt-3 text-[13px] text-black/70">Realiza tu transferencia a esta cuenta y envíanos tu voucher para confirmar.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Terms */}
            <label className="flex cursor-pointer items-start gap-3 mt-8">
              <input type="checkbox" className="mt-1 size-4 shrink-0 accent-black rounded border-gray-300" />
              <span className="text-[13px] leading-5 text-black/80">
                He leído y acepto los{" "}
                <Link href="/terminos-y-condiciones" className="underline hover:text-black font-medium">
                  Términos y Condiciones
                </Link>{" "}
                de compra del sitio web.
              </span>
            </label>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="flex h-[56px] w-full items-center justify-center rounded-md bg-black px-6 text-[15px] font-medium tracking-wide text-white transition-colors hover:bg-black/80"
              >
                Pagar ahora
              </button>
            </div>
            
          </form>

          {/* Footer links */}
          <footer className="mt-14 border-t border-gray-200 pt-6">
            <div className="flex gap-4 text-[12px] text-[#222]/60">
              <Link href="/terminos-y-condiciones" className="hover:text-black hover:underline transition-colors">Términos de servicio</Link>
              <Link href="/preguntas-frecuentes" className="hover:text-black hover:underline transition-colors">Preguntas Frecuentes</Link>
            </div>
          </footer>
        </section>

      </div>
    </main>
  );
}

function Input({ placeholder }: Readonly<{ placeholder: string }>) {
  return (
    <input
      placeholder={placeholder}
      className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm font-light outline-none transition-shadow focus:border-black focus:ring-1 focus:ring-black"
    />
  );
}
