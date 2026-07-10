"use client";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "kiments_cart_v1";
export const MAX_CART_QUANTITY_PER_VARIANT = 5;

export interface CartItem {
  idProducto: number;
  slug: string;
  idProductoVariante: number;
  name: string;
  colorName: string;
  colorHex: string;
  sizeName: string;
  price: number;
  quantity: number;
  stock: number;
  image: string | null;
}

export type AddCartResult = "added" | "max" | "invalid";

export interface CartComboResumen {
  idPromocionCombo: number;
  nombre: string;
  regla: string;
  precioNormal: number;
  precioCombo: number;
  descuento: number;
}

export interface CartComboPendiente {
  idPromocionCombo: number;
  nombre: string;
  regla: string;
  precioCombo?: number;
  mensaje?: string | null;
  faltantes?: Array<{ idProducto: number; nombreProducto: string; cantidadFaltante: number }>;
}

export interface CartResumen {
  subtotal: number;
  descuentoPromocion: number;
  total: number;
  combosAplicados: CartComboResumen[];
  combosPendientes: CartComboPendiente[];
}

export function cartPromotionIds(resumen: CartResumen | null | undefined): number[] {
  if (!resumen) return [];
  return Array.from(new Set([
    ...resumen.combosAplicados.map((combo) => combo.idPromocionCombo),
    ...resumen.combosPendientes.map((combo) => combo.idPromocionCombo),
  ].filter((id): id is number => Number.isFinite(id))));
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  total: number;
  descuentoPromocion: number;
  comboResumen: CartResumen | null;
  comboResumenLoading: boolean;
  syncComboResumen: (resumen: CartResumen | null) => void;
  addItem: (item: CartItem) => AddCartResult;
  setQuantity: (idProductoVariante: number, quantity: number, stock?: number) => void;
  updateItem: (idProductoVariante: number, changes: Partial<Pick<CartItem, "quantity" | "stock" | "price">>) => void;
  increase: (idProductoVariante: number) => void;
  decrease: (idProductoVariante: number) => void;
  remove: (idProductoVariante: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && Number(value) > 0;
}

function isValidText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function sanitizeCartImage(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  return value.toLowerCase().includes("/global/") ? null : value;
}

function sanitizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<CartItem>;
  const image = sanitizeCartImage(item.image);

  if (
    !isPositiveInteger(item.idProducto) ||
    !isPositiveInteger(item.idProductoVariante) ||
    !isPositiveInteger(item.quantity) ||
    !isPositiveInteger(item.stock) ||
    typeof item.price !== "number" ||
    item.price <= 0 ||
    !isValidText(item.slug) ||
    !isValidText(item.name) ||
    !isValidText(item.colorName) ||
    !isValidText(item.colorHex) ||
    !isValidText(item.sizeName)
  ) {
    return null;
  }

  return {
    idProducto: item.idProducto,
    slug: item.slug,
    idProductoVariante: item.idProductoVariante,
    name: item.name,
    colorName: item.colorName,
    colorHex: item.colorHex,
    sizeName: item.sizeName,
    price: item.price,
    quantity: Math.min(item.quantity, item.stock, MAX_CART_QUANTITY_PER_VARIANT),
    stock: item.stock,
    image,
  };
}

