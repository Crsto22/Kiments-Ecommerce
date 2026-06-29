"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Basket as BasketIcon,
  List,
  MagnifyingGlass,
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
import { CartContent } from "@/components/CartContent";
import { useCart } from "@/components/CartProvider";
import { buildImageUrl, fetchProductos } from "@/lib/api";
import type { ProductoItem } from "@/types/producto";

const navItems = [
  { label: "INICIO", href: "/" },
  { label: "PRODUCTOS", href: "/productos" },
  { label: "NOSOTROS", href: "/nosotros" },
];
const SEARCH_DEBOUNCE_MS = 1500;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { count } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductoItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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

  useEffect(() => {
    const term = searchTerm.trim();
    if (!isSearchOpen || term.length < 2) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetchProductos({ q: term, size: 6, soloDisponibles: false })
        .then((response) => {
          if (!cancelled) setSearchResults(response.content);
        })
        .catch(() => {
          if (!cancelled) setSearchResults([]);
        })
        .finally(() => {
          if (!cancelled) setIsSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isSearchOpen, searchTerm]);

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    setIsSearching(false);
  };

  const goToResult = (item: ProductoItem) => {
    closeSearch();
    router.push(`/productos/${item.producto.slug}?color=${item.color.idColor}`);
  };

  const updateSearchTerm = (value: string) => {
    setSearchTerm(value);
    const canSearch = value.trim().length >= 2;
    setIsSearching(canSearch);
    if (!canSearch) setSearchResults([]);
  };

  if (pathname === "/pago" || pathname === "/carrito") {
    return null;
  }

  const isOverHero = isHome && !isScrolled;
  const navText = isOverHero
    ? "text-white/90 hover:text-white"
    : "text-black/90 hover:text-black";
  const brandText = isOverHero ? "text-white" : "text-black";
  const iconText = isOverHero
    ? "text-white hover:text-white/75"
    : "text-black hover:text-black/70";
  const headerBackground =
    isHome && !isScrolled
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
        onClick={closeSearch}
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
        <div className="mx-auto grid h-full max-w-7xl grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto] items-center gap-5 px-5 sm:px-10 lg:px-16 xl:px-20">
          <Link
            href="/"
            aria-label="KIMENTS inicio"
            className="hidden sm:flex min-w-[96px] flex-col items-center leading-none text-black"
            onClick={closeSearch}
          >
            <span className="font-[family-name:var(--font-kiments)] text-[20px] font-normal tracking-[0.14em] sm:text-[24px]">
              KIMENTS
            </span>
            <span className="mt-1 text-[6px] font-light uppercase tracking-[0.22em] sm:text-[7px]">
              Tienda de ropa
            </span>
          </Link>

          <div className="relative mx-auto w-full sm:max-w-xl">
            <form
              className="flex h-9 w-full items-center border border-black bg-white px-3 text-black"
              onSubmit={(event) => {
                event.preventDefault();
                if (searchResults[0]) goToResult(searchResults[0]);
              }}
            >
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Buscar productos"
                placeholder="Buscar Productos"
                value={searchTerm}
                onChange={(event) => updateSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    closeSearch();
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

            {searchTerm.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto border border-black/10 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.14)]">
                {isSearching ? (
                  <div className="px-4 py-4 text-sm font-light text-black/55">Buscando...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <SearchResult
                      key={`${item.producto.idProducto}-${item.color.idColor}`}
                      item={item}
                      onSelect={() => goToResult(item)}
                    />
                  ))
                ) : (
                  <div className="px-4 py-4 text-sm font-light text-black/55">Sin resultados</div>
                )}
              </div>
            )}
          </div>

          <CartDrawer count={count} triggerClassName="text-black hover:text-black/70" />
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
            className={`flex size-9 items-center justify-center rounded-sm transition-colors ${iconText}`}
          >
            <MagnifyingGlass size={24} weight="thin" />
          </button>

          <Link
            href="/carrito"
            aria-label="Carrito"
            data-cart-target
            className={`flex size-9 items-center justify-center rounded-sm transition-colors lg:hidden ${iconText}`}
          >
            <span className="relative flex items-center justify-center">
              <BasketIcon size={24} weight="thin" />
              <CartCountBadge count={count} />
            </span>
          </Link>

          <div className="hidden lg:block">
            <CartDrawer count={count} triggerClassName={iconText} />
          </div>
        </div>
      </nav>
    </header>
  );
}

function SearchResult({
  item,
  onSelect,
}: Readonly<{ item: ProductoItem; onSelect: () => void }>) {
  const imageUrl =
    item.imagenPrincipal?.origen === "COLOR"
      ? buildImageUrl(item.imagenPrincipal.url || item.imagenPrincipal.urlThumb)
      : null;
  const price =
    item.precioMinimo === item.precioMaximo
      ? `S/ ${item.precioMinimo.toFixed(2)}`
      : `S/ ${item.precioMinimo.toFixed(2)} - S/ ${item.precioMaximo.toFixed(2)}`;
  const sizes = item.variantes.map((variante) => variante.talla.nombre).join(", ");

  return (
    <button
      type="button"
      onClick={onSelect}
      className="grid w-full grid-cols-[56px_1fr_auto] items-center gap-3 border-b border-black/10 px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-black/[0.03]"
    >
      <span className="relative block size-14 overflow-hidden bg-neutral-100">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${item.producto.nombre} ${item.color.nombre}`}
            className="h-full w-full object-cover"
          />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-normal text-black">
          {item.producto.nombre}
        </span>
        <span className="mt-1 flex items-center gap-2 text-xs font-light text-black/60">
          <span
            className="size-3 shrink-0 rounded-full border border-black/15"
            style={{ backgroundColor: item.color.hex || "#fff" }}
          />
          <span className="truncate">{item.color.nombre}</span>
          {sizes ? <span className="truncate">Tallas: {sizes}</span> : null}
        </span>
      </span>
      <span className="text-right text-xs font-medium text-black">{price}</span>
    </button>
  );
}

function CartCountBadge({ count }: Readonly<{ count: number }>) {
  if (count <= 0) return null;

  return (
    <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-black px-1 text-[9px] font-medium leading-4 text-white ring-1 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function CartDrawer({
  count,
  triggerClassName,
}: Readonly<{ count: number; triggerClassName: string }>) {
  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <button
          type="button"
          aria-label="Abrir carrito"
          data-cart-target
          className={`flex size-9 items-center justify-center rounded-sm transition-colors ${triggerClassName}`}
        >
          <span className="relative flex items-center justify-center">
            <BasketIcon size={24} weight="thin" />
            <CartCountBadge count={count} />
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent className="flex flex-col">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Carrito</DrawerTitle>
          <DrawerDescription>
            Revisa los productos agregados al carrito antes de continuar al pago.
          </DrawerDescription>
        </DrawerHeader>
        <CartContent
          backHref="/productos"
          backLabel="Productos"
          footer={
            <div className="flex flex-col gap-3 pt-5">
              <Link
                href="/pago"
                className="flex h-[52px] w-full items-center justify-center bg-black text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/80"
              >
                Ir a Pagar
              </Link>
              <DrawerClose asChild>
                <button
                  type="button"
                  className="flex items-center justify-center text-[11px] font-light uppercase tracking-widest text-black/50 transition-all hover:text-black hover:underline underline-offset-4"
                >
                  Seguir comprando
                </button>
              </DrawerClose>
            </div>
          }
        />
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
