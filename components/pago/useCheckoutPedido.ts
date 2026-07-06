"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { useCart } from "@/components/CartProvider";
import {
  ApiError,
  createEcommercePedido,
  fetchEcommercePedidoActual,
  uploadEcommerceComprobante,
  validateEcommerceCart,
  type EcommercePedidoCreateRequest,
  type EcommercePedidoResponse,
} from "@/lib/api";
import type { CarritoValidarItemResponse } from "@/types/producto";

export interface StockIssueState {
  itemName: string;
  idProductoVariante: number;
  available: number;
  requested: number;
  price?: number;
  priceChanged?: boolean;
  message?: string | null;
}

interface UseCheckoutPedidoOptions {
  selectedPaymentMethod: string;
  onRecoveredPaymentMethod: (value: string) => void;
  onPedidoRecovered: () => void;
  onPedidoReserved: () => void;
  onResetTurnstile: () => void;
}

type CheckoutPhase =
  | "idle"
  | "validando_carrito"
  | "reservando"
  | "esperando_comprobante"
  | "subiendo_comprobante"
  | "expirado"
  | "error";

interface CheckoutStatusState {
  phase: CheckoutPhase;
  cartValidated: boolean;
  hasCheckedPedidoToken: boolean;
  isSuccess: boolean;
}

type CheckoutStatusAction = Partial<CheckoutStatusState>;

const initialCheckoutStatus: CheckoutStatusState = {
  phase: "idle",
  cartValidated: false,
  hasCheckedPedidoToken: true,
  isSuccess: false,
};

function checkoutStatusReducer(
  state: CheckoutStatusState,
  action: CheckoutStatusAction,
): CheckoutStatusState {
  return { ...state, ...action };
}

function secondsUntil(date: string): number {
  return Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000));
}

function getPedidoTokenFromUrl(): string {
  const url = new URL(window.location.href);
  const pathToken = url.pathname.startsWith("/pago/") ? url.pathname.split("/")[2] : "";
  return pathToken ? decodeURIComponent(pathToken) : url.searchParams.get("pedidoToken") ?? "";
}

function paymentLabel(value: string | null | undefined): string {
  const normalized = (value ?? "").toUpperCase();
  if (normalized.includes("YAPE")) return "YAPE";
  if (normalized.includes("BCP") || normalized.includes("TRANSFERENCIA")) return "BCP";
  return "";
}

function parseStockIssues(message: string): StockIssueState[] {
  const matches = message.matchAll(
    /Stock insuficiente para '(.+?)' \(variante (\d+)\)\. Disponible: (\d+), solicitado: (\d+)/gi,
  );
  return Array.from(matches, (match) => ({
    itemName: match[1],
    idProductoVariante: Number(match[2]),
    available: Number(match[3]),
    requested: Number(match[4]),
  }));
}

function toStockIssue(item: CarritoValidarItemResponse): StockIssueState {
  return {
    itemName: item.nombre,
    idProductoVariante: item.idProductoVariante,
    available: item.cantidadPermitida,
    requested: item.cantidadSolicitada,
    price: item.precioVigente,
    priceChanged: item.precioCambiado,
    message: item.mensaje,
  };
}

