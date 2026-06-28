"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  ShoppingCartSimple,
  CaretDown,
  CaretUp,
  CaretRight,
  CheckCircle,
  Clock,
  UploadSimple,
  EnvelopeSimple,
  Phone,
  WarningCircle,

  XCircle,
  Spinner,
  Storefront,
  Truck,
  MapPin,
  FlagBanner,
} from "@phosphor-icons/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCart } from "@/components/CartProvider";
import { ApiError, buildImageUrl, createEcommercePedido, fetchEcommercePedidoActual, uploadEcommerceComprobante, type EcommercePedidoResponse } from "@/lib/api";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string | undefined;
      reset: (widgetId?: string) => void;
      remove?: (widgetId: string) => void;
    };
  }
}

const paymentMethods = [
  {
    label: "YAPE",
    image: "/img/metodo-pago/yape1.png",
    imageAlt: "Yape",
    imageClassName: "size-12 rounded-md object-contain",
    type: "yape" as const,
    detailNumber: "987 654 321",
    detailName: "KIMENTS",
    detailDni: "12345678",
  },
  {
    label: "BCP",
    image: "/img/metodo-pago/bcp.svg",
    imageAlt: "BCP",
    imageClassName: "h-9 w-24 object-contain",
    type: "bcp" as const,
    detailNumber: "002-194-001234567890-51",
    detailName: "KIMENTS S.A.C.",
  },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function secondsUntil(date: string): number {
  return Math.max(0, Math.floor((new Date(date).getTime() - Date.now()) / 1000));
}

function paymentLabel(value: string | null | undefined): string {
  const normalized = (value ?? "").toUpperCase();
  if (normalized.includes("YAPE")) return "YAPE";
  if (normalized.includes("BCP") || normalized.includes("TRANSFERENCIA")) return "BCP";
  return "";
}

function getInitialPedidoToken(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("pedidoToken") ?? "";
}

interface StockIssueState {
  itemName: string;
  idProductoVariante: number;
  available: number;
  requested: number;
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

export default function PagoPage() {
  const { items: cartItems, subtotal: total, clearCart, setQuantity } = useCart();
  const initialPedidoToken = getInitialPedidoToken();
  const [step, setStep] = useState(1);
  const [stepKey, setStepKey] = useState(0);

  // Paso 1 — contacto
  const [docNumber, setDocNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [wantsInvoice, setWantsInvoice] = useState(false);
  const [rucNumber, setRucNumber] = useState("");

  // Paso 1 — metodo de envio
  const [shippingType, setShippingType] = useState<"delivery" | "pickup" | "">("");
  const [address, setAddress] = useState("");
  const [referencia, setReferencia] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [provincia, setProvincia] = useState("");
  const [distrito, setDistrito] = useState("");
  const [shippingRate, setShippingRate] = useState<"shalom" | "olva" | "motorizado" | "">("");

  // Paso 2 — metodo de pago
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [createdPedido, setCreatedPedido] = useState<EcommercePedidoResponse | null>(null);
  const [pedidoToken, setPedidoToken] = useState(initialPedidoToken);
  const [isCreatingOrder, setIsCreatingOrder] = useState(Boolean(initialPedidoToken));
  const [hasCheckedPedidoToken, setHasCheckedPedidoToken] = useState(
    () => !initialPedidoToken,
  );
  const [orderError, setOrderError] = useState("");
  const [turnstileLoaded, setTurnstileLoaded] = useState(
    () => typeof window !== "undefined" && Boolean(window.turnstile),
  );
  const [turnstileToken, setTurnstileToken] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mobile summary
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Paso 3 — payment
  const [orderCode, setOrderCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState("");
  const [voucherConfirmed, setVoucherConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [stockIssues, setStockIssues] = useState<StockIssueState[]>([]);
  const [isResolvingStockIssue, setIsResolvingStockIssue] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const shouldRecoverPedidoRef = useRef(Boolean(initialPedidoToken));
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetRef = useRef<string | null>(null);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken("");
    if (turnstileWidgetRef.current) {
      window.turnstile?.reset(turnstileWidgetRef.current);
    }
  }, []);

  const removeTurnstile = useCallback(() => {
    if (turnstileWidgetRef.current) {
      window.turnstile?.remove?.(turnstileWidgetRef.current);
      turnstileWidgetRef.current = null;
    }
    if (turnstileRef.current) {
      turnstileRef.current.innerHTML = "";
    }
    setTurnstileToken("");
  }, []);

  useEffect(() => {
    if (!shouldRecoverPedidoRef.current || !pedidoToken) {
      return;
    }
    shouldRecoverPedidoRef.current = false;
    fetchEcommercePedidoActual(pedidoToken)
      .then((pedido) => {
        setCreatedPedido(pedido);
        setOrderCode(pedido.codigo);
        setSelectedPaymentMethod(paymentLabel(pedido.metodoPago));
        setTimeLeft(secondsUntil(pedido.reservaExpiraAt));
        setTimerExpired(pedido.estado === "CANCELADO_POR_TIEMPO" || secondsUntil(pedido.reservaExpiraAt) <= 0);
        setTimerActive(pedido.estado === "ESPERANDO_COMPROBANTE" && secondsUntil(pedido.reservaExpiraAt) > 0);
        setIsSuccess(pedido.estado === "PAGO_EN_REVISION");
        setStep(3);
      })
      .catch((error) => {
        setOrderError(error instanceof ApiError ? error.message : "No se pudo recuperar el pedido");
      })
      .finally(() => {
        setIsCreatingOrder(false);
        setHasCheckedPedidoToken(true);
      });
  }, [pedidoToken]);

  useEffect(() => {
    if (showMobileSummary) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showMobileSummary]);

  useEffect(() => {
    if (
      !TURNSTILE_SITE_KEY ||
      step !== 2 ||
      !turnstileLoaded ||
      !window.turnstile ||
      !turnstileRef.current
    ) {
      return;
    }
    removeTurnstile();
    turnstileWidgetRef.current = window.turnstile?.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "light",
      callback: (token: string) => {
        setTurnstileToken(token);
        setErrors((prev) => ({ ...prev, turnstile: "" }));
      },
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
    }) ?? null;
  }, [step, stepKey, turnstileLoaded, removeTurnstile]);

  useEffect(() => {
    if (step === 2 || !turnstileWidgetRef.current) {
      return;
    }
    removeTurnstile();
  }, [step, removeTurnstile]);

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerExpired(true);
          setTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const validateStep1 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!/^\d{8}$/.test(docNumber.trim())) {
      newErrors.docNumber = "El DNI debe tener 8 dígitos";
    }
    if (!firstName.trim()) {
      newErrors.firstName = "Ingresa tus nombres";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Ingresa tus apellidos";
    }
    if (!/^\d{9}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "El teléfono debe tener 9 dígitos";
    }
    if (!email.trim()) {
      newErrors.email = "Ingresa tu correo electrónico";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ingresa un correo válido";
    }
    if (wantsInvoice && !/^\d{11}$/.test(rucNumber.trim())) {
      newErrors.rucNumber = "Ingresa un RUC válido de 11 dígitos";
    }
    if (!shippingType) {
      newErrors.shippingType = "Selecciona un método de envío";
    }
    if (shippingType === "delivery") {
      if (!address.trim()) newErrors.address = "Ingresa tu dirección";
      if (!departamento.trim()) newErrors.departamento = "Ingresa el departamento";
      if (!provincia.trim()) newErrors.provincia = "Ingresa la provincia";
      if (!distrito.trim()) newErrors.distrito = "Ingresa el distrito";
      if (!shippingRate) newErrors.shippingRate = "Selecciona una tarifa de envío";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowWarningModal(true);
      return false;
    }
    setErrors({});
    return true;
  }, [docNumber, firstName, lastName, phone, email, wantsInvoice, rucNumber, shippingType, address, departamento, provincia, distrito, shippingRate]);

  const validateStep2 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedPaymentMethod) {
      newErrors.payment = "Selecciona un método de pago";
    }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      newErrors.turnstile = "Completa la verificaciÃ³n de seguridad";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedPaymentMethod, turnstileToken]);

  const handleGoToStep2 = () => {
    if (!validateStep1()) return;
    setStep(2);
    setStepKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const createPedidoFromItems = async (
    itemsToCreate: typeof cartItems,
  ) => {
    setOrderError("");
    setIsCreatingOrder(true);
    try {
      const pedido = await createEcommercePedido({
        cliente: {
          dni: docNumber,
          nombres: firstName,
          apellidos: lastName,
          correo: email,
          telefono: phone,
          deseaFactura: wantsInvoice,
          ruc: wantsInvoice ? rucNumber : undefined,
        },
        envio: {
          tipo: shippingType === "delivery" ? "DELIVERY" : "PICKUP",
          direccion: address,
          referencia,
          departamento,
          provincia,
          distrito,
          tarifa: shippingRate.toUpperCase(),
        },
        metodoPago: selectedPaymentMethod as "YAPE" | "BCP",
        items: itemsToCreate.map((item) => ({
          idProductoVariante: item.idProductoVariante,
          cantidad: item.quantity,
        })),
        turnstileToken: turnstileToken || undefined,
      });
      setCreatedPedido(pedido);
      if (pedido.comprobanteToken) {
        setPedidoToken(pedido.comprobanteToken);
        window.history.replaceState(null, "", `/pago?pedidoToken=${encodeURIComponent(pedido.comprobanteToken)}`);
      }
      setOrderCode(pedido.codigo);
      setTimeLeft(secondsUntil(pedido.reservaExpiraAt));
      setTimerActive(true);
      setTimerExpired(false);
      setStep(3);
      setStepKey((prev) => prev + 1);
      clearCart();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "No se pudo crear el pedido";
      const parsedStockIssues = parseStockIssues(message);
      if (parsedStockIssues.length > 0) {
        setStockIssues(parsedStockIssues);
      } else {
        setOrderError(message);
      }
      resetTurnstile();
      return false;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleGoToStep3 = async () => {
    if (!validateStep2()) return;
    await createPedidoFromItems(cartItems);
  };

  const hasCartItemsAvailableAfterAdjustment = cartItems.some((item) => {
    const issue = stockIssues.find(
      (stockIssue) => stockIssue.idProductoVariante === item.idProductoVariante,
    );
    return (issue ? issue.available : item.quantity) > 0;
  });

  const handleAcceptAvailableStock = () => {
    if (stockIssues.length === 0) return;
    setIsResolvingStockIssue(true);
    for (const issue of stockIssues) {
      setQuantity(issue.idProductoVariante, issue.available, issue.available);
    }
    setOrderError("");
    setStockIssues([]);
    setIsResolvingStockIssue(false);
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setStepKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToStep2 = () => {
    setStep(2);
    setStepKey((prev) => prev + 1);
    setTimerActive(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVoucherFile(file);
    setVoucherConfirmed(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVoucherPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setVoucherFile(null);
    setVoucherPreview("");
    setVoucherConfirmed(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitPayment = async () => {
    if (!voucherFile || !createdPedido || !pedidoToken) return;
    setIsSubmitting(true);
    setOrderError("");
    try {
      const pedido = await uploadEcommerceComprobante(pedidoToken, voucherFile);
      setCreatedPedido(pedido);
      setOrderCode(pedido.codigo);
      setTimerActive(false);
      if (pedido.estado === "CANCELADO_POR_TIEMPO") {
        setTimerExpired(true);
        setOrderError("La reserva venció. Genera un nuevo pedido.");
        return;
      }
      setIsSuccess(true);
    } catch (error) {
      setOrderError(error instanceof ApiError ? error.message : "No se pudo subir el comprobante");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPayment = paymentMethods.find((m) => m.label === selectedPaymentMethod);
  const payableTotal = createdPedido?.total ?? total;
  const summaryTotal = payableTotal;
  const summaryItems = createdPedido?.detalles?.length
    ? createdPedido.detalles.map((item, index) => ({
        key: `${item.idProductoVariante ?? "pedido"}-${index}`,
        name: item.nombreProducto,
        colorName: item.colorNombre,
        sizeName: item.tallaNombre,
        quantity: item.cantidad,
        price: item.precioUnitario,
        subtotal: item.subtotal,
        image: buildImageUrl(item.imagenUrl),
      }))
    : cartItems.map((item) => ({
        key: String(item.idProductoVariante),
        name: item.name,
        colorName: item.colorName,
        sizeName: item.sizeName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        image: item.image,
      }));

  const shippingLabel =
    shippingType === "delivery"
      ? "Delivery"
      : shippingType === "pickup"
        ? "Recojo en tienda"
        : "";

  if (!hasCheckedPedidoToken || (pedidoToken && !createdPedido && isCreatingOrder)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-[#222]">
        <Spinner size={28} className="animate-spin text-black/40" />
        <p className="mt-4 text-sm font-light text-black/50">Recuperando pedido...</p>
      </main>
    );
  }

  if (pedidoToken && !createdPedido && orderError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-[#222]">
        <XCircle size={34} className="text-red-500" />
        <h1 className="mt-4 text-xl font-light">No se pudo recuperar el pedido</h1>
        <p className="mt-2 max-w-sm text-[13px] font-light text-black/50">{orderError}</p>
        <Link
          href="/carrito"
          className="mt-7 flex h-12 items-center justify-center bg-black px-8 text-[12px] font-light uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/80"
        >
          Volver al carrito
        </Link>
      </main>
    );
  }

  if (cartItems.length === 0 && !createdPedido) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-[#222]">
        <ShoppingCartSimple size={34} weight="light" className="text-black/25" />
        <h1 className="mt-4 text-xl font-light">Tu carrito está vacío</h1>
        <p className="mt-2 max-w-sm text-[13px] font-light text-black/50">
          Agrega productos antes de continuar al pago.
        </p>
        <Link
          href="/productos"
          className="mt-7 flex h-12 items-center justify-center bg-black px-8 text-[12px] font-light uppercase tracking-[0.12em] text-white transition-colors hover:bg-black/80"
        >
          Ver productos
        </Link>
      </main>
    );
  }

  if (timerExpired && createdPedido) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-[#222]">
        <div className="flex flex-col items-center animate-[checkout-success-pop_500ms_ease-out]">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-red-50">
            <Clock size={48} weight="fill" className="text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-medium">Tiempo agotado</h2>
          <p className="mb-4 max-w-sm text-[14px] text-black/60">
            El tiempo para completar el pago ha expirado. Genera un nuevo pedido para continuar.
          </p>

          <div className="mt-4 w-full max-w-xs rounded-lg border border-black/10 bg-[#fafafa] p-4 text-left">
            <p className="mb-1 text-[11px] uppercase tracking-wider text-black/50">Código de pedido</p>
            <p className="text-base font-medium tracking-widest">{orderCode}</p>
            <p className="mb-1 mt-3 text-[11px] uppercase tracking-wider text-black/50">Total</p>
            <p className="text-base font-medium">S/ {payableTotal.toFixed(2)}</p>
            <p className="mb-1 mt-3 text-[11px] uppercase tracking-wider text-black/50">Método</p>
            <p className="text-base font-medium">{selectedPaymentMethod}</p>
          </div>

          <Link
            href="/carrito"
            className="mt-8 inline-flex h-[52px] items-center justify-center rounded-md bg-black px-10 text-[13px] font-light uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/80"
          >
            Volver al carrito
          </Link>
        </div>
      </main>
    );
  }

  if (isSuccess && createdPedido) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-[#222]">
        <div className="flex flex-col items-center animate-[checkout-success-pop_500ms_ease-out]">
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle size={48} weight="fill" className="text-green-600" />
          </div>
          <h2 className="mb-2 text-2xl font-medium">Pago confirmado</h2>
          <p className="mb-4 max-w-sm text-[14px] text-black/60">
            Tu comprobante ha sido enviado. Nuestra asesora se comunicará contigo al{" "}
            <span className="font-medium text-black">+51 {phone || "número registrado"}</span> para coordinar la entrega.
          </p>

          <div className="mt-4 w-full max-w-xs rounded-lg border border-black/10 bg-[#fafafa] p-4 text-left">
            <p className="mb-1 text-[11px] uppercase tracking-wider text-black/50">Código de pedido</p>
            <p className="text-base font-medium tracking-widest">{orderCode}</p>
            <p className="mb-1 mt-3 text-[11px] uppercase tracking-wider text-black/50">Total pagado</p>
            <p className="text-base font-medium">S/ {payableTotal.toFixed(2)}</p>
            <p className="mb-1 mt-3 text-[11px] uppercase tracking-wider text-black/50">Método</p>
            <p className="text-base font-medium">{selectedPaymentMethod}</p>
          </div>

          <Link
            href="/"
            className="mt-8 inline-flex h-[52px] items-center justify-center rounded-md border border-black px-10 text-[13px] font-light uppercase tracking-[0.1em] text-black transition-colors hover:bg-black hover:text-white"
          >
            Volver a la tienda
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setTurnstileLoaded(true)}
        />
      )}
      <main className="min-h-screen bg-white text-[#222]">

      {/* Fixed mobile order summary bar */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-[#f5f5f5] lg:hidden">
        <div className="flex w-full items-center justify-between px-5 py-4 text-sm">
          <button
            type="button"
            onClick={() => setShowMobileSummary(!showMobileSummary)}
            className="flex items-center gap-2 text-black"
          >
            <ShoppingCartSimple size={20} />
            <span>Resumen</span>
            {showMobileSummary ? <CaretUp size={14} /> : <CaretDown size={14} />}
          </button>
          {step === 3 && timerActive && (
            <div className="flex items-center gap-1.5">
              <Clock
                size={16}
                weight="light"
                className={timeLeft <= 60 ? "text-red-500" : "text-black/40"}
              />
              <span className={`text-sm font-medium tabular-nums ${
                timeLeft <= 60
                  ? "text-red-600 animate-[checkout-timer-pulse_1s_ease-in-out_infinite]"
                  : "text-black"
              }`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
          <span className="text-base font-medium text-black">
            S/ {summaryTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Fixed backdrop for mobile cart */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden transition-opacity duration-300 ${
          showMobileSummary ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowMobileSummary(false)}
      />

      {/* Fixed mobile cart panel */}
      <div className={`fixed left-0 right-0 top-[53px] z-30 max-h-[70vh] overflow-y-auto bg-[#fafafa] shadow-2xl lg:hidden px-5 py-6 sm:px-10 transition-all duration-300 ${
        showMobileSummary ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0 pointer-events-none"
      }`}>
          {/* Scrollable products */}
          <div className="space-y-4 pb-2">
            {summaryItems.map((item) => (
              <div key={item.key} className="flex items-center gap-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.16em] text-black/25">
                      KIMENTS
                    </div>
                  )}
                  <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-medium text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 text-sm font-light min-w-0">
                  <p className="font-medium text-black truncate">{item.name}</p>
                  <p className="text-black/60 truncate">{item.colorName} / {item.sizeName}</p>
                </div>
                <div className="text-sm font-medium shrink-0">S/ {item.subtotal.toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Static totals */}
          <div className="mt-4 border-t border-black/10 pt-4 text-sm">
            <div className="flex justify-between py-2 font-light text-black/70">
              <span>Subtotal</span>
              <span className="text-black font-medium">S/ {summaryTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 font-light text-black/70">
              <span>Envío</span>
              <span className="text-[12px]">
                {shippingLabel || "Calculado en el próximo paso"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-black/10 pt-4">
            <span className="text-base font-medium">Total</span>
            <div className="flex items-end gap-2">
              <span className="text-xs text-black/50 mb-1">PEN</span>
              <span className="text-2xl font-semibold">S/ {summaryTotal.toFixed(2)}</span>
            </div>
          </div>

          {orderCode && (
            <div className="mt-4 border-t border-black/10 pt-4">
              <p className="text-[11px] uppercase tracking-wider text-black/50 mb-1">Código de pedido</p>
              <p className="text-sm font-medium tracking-wider">{orderCode}</p>
            </div>
          )}
        </div>

      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row-reverse lg:min-h-screen pt-[53px] lg:pt-0">

        {/* RIGHT COLUMN: ORDER SUMMARY (desktop only) */}
        <section className="hidden lg:block relative w-full bg-[#fafafa] lg:sticky lg:top-0 lg:h-screen lg:w-[45%] lg:overflow-y-auto lg:border-l lg:border-gray-200 xl:w-[42%]">
          <div className="flex flex-col h-full px-10 py-12">
            {/* Scrollable products */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-2 pr-1">
              {summaryItems.map((item) => (
                <div key={item.key} className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-md border border-black/10 bg-white">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        unoptimized
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[9px] uppercase tracking-[0.16em] text-black/25">
                        KIMENTS
                      </div>
                    )}
                    <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-medium text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 text-sm font-light min-w-0">
                    <p className="font-medium text-black truncate">{item.name}</p>
                    <p className="text-black/60 truncate">{item.colorName} / {item.sizeName}</p>
                  </div>
                  <div className="text-sm font-medium shrink-0">S/ {item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Static totals */}
            <div className="shrink-0 mt-4 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between py-2 font-light text-black/70">
                <span>Subtotal</span>
                <span className="text-black font-medium">S/ {summaryTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-light text-black/70">
                <span>Envío</span>
                <span className="text-[12px]">
                  {shippingLabel || "Calculado en el próximo paso"}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-between border-t border-black/10 pt-4">
              <span className="text-base font-medium">Total</span>
              <div className="flex items-end gap-2">
                <span className="text-xs text-black/50 mb-1">PEN</span>
                <span className="text-2xl font-semibold">S/ {summaryTotal.toFixed(2)}</span>
              </div>
            </div>

            {orderCode && (
              <div className="shrink-0 mt-4 border-t border-black/10 pt-4">
                <p className="text-[11px] uppercase tracking-wider text-black/50 mb-1">Código de pedido</p>
                <p className="text-sm font-medium tracking-wider">{orderCode}</p>
              </div>
            )}
          </div>
        </section>

        {/* LEFT COLUMN: CHECKOUT */}
        <section className="w-full bg-white px-5 py-8 sm:px-10 lg:w-[55%] lg:px-16 lg:py-12 xl:w-[58%] xl:px-20">

          {/* Mobile Header */}
          <header className="mb-6 flex justify-center lg:hidden">
            <Link href="/" className="inline-flex flex-col items-center leading-none">
              <span className="font-[family-name:var(--font-kiments)] text-[26px] font-normal tracking-[0.14em]">
                KIMENTS
              </span>
              <span className="mt-1 text-[7px] font-light uppercase tracking-[0.22em] text-black/45">
                Tienda de ropa
              </span>
            </Link>
          </header>

          {/* Desktop Header */}
          <header className="mb-8 hidden lg:block">
            <Link href="/" className="inline-flex flex-col items-center leading-none">
              <span className="font-[family-name:var(--font-kiments)] text-[36px] font-normal tracking-[0.16em]">
                KIMENTS
              </span>
              <p className="mt-1 text-[10px] font-light uppercase tracking-[0.24em] text-black/40">
                Tienda de ropa
              </p>
            </Link>
          </header>

          {/* Step Indicator — 3 steps */}
          <div className="mb-10 flex items-center justify-center gap-0">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => { if (step >= 2 && !createdPedido) handleBackToStep1(); }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-500 ${
                  step >= 1
                    ? "bg-black text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step > 1 ? <CheckCircle size={20} weight="fill" /> : "1"}
              </div>
              <span className={`text-[11px] font-light tracking-wide transition-colors ${
                step === 1 ? "text-black" : "text-black/50"
              }`}>
                Información
              </span>
            </button>

            {/* Connector 1-2 */}
            <div className="mx-3 h-[2px] w-12 sm:w-20 rounded-full transition-all duration-700 bg-gray-300">
              <div
                className="h-full rounded-full bg-black transition-all duration-700 ease-out"
                style={{ width: step >= 2 ? "100%" : "0%" }}
              />
            </div>

            {/* Step 2 */}
            <button
              type="button"
              onClick={() => { if (step >= 3 && !createdPedido) handleBackToStep2(); }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className={`flex size-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-500 ${
                  step >= 2
                    ? "bg-black text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step > 2 ? <CheckCircle size={20} weight="fill" /> : "2"}
              </div>
              <span className={`text-[11px] font-light tracking-wide transition-colors ${
                step === 2 ? "text-black" : "text-black/50"
              }`}>
                Pago
              </span>
            </button>

            {/* Connector 2-3 */}
            <div className="mx-3 h-[2px] w-12 sm:w-20 rounded-full transition-all duration-700 bg-gray-300">
              <div
                className="h-full rounded-full bg-black transition-all duration-700 ease-out"
                style={{ width: step >= 3 ? "100%" : "0%" }}
              />
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex size-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-500 ${
                  step >= 3
                    ? "bg-black text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400"
                }`}
              >
                {isSuccess ? <CheckCircle size={20} weight="fill" /> : "3"}
              </div>
              <span className={`text-[11px] font-light tracking-wide transition-colors ${
                step === 3 ? "text-black" : "text-black/50"
              }`}>
                Verificación
              </span>
            </div>
          </div>

          {/* STEP CONTENT */}
          <div key={stepKey} className="animate-[checkout-step-in_450ms_ease-out]">

            {/* ==================== PASO 1: INFORMACION ==================== */}
            {step === 1 && (
              <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); handleGoToStep2(); }}>

                {/* Informacion de contacto */}
                <section>
                  <h2 className="mb-5 text-xl font-medium text-[#222]">Información de contacto</h2>

                  {/* DNI */}
                  <div className="mb-4">
                    <div className="grid grid-cols-[72px_1fr] overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                      <div className="flex items-center justify-center border-r border-gray-300 bg-[#fafafa]">
                        <span className="text-sm font-light text-black/60">DNI</span>
                      </div>
                      <input
                        aria-label="Número de DNI"
                        placeholder="Número de Documento"
                        value={docNumber}
                        onChange={(e) => { setDocNumber(e.target.value); }}
                        className="h-12 px-4 text-sm font-light outline-none"
                      />
                    </div>
                  </div>

                  {/* Nombre y Apellido */}
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <Input
                        placeholder="Nombres"
                        value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFirstName(e.target.value); }}
                      />
                    </div>
                    <div>
                      <Input
                        placeholder="Apellidos"
                        value={lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setLastName(e.target.value); }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <label className="mb-1.5 block text-[13px] font-light text-black/60">
                      <EnvelopeSimple size={14} className="inline mr-1.5 -mt-0.5" />
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      placeholder="tu@correo.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); }}
                      className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm font-light outline-none transition-shadow focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* Telefono +51 */}
                  <div>
                    <label className="mb-1.5 block text-[13px] font-light text-black/60">
                      <Phone size={14} className="inline mr-1.5 -mt-0.5" />
                      Teléfono
                    </label>
                    <div className="flex items-center overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                      <div className="flex shrink-0 items-center gap-1 border-r border-gray-300 bg-[#fafafa] pl-3 pr-2.5 py-0">
                        <svg className="size-4 shrink-0" viewBox="0 0 30 20" fill="none" aria-hidden="true">
                          <rect width="10" height="20" fill="#D91023" />
                          <rect x="10" width="10" height="20" fill="white" />
                          <rect x="20" width="10" height="20" fill="#D91023" />
                        </svg>
                        <span className="text-sm font-light text-black/60">+51</span>
                      </div>
                      <input
                        type="tel"
                        placeholder="987 654 321"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); }}
                        className="h-12 flex-1 bg-transparent px-3 text-sm font-light outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-5 rounded-md border border-gray-200 bg-[#fafafa] p-4">
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-[#222]">
                      <input
                        type="checkbox"
                        checked={wantsInvoice}
                        onChange={(e) => {
                          setWantsInvoice(e.target.checked);

                        }}
                        className="size-4 accent-black"
                      />
                      Deseo factura
                    </label>
                    {wantsInvoice && (
                      <div className="mt-4">
                        <Input
                          placeholder="Número de RUC"
                          value={rucNumber}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setRucNumber(e.target.value.replace(/\D/g, "").slice(0, 11));
                          }}
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Metodo de envio */}
                <section>
                  <h2 className="mb-5 text-xl font-medium text-[#222]">Método de envío</h2>

                  {/* Toggle Delivery / Recojo */}
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setShippingType("delivery"); }}
                      className={`flex items-center justify-center gap-2 h-12 rounded-md border text-sm font-medium transition-all ${
                        shippingType === "delivery"
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-black hover:border-black"
                      }`}
                    >
                      <Truck size={18} weight={shippingType === "delivery" ? "fill" : "regular"} />
                      DELIVERY
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShippingType("pickup"); }}
                      className={`flex items-center justify-center gap-2 h-12 rounded-md border text-sm font-medium transition-all ${
                        shippingType === "pickup"
                          ? "border-black bg-black text-white"
                          : "border-gray-300 bg-white text-black hover:border-black"
                      }`}
                    >
                      <Storefront size={18} weight={shippingType === "pickup" ? "fill" : "regular"} />
                      RECOJO EN TIENDA
                    </button>
                  </div>

                  {/* DELIVERY form */}
                  {shippingType === "delivery" && (
                    <div className="space-y-4 animate-[checkout-step-in_350ms_ease-out]">
                      <div>
                        <Input
                          placeholder="Dirección"
                          value={address}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAddress(e.target.value); }}
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="Referencia (opcional)"
                          value={referencia}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReferencia(e.target.value)}
                        />
                      </div>

                      {/* Pais fijo */}
                      <div>
                        <label className="mb-1.5 block text-[13px] font-light text-black/60">
                          <FlagBanner size={14} className="inline mr-1.5 -mt-0.5" />
                          País
                        </label>
                        <div className="flex h-12 w-full items-center rounded-md border border-gray-200 bg-[#fafafa] px-4 text-sm font-light text-black/50">
                          Perú
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div>
                          <Input
                            placeholder="Departamento"
                            value={departamento}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDepartamento(e.target.value); }}
                        />
                      </div>
                      <div>
                          <Input
                            placeholder="Provincia"
                            value={provincia}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProvincia(e.target.value); }}
                        />
                      </div>
                      <div>
                          <Input
                            placeholder="Distrito"
                            value={distrito}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDistrito(e.target.value); }}
                        />
                      </div>
                    </div>

                    {/* Tarifa de envio */}
                      <div>
                        <h3 className="mb-3 text-sm font-medium text-[#222]">Selección de tarifa de envío</h3>
                        <div className="space-y-2">
                          <label
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 transition-colors ${
                              shippingRate === "shalom"
                                ? "border-black bg-[#fafafa]"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <input
                                type="radio"
                                name="shippingRate"
                                value="shalom"
                                checked={shippingRate === "shalom"}
                                onChange={() => { setShippingRate("shalom"); }}
                                className="mt-0.5 size-[18px] shrink-0 accent-black"
                              />
                              <div>
                                <span className="text-sm font-medium text-[#222]">Shalom</span>
                                <p className="mt-0.5 text-[12px] text-black/50">El costo se coordina al interno</p>
                              </div>
                            </div>
                            <img
                              src="/img/metodo-envio/SHALOM.png"
                              alt="Shalom"
                              className="h-8 w-auto shrink-0 object-contain"
                            />
                          </label>
                          <label
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 transition-colors ${
                              shippingRate === "olva"
                                ? "border-black bg-[#fafafa]"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <input
                                type="radio"
                                name="shippingRate"
                                value="olva"
                                checked={shippingRate === "olva"}
                                onChange={() => { setShippingRate("olva"); }}
                                className="mt-0.5 size-[18px] shrink-0 accent-black"
                              />
                              <div>
                                <span className="text-sm font-medium text-[#222]">Olva</span>
                                <p className="mt-0.5 text-[12px] text-black/50">Solo Lima. El costo se coordina al interno</p>
                              </div>
                            </div>
                            <img
                              src="/img/metodo-envio/OLVA.png"
                              alt="Olva"
                              className="h-8 w-auto shrink-0 object-contain"
                            />
                          </label>
                          <label
                            className={`flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3 transition-colors ${
                              shippingRate === "motorizado"
                                ? "border-black bg-[#fafafa]"
                                : "border-gray-200 bg-white hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <input
                                type="radio"
                                name="shippingRate"
                                value="motorizado"
                                checked={shippingRate === "motorizado"}
                                onChange={() => { setShippingRate("motorizado"); }}
                                className="mt-0.5 size-[18px] shrink-0 accent-black"
                              />
                              <div>
                                <span className="text-sm font-medium text-[#222]">Motorizado</span>
                                <p className="mt-0.5 text-[12px] text-black/50">El costo se coordina al interno</p>
                              </div>
                            </div>
                            <img
                              src="/img/metodo-envio/Motorizado.png"
                              alt="Motorizado"
                              className="h-8 w-auto shrink-0 object-contain"
                            />
                          </label>
                      </div>
                    </div>
                    </div>
                  )}

                  {/* RECOJO EN TIENDA info */}
                  {shippingType === "pickup" && (
                    <div className="rounded-lg border border-gray-200 bg-[#fafafa] p-5 animate-[checkout-step-in_350ms_ease-out]">
                      <div className="flex items-start gap-3">
                        <MapPin size={20} className="mt-0.5 shrink-0 text-black/50" weight="fill" />
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-[#222]">KIMENTS</p>
                            <p className="mt-0.5 text-[13px] leading-relaxed text-black/70">
                              Cruce Hr. Huánuco con Unanue 1705-1707, Galería Plaza H, Piso 7, Lima - La Victoria
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-black/40">Referencia</p>
                            <p className="mt-0.5 text-[13px] text-black/60">
                              Frente al Parque Cánepa, Gamarra
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-medium uppercase tracking-wider text-black/40">Horario de atención</p>
                            <div className="mt-1 space-y-0.5 text-[13px] text-black/60">
                              <p>Lunes a Viernes: 9:00 am - 7:00 pm</p>
                              <p>Sábados: 9:00 am - 5:00 pm</p>
                              <p>Domingos: No hay atención</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                {/* Submit Step 1 */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex h-[56px] w-full items-center justify-center gap-2 rounded-md bg-black px-6 text-[15px] font-medium tracking-wide text-white transition-all hover:bg-black/80 active:scale-[0.98]"
                  >
                    Siguiente
                    <CaretRight size={18} weight="bold" />
                  </button>
                </div>

              </form>
            )}

            {/* ==================== PASO 2: PAGO ==================== */}
            {step === 2 && (
              <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); handleGoToStep3(); }}>
                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="flex items-center gap-1.5 text-[13px] text-black/50 transition-colors hover:text-black"
                >
                  <CaretRight size={12} weight="bold" className="rotate-180" />
                  Volver a información
                </button>

                {/* Resumen del contacto */}
                <section>
                  <h2 className="mb-5 text-xl font-medium text-[#222]">Resumen del contacto</h2>
                  <div className="rounded-lg border border-gray-200 bg-[#fafafa] divide-y divide-gray-200">
                    {/* DNI */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-black/50">DNI</span>
                      <span className="text-[13px] font-medium text-[#222]">{docNumber}</span>
                    </div>
                    {/* Nombre completo */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-black/50">Nombre</span>
                      <span className="text-[13px] font-medium text-[#222]">{firstName} {lastName}</span>
                    </div>
                    {/* Email */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-black/50">Correo</span>
                      <span className="text-[13px] font-medium text-[#222]">{email}</span>
                    </div>
                    {/* Telefono */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-black/50">Teléfono</span>
                      <span className="text-[13px] font-medium text-[#222]">+51 {phone}</span>
                    </div>
                    {wantsInvoice && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-[13px] text-black/50">Factura RUC</span>
                        <span className="text-[13px] font-medium text-[#222]">{rucNumber}</span>
                      </div>
                    )}
                    {/* Metodo de envio */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[13px] text-black/50">Método de envío</span>
                      <span className="text-[13px] font-medium text-[#222]">{shippingLabel}</span>
                    </div>
                    {/* Datos de envio */}
                    {shippingType === "delivery" && (
                      <>
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-[13px] text-black/50">Dirección</span>
                          <span className="text-[13px] font-medium text-[#222] text-right max-w-[60%]">{address}</span>
                        </div>
                        {referencia && (
                          <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-[13px] text-black/50">Referencia</span>
                            <span className="text-[13px] text-black/60 text-right max-w-[60%]">{referencia}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-[13px] text-black/50">Ubicación</span>
                          <span className="text-[13px] font-medium text-[#222] text-right max-w-[60%]">{departamento}, {provincia}, {distrito}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-[13px] text-black/50">Tarifa</span>
                          <span className="text-[13px] font-medium text-[#222]">{shippingRate === "shalom" ? "Shalom" : shippingRate === "olva" ? "Olva" : "Motorizado"}</span>
                        </div>
                      </>
                    )}
                    {shippingType === "pickup" && (
                      <div className="px-4 py-3">
                        <span className="text-[13px] text-black/50">Tienda</span>
                        <p className="mt-1 text-[13px] text-[#222]">
                          Cruce Hr. Huánuco con Unanue 1705-1707, Galería Plaza H, Piso 7, Lima - La Victoria
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Metodo de pago */}
                <section>
                  <h2 className="mb-5 text-xl font-medium text-[#222]">Método de pago</h2>
                  <p className="mb-4 text-[13px] text-black/60">Todas las transacciones son seguras y están cifradas.</p>

                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.label}
                        type="button"
                        onClick={() => { setSelectedPaymentMethod(method.label); setErrors((prev) => ({ ...prev, payment: "" })); }}
                        className={`flex flex-col items-center justify-center gap-2 rounded-md border p-4 transition-all ${
                          selectedPaymentMethod === method.label
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-[#222] hover:border-black"
                        }`}
                      >
                        {method.image && (
                          <Image
                            src={method.image}
                            alt={method.imageAlt}
                            width={method.type === "yape" ? 48 : 80}
                            height={method.type === "yape" ? 48 : 32}
                            className={method.imageClassName}
                          />
                        )}
                        <span className="text-sm font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                  {errors.payment && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                      <XCircle size={14} /> {errors.payment}
                    </p>
                  )}
                </section>

                {TURNSTILE_SITE_KEY && (
                  <section>
                    <div ref={turnstileRef} className="min-h-[65px]" />
                    {errors.turnstile && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                        <XCircle size={14} /> {errors.turnstile}
                      </p>
                    )}
                  </section>
                )}

                {/* Submit Step 2 */}
                <div className="pt-2">
                  {orderError && (
                    <p className="mb-3 flex items-center gap-1.5 text-[12px] text-red-600">
                      <XCircle size={14} /> {orderError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isCreatingOrder || Boolean(TURNSTILE_SITE_KEY && !turnstileToken)}
                    className="flex h-[56px] w-full items-center justify-center gap-2 rounded-md bg-black px-6 text-[15px] font-medium tracking-wide text-white transition-all hover:bg-black/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/30"
                  >
                    {isCreatingOrder ? (
                      <>
                        <Spinner size={20} className="animate-spin" />
                        Reservando stock...
                      </>
                    ) : (
                      <>
                        Ir a pagar
                        <CaretRight size={18} weight="bold" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

            {/* ==================== PASO 3: VERIFICACION ==================== */}
            {step === 3 && !isSuccess && (
              <div className="space-y-8">
                {/* Timer */}
                {timerActive && (
                  <div className={`hidden lg:flex items-center gap-3 rounded-lg border px-4 py-3 -mt-4 ${
                    timeLeft <= 60
                      ? "border-red-200 bg-red-50"
                      : "border-black/10 bg-[#fafafa]"
                  }`}>
                    <Clock
                      size={20}
                      weight="light"
                      className={`shrink-0 ${
                        timeLeft <= 60 ? "text-red-500" : "text-black/40"
                      }`}
                    />
                    <span className={`text-lg font-medium tabular-nums tracking-tight ${
                      timeLeft <= 60
                        ? "text-red-600 animate-[checkout-timer-pulse_1s_ease-in-out_infinite]"
                        : "text-black"
                    }`}>
                      {formatTime(timeLeft)}
                    </span>
                    <span className="text-[12px] text-black/40">para completar el pago</span>
                  </div>
                )}

                {/* Total to Pay */}
                <section className="rounded-lg border border-black bg-black p-5 text-white sm:p-6">
                  <p className="text-[11px] uppercase tracking-wider text-white/60 mb-1">Total a pagar</p>
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-white/50 mb-1">PEN</span>
                    <span className="text-3xl font-semibold tracking-tight">S/ {payableTotal.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-white/70">
                    Realiza el pago exacto por {selectedPaymentMethod === "YAPE" ? "Yape" : "transferencia bancaria"}.
                  </p>
                </section>

                {/* Datos de pago */}
                <section>
                  <h2 className="mb-4 text-lg font-medium text-[#222]">Datos de pago</h2>
                  {selectedPaymentMethod === "YAPE" ? (
                    <div className="rounded-lg border border-gray-200 bg-[#fafafa] p-5 sm:p-6">
                      <div className="flex flex-col items-center gap-5 sm:flex-row">
                        <div className="relative size-28 shrink-0 overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
                          <Image
                            src="/img/metodo-pago/yape.jpg"
                            alt="QR de Yape"
                            fill
                            sizes="112px"
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-black/50">Yapea a nombre de</p>
                          <p className="mt-1 text-lg font-semibold text-[#222]">{selectedPayment?.detailName}</p>
                          <p className="mt-1 text-[15px] font-medium tracking-wide text-black/70">{selectedPayment?.detailNumber}</p>
                          {selectedPayment?.detailDni && (
                            <p className="mt-1 text-[13px] text-black/50">DNI: {selectedPayment.detailDni}</p>
                          )}
                          <p className="mt-2 text-[13px] text-black/60">
                            Escanea el QR o yapea al número indicado. El monto debe ser exacto.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-gray-200 bg-[#fafafa] p-5 sm:p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-black/50 mb-3">
                        Datos de la cuenta BCP
                      </p>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between border-b border-black/5 pb-2">
                          <span className="text-black/60">Titular</span>
                          <span className="font-medium">{selectedPayment?.detailName}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-black/5 pb-2">
                          <span className="text-black/60">N.° de cuenta</span>
                          <span className="font-medium tracking-wider">{selectedPayment?.detailNumber}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-black/60">Monto</span>
                          <span className="font-medium">S/ {payableTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      <p className="mt-4 text-[13px] text-black/60">
                        Realiza la transferencia por el monto exacto y sube tu comprobante.
                      </p>
                    </div>
                  )}
                </section>

                {/* Upload Voucher */}
                <section>
                  <h2 className="mb-4 text-lg font-medium text-[#222]">Subir comprobante de pago</h2>

                  {!voucherPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-[#fafafa] p-8 transition-colors hover:border-black/40 hover:bg-gray-50"
                    >
                      <UploadSimple size={28} className="text-black/30" />
                      <div className="text-center">
                        <p className="text-[13px] font-medium text-black/60">
                          Haz clic para subir tu captura
                        </p>
                        <p className="text-[11px] text-black/40">PNG, JPG o WEBP (máx. 5MB)</p>
                      </div>
                    </div>
                  ) : !voucherConfirmed ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-[#fafafa]">
                      <div className="relative">
                        <Image
                          src={voucherPreview}
                          alt="Comprobante de pago"
                          width={600}
                          height={400}
                          className="w-full object-contain max-h-56"
                        />
                      </div>
                      <div className="border-t border-gray-200 px-4 py-3 text-center">
                        <p className="mb-3 text-[13px] font-medium text-[#222]">¿El comprobante es correcto?</p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setVoucherConfirmed(true)}
                            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-black text-[12px] font-medium text-white transition-colors hover:bg-black/80"
                          >
                            <CheckCircle size={16} weight="fill" />
                            Sí, confirmar
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white text-[12px] font-medium text-black transition-colors hover:bg-gray-50"
                          >
                            <XCircle size={16} />
                            Cambiar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-lg border-2 border-green-400 bg-[#fafafa]">
                      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-center gap-1.5 bg-green-400 py-1.5 text-[11px] font-medium text-white">
                        <CheckCircle size={14} weight="fill" />
                        Comprobante confirmado
                      </div>
                      <Image
                        src={voucherPreview}
                        alt="Comprobante de pago"
                        width={600}
                        height={400}
                        className="w-full object-contain max-h-56 pt-7"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute right-2 top-8 z-10 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!voucherFile && (
                    <p className="mt-2 text-[11px] text-black/40">
                      Necesitas subir tu comprobante para confirmar el pedido.
                    </p>
                  )}
                </section>

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 size-4 shrink-0 accent-black rounded border-gray-300"
                  />
                  <span className="text-[13px] leading-5 text-black/80">
                    He leído y acepto los{" "}
                    <Link href="/terminos-y-condiciones" className="underline hover:text-black font-medium">
                      Términos y Condiciones
                    </Link>{" "}
                    de compra del sitio web.
                  </span>
                </label>

                {/* Submit payment */}
                {orderError && (
                  <p className="flex items-center gap-1.5 text-[12px] text-red-600">
                    <XCircle size={14} /> {orderError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  disabled={!voucherFile || !voucherConfirmed || timerExpired || isSubmitting || !acceptedTerms || !createdPedido || !pedidoToken}
                  className="flex h-[56px] w-full items-center justify-center gap-2 rounded-md bg-black px-6 text-[15px] font-medium tracking-wide text-white transition-all hover:bg-black/80 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-black/30"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size={20} className="animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Confirmar pago
                      <CheckCircle size={20} weight="fill" />
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

          {/* Footer links */}
          <footer className="mt-14 border-t border-gray-200 pt-6">
            <div className="flex gap-4 text-[12px] text-[#222]/60">
              <Link href="/terminos-y-condiciones" className="hover:text-black hover:underline transition-colors">Términos de servicio</Link>
              <Link href="/preguntas-frecuentes" className="hover:text-black hover:underline transition-colors">Preguntas Frecuentes</Link>
            </div>
          </footer>
        </section>

      </div>

      {/* Warning modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowWarningModal(false)}
          />
          <div className="relative z-10 mx-6 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-[checkout-success-pop_300ms_ease-out]">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-amber-50">
                <WarningCircle size={32} weight="fill" className="text-amber-500" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-[#222]">Completa los campos</h3>
              <p className="mb-4 text-[13px] text-black/50">Revisa lo siguiente para continuar:</p>
              <ul className="mb-6 w-full space-y-2 text-left">
                {Object.entries(errors).map(([key, msg]) => (
                  <li key={key} className="flex items-start gap-2 text-[13px] text-black/70">
                    <span className="mt-0.5 shrink-0 text-[10px] text-amber-500">●</span>
                    <span>{msg}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="flex h-[44px] w-full items-center justify-center rounded-md bg-black text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-black/80"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      {stockIssues.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 mx-6 w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl animate-[checkout-success-pop_300ms_ease-out]">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-amber-50">
                <WarningCircle size={32} weight="fill" className="text-amber-500" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-[#222]">No hay stock suficiente</h3>
              <p className="mb-4 text-[13px] text-black/50">
                Revisa los productos afectados antes de continuar.
              </p>
              <ul className="mb-6 w-full space-y-2 text-left">
                {stockIssues.map((issue) => (
                  <li
                    key={issue.idProductoVariante}
                    className="flex items-start gap-2 text-[13px] text-black/70"
                  >
                    <span className="mt-0.5 shrink-0 text-[10px] text-amber-500">-</span>
                    <span>
                      <span className="font-medium text-black">{issue.itemName}</span>
                      {" · "}Solicitado: {issue.requested}
                      {" · "}Disponible: {issue.available}
                    </span>
                  </li>
                ))}
                {!hasCartItemsAvailableAfterAdjustment ? (
                  <li className="flex items-start gap-2 text-[13px] text-black/70">
                    <span className="mt-0.5 shrink-0 text-[10px] text-amber-500">-</span>
                    <span>No hay stock disponible para continuar con el pago.</span>
                  </li>
                ) : (
                  <li className="flex items-start gap-2 text-[13px] text-black/70">
                    <span className="mt-0.5 shrink-0 text-[10px] text-amber-500">-</span>
                    <span>Podemos continuar con lo disponible y mantener en el carrito los otros productos que sí tienen stock.</span>
                  </li>
                )}
              </ul>
              <div className="flex w-full flex-col gap-3">
                {hasCartItemsAvailableAfterAdjustment ? (
                  <button
                    type="button"
                    onClick={handleAcceptAvailableStock}
                    disabled={isResolvingStockIssue}
                    className="flex h-[44px] w-full items-center justify-center rounded-md bg-black text-[13px] font-medium tracking-wide text-white transition-colors hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/30"
                  >
                    {isResolvingStockIssue ? "Actualizando..." : "Seleccionar esos productos"}
                  </button>
                ) : null}
                <Link
                  href="/"
                  className="flex h-[44px] w-full items-center justify-center rounded-md border border-black/15 bg-white text-[13px] font-medium tracking-wide text-black transition-colors hover:bg-black/5"
                >
                  Regresar al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}

function Input({
  placeholder,
  value,
  onChange,
}: Readonly<{
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}>) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm font-light outline-none transition-shadow focus:border-black focus:ring-1 focus:ring-black"
    />
  );
}
