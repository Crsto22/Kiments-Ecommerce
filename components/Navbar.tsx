"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  MagnifyingGlass,
  ShoppingCartSimple,
} from "@phosphor-icons/react/dist/ssr";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const navItems = [
  { label: "INICIO", href: "/" },
  { label: "CATEGORIAS", href: "/categorias" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 24);
    };

    updateScrollState();
    const scrollCheck = window.setInterval(updateScrollState, 120);
    window.addEventListener("scroll", updateScrollState, { passive: true });
    document.addEventListener("scroll", updateScrollState, {
      passive: true,
      capture: true,
    });

    return () => {
      window.clearInterval(scrollCheck);
      window.removeEventListener("scroll", updateScrollState);
      document.removeEventListener("scroll", updateScrollState, {
        capture: true,
      });
    };
  }, [pathname]);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  if (pathname === "/pago") {
    return null;
  }

  const isLightOnHero = isHome && !isScrolled;
  const navText = isLightOnHero
    ? "text-white/90 hover:text-white"
    : "text-black/90 hover:text-black";
  const brandText = isLightOnHero ? "text-white" : "text-black";
  const iconText = isLightOnHero
    ? "text-white hover:text-white/75"
    : "text-black hover:text-black/70";
  const headerBackground = isLightOnHero
    ? "bg-transparent"
    : "bg-white shadow-[0_1px_12px_rgba(0,0,0,0.06)]";

  return (
    <header
      className={`fixed top-0 z-50 h-12 w-full transition-colors duration-300 sm:h-14 xl:h-16 ${
        isSearchOpen ? "bg-white shadow-[0_1px_12px_rgba(0,0,0,0.06)]" : headerBackground
      }`}
    >
      <button
        type="button"
        aria-label="Cerrar busqueda"
        onClick={() => setIsSearchOpen(false)}
        className={`fixed inset-x-0 bottom-0 top-12 bg-black/45 transition-opacity duration-300 sm:top-14 xl:top-16 ${
          isSearchOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <div
        className={`absolute inset-0 z-10 bg-white transition-all duration-300 ease-out ${
          isSearchOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto grid h-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-5 px-5 sm:px-10 lg:px-16 xl:px-20">
          <Link
            href="/"
            aria-label="KIMENTS inicio"
            className="flex min-w-[96px] flex-col leading-none text-black"
            onClick={() => setIsSearchOpen(false)}
          >
            <span className="font-[family-name:var(--font-kiments)] text-[20px] font-normal tracking-[0.14em] sm:text-[24px]">
              KIMENTS
            </span>
            <span className="mt-1 text-[6px] font-light uppercase tracking-[0.22em] sm:text-[7px]">
              Tienda de ropa
            </span>
          </Link>

          <form
            className="mx-auto flex h-9 w-full max-w-xl items-center border border-black bg-white px-3 text-black"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              ref={searchInputRef}
              type="search"
              aria-label="Buscar productos"
              placeholder="Buscar Productos"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsSearchOpen(false);
                }
              }}
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-light outline-none placeholder:text-black/45"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex size-7 items-center justify-center text-black"
            >
              <MagnifyingGlass size={19} weight="regular" />
            </button>
          </form>

          <CartDrawer triggerClassName="text-black hover:text-black/70" />
        </div>
      </div>

      <nav className="relative mx-auto flex h-full max-w-7xl items-center justify-end px-5 sm:justify-between sm:px-10 lg:px-16 xl:px-20">
        <div className="hidden h-full items-center gap-8 sm:flex sm:gap-12 xl:gap-16">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[12px] font-light leading-none tracking-wide transition-colors lg:text-[14px] xl:text-[16px] ${navText}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <Link
          href="/"
          aria-label="KIMENTS inicio"
          className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center leading-none"
        >
          <span className={`font-[family-name:var(--font-kiments)] text-[25px] font-normal tracking-[0.14em] sm:text-[28px] lg:text-[32px] xl:text-[38px] ${brandText}`}>
            KIMENTS
          </span>
          <span className={`mt-1 text-[6px] font-light uppercase tracking-[0.22em] sm:text-[7px] lg:text-[8px] xl:text-[9px] ${brandText}`}>
            TIENDA DE ROPA
          </span>
        </Link>

        <div
          className={`flex items-center gap-7 transition-opacity duration-200 xl:gap-9 ${
            isSearchOpen ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          <button
            type="button"
            aria-label="Abrir busqueda"
            aria-expanded={isSearchOpen}
            onClick={() => setIsSearchOpen(true)}
            className={`rounded-sm transition-colors ${iconText}`}
          >
            <MagnifyingGlass size={23} weight="thin" />
          </button>
          <CartDrawer triggerClassName={iconText} />
        </div>
      </nav>
    </header>
  );
}

function CartDrawer({ triggerClassName }: Readonly<{ triggerClassName: string }>) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Abrir carrito"
          className={`rounded-sm transition-colors ${triggerClassName}`}
        >
          <ShoppingCartSimple size={24} weight="thin" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="border-b border-black/10">
          <DrawerTitle>Carrito</DrawerTitle>
          <DrawerDescription className="sr-only">
            Revisa los productos agregados al carrito antes de continuar al pago.
          </DrawerDescription>
        </DrawerHeader>

              <div className="flex flex-1 flex-col gap-5 px-6 py-6">
                <article className="grid grid-cols-[82px_1fr] gap-4 border-b border-black/10 pb-5">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#f1ecee]">
                    <Image
                      src="/img/productos/Producto02.jpg"
                      alt="Modelo Anguie"
                      fill
                      sizes="82px"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-light uppercase leading-tight">
                          Modelo Anguie
                        </h3>
                        <p className="mt-2 text-[11px] font-light uppercase text-black/55">
                          Color: Ivory
                        </p>
                        <p className="mt-1 text-[11px] font-light uppercase text-black/55">
                          Talla: 10
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium">S/ 249.00</p>
                    </div>
                    <div className="mt-5 inline-flex h-8 items-center bg-[#f3f1f1] text-xs font-light">
                      <button
                        type="button"
                        aria-label="Disminuir cantidad"
                        className="flex size-8 items-center justify-center"
                      >
                        -
                      </button>
                      <span className="flex w-8 items-center justify-center">1</span>
                      <button
                        type="button"
                        aria-label="Aumentar cantidad"
                        className="flex size-8 items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>

                <div className="mt-auto flex items-center justify-between border-t border-black/10 pt-5">
                  <span className="text-xs font-light uppercase tracking-[0.08em]">
                    Total
                  </span>
                  <span className="text-base font-semibold">S/ 249.00 PEN</span>
                </div>
              </div>

        <DrawerFooter className="border-t border-black/10">
          <Link
            href="/pago"
            className="flex h-12 items-center justify-center bg-black text-sm font-light uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#3d3d3d]"
          >
            Ir a pagar
          </Link>
          <DrawerClose asChild>
            <button
              type="button"
              className="flex h-12 items-center justify-center border border-black/15 text-sm font-light uppercase tracking-[0.08em] text-black transition-colors hover:border-black"
            >
              Seguir comprando
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
