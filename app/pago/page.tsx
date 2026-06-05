"use client";

import Image from "next/image";
import Link from "next/link";
import { Storefront, X } from "@phosphor-icons/react";
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
  icon?: ComponentType<{ size?: number; weight?: "light" | "regular" }>;
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
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f7f1f3] px-2 pb-12 pt-5 text-[#222] sm:px-4 lg:px-5">
      <div className="mx-auto w-full max-w-[1540px]">
        <div className="grid gap-4 lg:grid-cols-[minmax(420px,0.86fr)_minmax(560px,1.14fr)] xl:gap-6">
          <section>
            <div className="checkout-ticket bg-white px-5 py-8 text-center sm:px-7">
              <p className="text-xs font-light text-black/70">
                Precio total incluido IGV
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[0.02em] sm:text-3xl">
                S/ {total.toFixed(2)} PEN
              </p>
            </div>

            <form className="-mt-px space-y-5 rounded-md bg-white px-5 pb-8 pt-8 shadow-[0_12px_34px_rgba(0,0,0,0.16)] sm:px-7">
              <fieldset className="border-b border-dashed border-black/15 pb-6">
                <legend className="text-xs font-semibold">Documento de identidad</legend>
                <div className="mt-2 grid grid-cols-[88px_1fr] overflow-hidden rounded-md border border-black/10 bg-white">
                  <select
                    aria-label="Tipo de documento"
                    defaultValue="DNI"
                    className="h-12 border-r border-black/10 bg-white px-3 text-sm outline-none"
                  >
                    <option>DNI</option>
                    <option>RUC</option>
                    <option>CE</option>
                  </select>
                  <input
                    aria-label="Numero DNI o RUC"
                    placeholder="Numero DNI o RUC"
                    className="h-12 px-4 text-sm outline-none"
                  />
                </div>
                <p className="mt-1 text-right text-[10px] font-light text-[#2458b8]">
                  El documento debe ser de 8 caracteres.
                </p>
              </fieldset>

              <Field label="Nombre" placeholder="Nombre" />
              <Field label="Apellido" placeholder="Apellido" />

              <fieldset className="border-b border-dashed border-black/15 pb-6">
                <legend className="text-xs font-semibold">Metodo de envio</legend>
                <div className="mt-3 grid gap-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.label}
                      className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-md border bg-white px-4 py-2 text-sm font-light uppercase transition-colors ${
                        selectedShippingMethod === method.label
                          ? "border-black"
                          : "border-black/10 hover:border-black/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={method.label}
                        checked={selectedShippingMethod === method.label}
                        onChange={() => setSelectedShippingMethod(method.label)}
                        className="size-4 accent-black"
                      />
                      <span className="flex flex-1 items-center justify-between gap-4">
                        <span>{method.label}</span>
                        {method.image ? (
                          <Image
                            src={method.image}
                            alt={method.imageAlt ?? method.label}
                            width={344}
                            height={292}
                            quality={100}
                            className={method.imageClassName ?? "object-contain"}
                          />
                        ) : null}
                        {method.icon ? (
                          <method.icon size={31} weight="light" />
                        ) : null}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <fieldset className="border-b border-dashed border-black/15 pb-6">
                <legend className="text-xs font-semibold">Metodo de pago</legend>
                <div className="mt-3 grid gap-3">
                  {paymentMethods.map((method) => (
                    <div key={method.label}>
                      <label
                        className={`flex min-h-16 cursor-pointer items-center gap-4 rounded-md border bg-white px-4 py-3 text-sm font-light uppercase transition-colors ${
                          selectedPaymentMethod === method.label
                            ? "border-black"
                            : "border-black/10 hover:border-black/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.label}
                          checked={selectedPaymentMethod === method.label}
                          onChange={() => setSelectedPaymentMethod(method.label)}
                          className="size-4 accent-black"
                        />
                        <span className="flex flex-1 items-center justify-between gap-4">
                          <span>{method.label}</span>
                          <Image
                            src={method.image}
                            alt={method.imageAlt}
                            width={120}
                            height={64}
                            className={method.imageClassName}
                            quality={100}
                          />
                        </span>
                      </label>

                      <div
                        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
                          selectedPaymentMethod === method.label
                            ? "grid-rows-[1fr] opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden">
                          {method.type === "yape" ? (
                            <div className="mt-3 rounded-md border border-dashed border-black/15 bg-[#fafafa] p-4">
                              <div className="grid gap-4 sm:grid-cols-[116px_1fr] sm:items-center">
                                <Image
                                  src="/img/metodo-pago/yape.jpg"
                                  alt="QR de Yape"
                                  width={225}
                                  height={225}
                                  quality={100}
                                  className="mx-auto size-28 rounded-md object-contain sm:mx-0"
                                />
                                <div className="text-center sm:text-left">
                                  <p className="text-[11px] font-light uppercase tracking-[0.08em] text-black/55">
                                    Yapea a nombre de
                                  </p>
                                  <p className="mt-1 text-sm font-semibold uppercase">
                                    KIMENTS
                                  </p>
                                  <p className="mt-3 text-xs font-light leading-5 text-black/65">
                                    Escanea el QR y realiza el pago por el total del pedido.
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 rounded-md border border-dashed border-black/15 bg-[#fafafa] p-4">
                              <div className="flex items-center justify-between gap-4">
                                <Image
                                  src="/img/metodo-pago/bcp.svg"
                                  alt="BCP"
                                  width={160}
                                  height={76}
                                  className="h-8 w-24 object-contain"
                                />
                                <span className="text-[11px] font-light uppercase text-black/55">
                                  Transferencia
                                </span>
                              </div>
                              <div className="mt-4 rounded bg-white px-4 py-3">
                                <p className="text-[11px] font-light uppercase tracking-[0.08em] text-black/55">
                                  Codigo de transferencia
                                </p>
                                <p className="mt-1 break-all text-sm font-semibold tracking-[0.08em]">
                                  002-194-001234567890-51
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>

              <label className="flex items-start gap-3 text-xs font-light leading-5 text-black/85">
                <input type="checkbox" className="mt-1 size-4 accent-black" />
                <span>
                  He leido y acepto los{" "}
                  <Link href="/terminos-y-condiciones" className="font-medium underline">
                    Terminos y Condiciones
                  </Link>{" "}
                  de compra del sitio web.
                </span>
              </label>

              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center bg-[#1e1d1f] text-lg font-light uppercase tracking-[0.04em] text-white transition-colors hover:bg-black"
              >
                Finalizar pedido
              </button>
            </form>
          </section>

          <section>
            <header className="grid items-center gap-5 border-b border-dashed border-black/45 pb-7 md:grid-cols-[1fr_auto_1fr]">
              <p className="text-sm font-semibold lowercase">carrito</p>
              <Link href="/" aria-label="KIMENTS inicio" className="flex flex-col items-center leading-none">
                <span className="font-[family-name:var(--font-kiments)] text-[38px] font-normal tracking-[0.16em] sm:text-[46px]">
                  KIMENTS
                </span>
                <span className="mt-2 text-[9px] font-light uppercase tracking-[0.24em]">
                  Tienda de ropa
                </span>
              </Link>
              <div className="flex md:justify-end">
                <Link
                  href="/categorias"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-black/30 bg-white/45 px-5 text-xs font-light text-black transition-colors hover:border-black"
                >
                  Volver
                </Link>
              </div>
            </header>

            <div className="mt-10 space-y-5 border-t border-dashed border-white/75 pt-5">
              {cartItems.map((item, index) => (
                <article
                  key={`${item.name}-${index}`}
                  className="grid grid-cols-[86px_1fr] items-center gap-5 rounded-lg bg-white p-4 sm:grid-cols-[112px_1fr_auto]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#eee7ea]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-light uppercase tracking-[0.02em]">
                      {item.name}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded bg-[#f2f0f0] px-3 py-1 text-[10px] font-light uppercase">
                        Color: {item.color}
                      </span>
                      <span className="rounded bg-[#f2f0f0] px-3 py-1 text-[10px] font-light uppercase">
                        Talla: {item.size}
                      </span>
                    </div>
                    <div className="mt-5 inline-flex h-8 items-center rounded-full bg-[#f2f0f0] text-xs font-light">
                      <button type="button" aria-label="Eliminar producto" className="flex size-8 items-center justify-center">
                        <X size={13} weight="regular" />
                      </button>
                      <span className="flex w-8 items-center justify-center">{item.quantity}</span>
                      <button type="button" aria-label="Aumentar cantidad" className="flex size-8 items-center justify-center">
                        +
                      </button>
                    </div>
                  </div>
                  <p className="col-span-2 text-right text-sm font-semibold sm:col-span-1">
                    S/ {item.price.toFixed(2)}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  placeholder,
}: Readonly<{
  label: string;
  placeholder: string;
}>) {
  return (
    <label className="block border-b border-dashed border-black/15 pb-3">
      <span className="text-xs font-semibold">{label}</span>
      <input
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-md border border-black/10 bg-white px-4 text-sm outline-none transition-colors focus:border-black/45"
      />
    </label>
  );
}