function loadStoredCart(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(sanitizeCartItem).filter((item): item is CartItem => item !== null);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [comboResumen, setComboResumen] = useState<CartResumen | null>(null);
  const [comboResumenLoading, setComboResumenLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setItems(loadStoredCart());
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  useEffect(() => {
    let cancelled = false;
    if (!hydrated || items.length === 0) {
      queueMicrotask(() => {
        if (cancelled) return;
        setComboResumen(null);
        setComboResumenLoading(false);
      });
      return () => {
        cancelled = true;
      };
    }

    const controller = new AbortController();
    queueMicrotask(() => {
      if (cancelled) return;
      setComboResumenLoading(true);
      fetch("/api/public/ecommerce/pedidos/resumen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            idProductoVariante: item.idProductoVariante,
            cantidad: item.quantity,
          })),
        }),
        signal: controller.signal,
      })
        .then(async (response) => {
          const data = await response.json().catch(() => null);
          if (!response.ok) throw new Error(data?.message ?? "No se pudo calcular promociones");
          if (!cancelled) setComboResumen(data as CartResumen);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          if (!cancelled) setComboResumen(null);
        })
        .finally(() => {
          if (!cancelled) setComboResumenLoading(false);
        });
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [hydrated, items]);

  const addItem = useCallback((item: CartItem): AddCartResult => {
    const safeItem = sanitizeCartItem(item);
    if (!safeItem) return "invalid";

    const existing = items.find(
      (cartItem) => cartItem.idProductoVariante === safeItem.idProductoVariante,
    );
    if (existing && existing.quantity >= Math.min(safeItem.stock, MAX_CART_QUANTITY_PER_VARIANT)) return "max";

    setItems((current) => {
      const currentItem = current.find(
        (cartItem) => cartItem.idProductoVariante === safeItem.idProductoVariante,
      );
      if (!currentItem) {
        return [
          ...current,
          {
            ...safeItem,
            quantity: Math.min(safeItem.quantity, safeItem.stock, MAX_CART_QUANTITY_PER_VARIANT),
          },
        ];
      }

      return current.map((cartItem) =>
        cartItem.idProductoVariante === safeItem.idProductoVariante
          ? {
              ...cartItem,
              ...safeItem,
              quantity: Math.min(
                cartItem.quantity + safeItem.quantity,
                safeItem.stock,
                MAX_CART_QUANTITY_PER_VARIANT,
              ),
            }
          : cartItem,
      );
    });

    return "added";
  }, [items]);

  const increase = useCallback((idProductoVariante: number) => {
    setItems((current) =>
        current.map((item) =>
        item.idProductoVariante === idProductoVariante
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock, MAX_CART_QUANTITY_PER_VARIANT) }
          : item,
      ),
    );
  }, []);

  const setQuantity = useCallback(
    (idProductoVariante: number, quantity: number, stock?: number) => {
      setItems((current) =>
        current.flatMap((item) => {
          if (item.idProductoVariante !== idProductoVariante) return [item];
          const nextStock = isPositiveInteger(stock) ? stock : item.stock;
          const nextQuantity = Math.max(0, Math.min(quantity, nextStock, MAX_CART_QUANTITY_PER_VARIANT));
          if (nextQuantity <= 0) return [];
          return [{ ...item, stock: nextStock, quantity: nextQuantity }];
        }),
      );
    },
    [],
  );

  const updateItem = useCallback(
    (idProductoVariante: number, changes: Partial<Pick<CartItem, "quantity" | "stock" | "price">>) => {
      setItems((current) =>
        current.flatMap((item) => {
          if (item.idProductoVariante !== idProductoVariante) return [item];
          const nextStock = isPositiveInteger(changes.stock) ? changes.stock : item.stock;
          const requestedQuantity = isPositiveInteger(changes.quantity) ? changes.quantity : item.quantity;
          const nextQuantity = Math.max(0, Math.min(requestedQuantity, nextStock, MAX_CART_QUANTITY_PER_VARIANT));
          if (nextQuantity <= 0) return [];
          const nextPrice = typeof changes.price === "number" && changes.price > 0 ? changes.price : item.price;
          return [{ ...item, stock: nextStock, quantity: nextQuantity, price: nextPrice }];
        }),
      );
    },
    [],
  );

  const decrease = useCallback((idProductoVariante: number) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.idProductoVariante !== idProductoVariante) return [item];
        const quantity = item.quantity - 1;
        return quantity > 0 ? [{ ...item, quantity }] : [];
      }),
    );
  }, []);

  const remove = useCallback((idProductoVariante: number) => {
    setItems((current) =>
      current.filter((item) => item.idProductoVariante !== idProductoVariante),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const syncComboResumen = useCallback((resumen: CartResumen | null) => setComboResumen(resumen), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const descuentoPromocion = comboResumen?.descuentoPromocion ?? 0;
    const total = comboResumen?.total ?? subtotal;

    return {
      items,
      count,
      subtotal,
      total,
      descuentoPromocion,
      comboResumen,
      comboResumenLoading,
      syncComboResumen,
      addItem,
      setQuantity,
      updateItem,
      increase,
      decrease,
      remove,
      clearCart,
    };
  }, [addItem, clearCart, comboResumen, comboResumenLoading, decrease, increase, items, remove, setQuantity, syncComboResumen, updateItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = use(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