export function useCheckoutPedido({
  selectedPaymentMethod,
  onRecoveredPaymentMethod,
  onPedidoRecovered,
  onPedidoReserved,
  onResetTurnstile,
}: UseCheckoutPedidoOptions) {
  const router = useRouter();
  const { items: cartItems, subtotal: total, clearCart, updateItem, remove } = useCart();
  const [hasMounted, setHasMounted] = useState(false);
  const [createdPedido, setCreatedPedido] = useState<EcommercePedidoResponse | null>(null);
  const [pedidoToken, setPedidoToken] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState("");
  const [voucherConfirmed, setVoucherConfirmed] = useState(false);
  const [stockIssues, setStockIssues] = useState<StockIssueState[]>([]);
  const [cartAdjustmentNotice, setCartAdjustmentNotice] = useState<StockIssueState[]>([]);
  const [cartValidationRetryKey, setCartValidationRetryKey] = useState(0);
  const [checkoutStatus, setCheckoutStatus] = useReducer(
    checkoutStatusReducer,
    initialCheckoutStatus,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const orderSubmitLockRef = useRef(false);
  const cartValidationSignatureRef = useRef("");
  const isCreatingOrder = checkoutStatus.phase === "reservando";
  const hasCheckedPedidoToken = checkoutStatus.hasCheckedPedidoToken;
  const timerActive = checkoutStatus.phase === "esperando_comprobante";
  const timerExpired = checkoutStatus.phase === "expirado";
  const isSubmitting = checkoutStatus.phase === "subiendo_comprobante";
  const isSuccess = checkoutStatus.isSuccess;
  const isValidatingCart = checkoutStatus.phase === "validando_carrito";
  const cartValidated = checkoutStatus.cartValidated;
  const activePaymentMethod = selectedPaymentMethod || paymentLabel(createdPedido?.metodoPago);

  const syncCartWithStockIssues = useCallback((issues: StockIssueState[]) => {
    for (const issue of issues) {
      if (issue.available <= 0) {
        remove(issue.idProductoVariante);
        continue;
      }
      updateItem(issue.idProductoVariante, {
        quantity: Math.min(issue.requested, issue.available),
        stock: issue.available,
        price: issue.price,
      });
    }
  }, [remove, updateItem]);

  const recoverPedidoByToken = useCallback(async (token: string) => {
    if (!token) return;
    setPedidoToken(token);
    setCheckoutStatus({ phase: "reservando", hasCheckedPedidoToken: false });
    try {
      const pedido = await fetchEcommercePedidoActual(token);
      setCreatedPedido(pedido);
      setOrderCode(pedido.codigo);
      onRecoveredPaymentMethod(paymentLabel(pedido.metodoPago));
      const seconds = secondsUntil(pedido.reservaExpiraAt);
      setExpiresAtMs(new Date(pedido.reservaExpiraAt).getTime());
      setTimeLeft(seconds);
      setCheckoutStatus({
        phase: pedido.estado === "CANCELADO_POR_TIEMPO" || seconds <= 0
          ? "expirado"
          : pedido.estado === "ESPERANDO_COMPROBANTE"
            ? "esperando_comprobante"
            : "idle",
        isSuccess: pedido.estado === "PAGO_EN_REVISION",
      });
      onPedidoRecovered();
    } catch (error) {
      setOrderError(error instanceof ApiError ? error.message : "No se pudo recuperar el pedido");
      setCheckoutStatus({ phase: "error" });
    } finally {
      setCheckoutStatus({ hasCheckedPedidoToken: true });
    }
  }, [onPedidoRecovered, onRecoveredPaymentMethod]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const token = getPedidoTokenFromUrl();
      if (token) void recoverPedidoByToken(token);
      setHasMounted(true);
    });

    return () => {
      cancelled = true;
    };
  }, [recoverPedidoByToken]);

  useEffect(() => {
    if (!timerActive || !expiresAtMs) return;
    const syncTimer = () => {
      const nextSeconds = Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000));
      setTimeLeft(nextSeconds);
      if (nextSeconds <= 0) {
        setCheckoutStatus({ phase: "expirado" });
      }
    };
    syncTimer();
    const interval = setInterval(syncTimer, 1000);
    return () => clearInterval(interval);
  }, [timerActive, expiresAtMs]);

  useEffect(() => {
    if (timerExpired) clearCart();
  }, [timerExpired, clearCart]);

  useEffect(() => {
    if (!hasMounted || pedidoToken || createdPedido || cartItems.length === 0) return;
    const signature = cartItems
      .map((item) => `${item.idProductoVariante}:${item.quantity}:${item.price}`)
      .sort()
      .join("|");
    if (cartValidationSignatureRef.current === signature) return;
    cartValidationSignatureRef.current = signature;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setCheckoutStatus({ phase: "validando_carrito", cartValidated: false });
      validateEcommerceCart({
        items: cartItems.map((item) => ({
          idProductoVariante: item.idProductoVariante,
          cantidad: item.quantity,
          precio: item.price,
        })),
      })
        .then((response) => {
          if (cancelled) return;
          const issues = response.items
            .filter((item) => !item.disponible || !item.cantidadValida || item.precioCambiado)
            .map(toStockIssue);
          if (issues.length > 0) {
            syncCartWithStockIssues(issues);
            setCartAdjustmentNotice(issues);
            setStockIssues([]);
            setCheckoutStatus({ phase: "idle", cartValidated: false });
            return;
          }
          setStockIssues([]);
          setCheckoutStatus({ phase: "idle", cartValidated: response.valido });
        })
        .catch((error) => {
          if (!cancelled) {
            setOrderError(error instanceof ApiError ? error.message : "No se pudo validar el carrito");
            setCheckoutStatus({ phase: "error" });
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [hasMounted, pedidoToken, createdPedido, cartItems, cartValidationRetryKey, syncCartWithStockIssues]);

  const reservePedido = useCallback(async (payload: EcommercePedidoCreateRequest) => {
    if (orderSubmitLockRef.current || isCreatingOrder) return false;
    orderSubmitLockRef.current = true;
    try {
      if (isValidatingCart || !cartValidated || stockIssues.length > 0) return false;
      setOrderError("");
      setCheckoutStatus({ phase: "reservando" });
      try {
        const pedido = await createEcommercePedido(payload);
        setCreatedPedido(pedido);
        if (pedido.comprobanteToken) {
          setPedidoToken(pedido.comprobanteToken);
          router.replace(`/pago/${encodeURIComponent(pedido.comprobanteToken)}`);
        }
        setOrderCode(pedido.codigo);
        setExpiresAtMs(new Date(pedido.reservaExpiraAt).getTime());
        setTimeLeft(secondsUntil(pedido.reservaExpiraAt));
        setCheckoutStatus({ phase: "esperando_comprobante", isSuccess: false });
        clearCart();
        onPedidoReserved();
        return true;
      } catch (error) {
        const message = error instanceof ApiError ? error.message : "No se pudo crear el pedido";
        const parsedStockIssues = parseStockIssues(message);
        if (parsedStockIssues.length > 0) {
          syncCartWithStockIssues(parsedStockIssues);
          setCartAdjustmentNotice(parsedStockIssues);
          setStockIssues([]);
          setOrderError("");
          setCheckoutStatus({ phase: "idle", cartValidated: false });
        } else {
          setOrderError(message);
          setCheckoutStatus({ phase: "error" });
        }
        onResetTurnstile();
        return false;
      }
    } finally {
      orderSubmitLockRef.current = false;
    }
  }, [
    cartValidated,
    clearCart,
    isCreatingOrder,
    isValidatingCart,
    onPedidoReserved,
    onResetTurnstile,
    router,
    stockIssues.length,
    syncCartWithStockIssues,
  ]);

  const retryCartValidation = useCallback(() => {
    cartValidationSignatureRef.current = "";
    setOrderError("");
    setCheckoutStatus({ phase: "idle", cartValidated: false });
    setCartValidationRetryKey((value) => value + 1);
  }, []);

  const dismissCartAdjustmentNotice = useCallback(() => {
    setCartAdjustmentNotice([]);
  }, []);

  const stopTimer = useCallback(() => {
    setCheckoutStatus({ phase: "idle" });
  }, []);

  const removeVoucherFile = useCallback(() => {
    setVoucherFile(null);
    setVoucherPreview("");
    setVoucherConfirmed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      removeVoucherFile();
      setOrderError("Solo se permiten imágenes PNG, JPG o WEBP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      removeVoucherFile();
      setOrderError("El archivo supera el límite de 5MB, por favor sube una imagen más liviana.");
      return;
    }
    setOrderError("");
    setVoucherFile(file);
    setVoucherConfirmed(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVoucherPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [removeVoucherFile]);

  const submitPayment = useCallback(async () => {
    if (!voucherFile || !createdPedido || !pedidoToken) return;
    setCheckoutStatus({ phase: "subiendo_comprobante" });
    setOrderError("");
    try {
      const pedido = await uploadEcommerceComprobante(pedidoToken, voucherFile);
      setCreatedPedido(pedido);
      setOrderCode(pedido.codigo);
      if (pedido.estado === "CANCELADO_POR_TIEMPO") {
        setCheckoutStatus({ phase: "expirado" });
        setOrderError("La reserva venció. Genera un nuevo pedido.");
        return;
      }
      setCheckoutStatus({ phase: "idle", isSuccess: true });
    } catch (error) {
      setOrderError(error instanceof ApiError ? error.message : "No se pudo subir el comprobante");
      setCheckoutStatus({ phase: "error" });
    }
  }, [createdPedido, pedidoToken, voucherFile]);

  return {
    cartItems,
    total,
    hasMounted,
    checkoutPhase: checkoutStatus.phase,
    createdPedido,
    pedidoToken,
    hasCheckedPedidoToken,
    orderError,
    setOrderError,
    orderCode,
    timeLeft,
    timerActive,
    timerExpired,
    voucherFile,
    voucherPreview,
    voucherConfirmed,
    setVoucherConfirmed,
    isCreatingOrder,
    isSubmitting,
    isSuccess,
    stockIssues,
    cartAdjustmentNotice,
    isValidatingCart,
    cartValidated,
    activePaymentMethod,
    fileInputRef,
    reservePedido,
    recoverPedidoByToken,
    retryCartValidation,
    dismissCartAdjustmentNotice,
    stopTimer,
    handleFileChange,
    removeVoucherFile,
    submitPayment,
  };
}
