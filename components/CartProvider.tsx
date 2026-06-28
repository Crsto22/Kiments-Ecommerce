"use client";

import {
  createContext,
  useCallback,
  useContext,
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

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (item: CartItem) => AddCartResult;
  setQuantity: (idProductoVariante: number, quantity: number, stock?: number) => void;
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

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { items, count, subtotal, addItem, setQuantity, increase, decrease, remove, clearCart };
  }, [addItem, clearCart, decrease, increase, items, remove, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
}
