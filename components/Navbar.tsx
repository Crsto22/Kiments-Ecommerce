"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MagnifyingGlass, ShoppingCartSimple } from "@phosphor-icons/react/dist/ssr";
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
    <header className={`fixed top-0 z-50 h-12 w-full transition-colors duration-300 sm:h-14 xl:h-16 ${headerBackground}`}>
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

        <div className="flex items-center gap-7 xl:gap-9">
          <Link
            href="/buscar"
            aria-label="Buscar"
            className={`rounded-sm transition-colors ${iconText}`}
          >
            <MagnifyingGlass size={23} weight="thin" />
          </Link>
          <Drawer direction="right">
            <DrawerTrigger asChild>
              <button
                type="button"
                aria-label="Abrir carrito"
                className={`rounded-sm transition-colors ${iconText}`}
              >
                <ShoppingCartSimple size={24} weight="thin" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="border-b border-black/10">
                <DrawerTitle>Carrito</DrawerTitle>
                <DrawerDescription>
                  Revisa tus productos antes de finalizar tu compra.
                </DrawerDescription>
              </DrawerHeader>

              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div>
                  <ShoppingCartSimple
                    className="mx-auto text-black/35"
                    size={44}
                    weight="thin"
                  />
                  <p className="mt-5 text-sm font-light uppercase tracking-[0.08em]">
                    Tu carrito esta vacio
                  </p>
                  <p className="mt-3 max-w-64 text-sm font-light leading-6 text-black/55">
                    Agrega tus prendas favoritas y vuelve aqui para continuar.
                  </p>
                </div>
              </div>

              <DrawerFooter className="border-t border-black/10">
                <Link
                  href="/categorias"
                  className="flex h-12 items-center justify-center bg-black text-sm font-light uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#3d3d3d]"
                >
                  Ver productos
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
        </div>
      </nav>
    </header>
  );
}
