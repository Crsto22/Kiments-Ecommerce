"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  List,
  MagnifyingGlass,
  ShoppingCartSimple,
  X,
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
  { label: "NOSOTROS", href: "/nosotros" },
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

      <nav className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-5 sm:px-10 lg:px-16 xl:px-20">
        <div className="flex h-full items-center">
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
          <MobileMenuDrawer
            navItems={navItems}
            triggerClassName={`flex items-center justify-center sm:hidden rounded-sm transition-colors ${iconText}`}
          />
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

              <div className="flex flex-1 flex-col px-6 py-6 sm:px-8">
                <div className="flex-1 overflow-y-auto">
                  <article className="grid grid-cols-[90px_1fr] gap-5 border-b border-black/5 pb-6">
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-50 border border-black/5">
                      <Image
                        src="/img/productos/Producto02.jpg"
                        alt="Modelo Anguie"
                        fill
                        sizes="90px"
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-[13px] font-medium uppercase tracking-wide text-black">
                            Modelo Anguie
                          </h3>
                          <p className="mt-1.5 text-[11px] font-light uppercase tracking-wider text-black/50">
                            Color: Ivory
                          </p>
                          <p className="mt-0.5 text-[11px] font-light uppercase tracking-wider text-black/50">
                            Talla: 10
                          </p>
                        </div>
                        <p className="shrink-0 text-[13px] font-medium">S/ 249.00</p>
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="inline-flex h-8 items-center rounded border border-gray-200 bg-white text-xs font-light shadow-sm">
                          <button
                            type="button"
                            aria-label="Disminuir cantidad"
                            className="flex size-8 items-center justify-center transition-colors hover:bg-gray-50 hover:text-black/70"
                          >
                            -
                          </button>
                          <span className="flex w-8 items-center justify-center font-medium">1</span>
                          <button
                            type="button"
                            aria-label="Aumentar cantidad"
                            className="flex size-8 items-center justify-center transition-colors hover:bg-gray-50 hover:text-black/70"
                          >
                            +
                          </button>
                        </div>
                        <button type="button" className="text-[10px] uppercase tracking-widest text-black/40 hover:text-black underline-offset-4 hover:underline transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                </div>

                <div className="mt-auto pt-6">
                  <div className="flex items-center justify-between text-black">
                    <span className="text-[13px] font-medium uppercase tracking-widest">
                      Total
                    </span>
                    <div className="flex items-end gap-2">
                      <span className="mb-0.5 text-[10px] text-black/50">PEN</span>
                      <span className="text-xl font-semibold">S/ 249.00</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] font-light text-black/50">
                    Los impuestos y gastos de envío se calculan en la pantalla de pago.
                  </p>
                </div>
              </div>

        <DrawerFooter className="border-t border-black/10 bg-white p-6 sm:p-8 flex flex-col gap-4">
          <Link
            href="/pago"
            className="flex h-[52px] w-full items-center justify-center bg-black text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/80"
          >
            Ir a Pagar
          </Link>
          <DrawerClose asChild>
            <button
              type="button"
              className="mt-1 flex items-center justify-center text-[11px] font-light uppercase tracking-widest text-black/50 transition-all hover:text-black hover:underline underline-offset-4"
            >
              Seguir comprando
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function MobileMenuDrawer({
  navItems,
  triggerClassName,
}: Readonly<{
  navItems: { label: string; href: string }[];
  triggerClassName: string;
}>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer direction="left" open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Abrir menú"
          className={triggerClassName}
        >
          <List size={24} weight="thin" />
        </button>
      </DrawerTrigger>
      <DrawerContent className="border-r-0 sm:max-w-none !w-[100vw] sm:!w-[420px] bg-white">
        <DrawerHeader className="shrink-0 flex items-center justify-between px-8 py-6 text-left border-b border-black/10">
          <DrawerTitle className="sr-only">Menú de Navegación</DrawerTitle>
          <DrawerDescription className="sr-only">
            Navega por las secciones de la tienda
          </DrawerDescription>

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex flex-col items-start leading-none text-black"
          >
            <span className="font-[family-name:var(--font-kiments)] text-[22px] font-normal tracking-[0.14em]">
              KIMENTS
            </span>
          </Link>

          <DrawerClose asChild>
            <button
              type="button"
              aria-label="Cerrar menú"
              className="rounded-sm text-black transition-colors hover:text-black/70"
            >
              <X size={26} weight="thin" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-6 px-8 py-10 sm:px-12">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group w-fit py-2 text-[22px] font-light uppercase tracking-[0.15em] text-black transition-colors sm:text-2xl"
              >
                <span className="relative">
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        <DrawerFooter className="shrink-0 border-t border-black/10 px-8 py-8 sm:px-12">
          <div className="flex flex-col gap-4 text-[11px] font-light uppercase tracking-widest text-black/60">
            <Link
              href="/terminos-y-condiciones"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-black"
            >
              Términos y Condiciones
            </Link>
            <Link
              href="/preguntas-frecuentes"
              onClick={() => setIsOpen(false)}
              className="transition-colors hover:text-black"
            >
              Preguntas Frecuentes
            </Link>
            <a
              href="mailto:contacto@kiments.com"
              className="transition-colors hover:text-black"
            >
              contacto@kiments.com
            </a>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
