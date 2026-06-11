"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Storefront,
  ShoppingCartSimple,
  CaretDown,
  CaretUp,
  CaretRight,
  CheckCircle,
  Clock,
  UploadSimple,
  Copy,
  Warning,
  EnvelopeSimple,
  Phone,
  User,
  IdentificationCard,
  Motorcycle,
  Truck,
  XCircle,
  Spinner,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";
import { useState, useEffect, useRef, useCallback } from "react";

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
  {
    name: "Vestido Floral",
    color: "Rosado",
    size: "M",
    quantity: 1,
    price: 189,
    image: "/img/productos/Producto02.jpg",
  },
  {
    name: "Blazer Classic",
    color: "Negro",
    size: "L",
    quantity: 2,
    price: 320,
    image: "/img/productos/Producto01.jpg",
  },
  {
    name: "Falda Plisada",
    color: "Beige",
    size: "S",
    quantity: 1,
    price: 149,
    image: "/img/productos/Producto02.jpg",
  },
  {
    name: "Top Elegante",
    color: "Blanco",
    size: "M",
    quantity: 1,
    price: 119,
    image: "/img/productos/Producto01.jpg",
  },
  {
    name: "Conjunto Casual",
    color: "Verde",
    size: "L",
    quantity: 1,
    price: 279,
    image: "/img/productos/Producto02.jpg",
  },
];

type ShippingMethod = {
  label: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
  imageClassName?: string;
  icon?: ComponentType<{ size?: number; weight?: "light" | "regular"; className?: string }>;
};

const shippingMethods: ShippingMethod[] = [
  {
    label: "Envío a provincia",
    subtitle: "Coordinar con la asesora",
    icon: Truck,
  },
  {
    label: "Motorizado",
    subtitle: "Solo para Lima",
    image: "/img/metodo-envio/Motorizado.png",
    imageAlt: "Motorizado",
    imageClassName: "h-10 w-12 object-contain",
    icon: Motorcycle,
  },
  {
    label: "Recojo en tienda",
    icon: Storefront,
  },
];

const paymentMethods = [
  {
    label: "YAPE",
    image: "/img/metodo-pago/yape.jpg",
    imageAlt: "Yape",
    imageClassName: "size-12 rounded-md object-contain",
    type: "yape" as const,
    detailNumber: "987 654 321",
    detailName: "KIMENTS",
  },
  {
    label: "TRANSFERENCIA",
    image: "/img/metodo-pago/bcp.svg",
    imageAlt: "BCP",
    imageClassName: "h-9 w-24 object-contain",
    type: "transfer" as const,
    detailNumber: "002-194-001234567890-51",
    detailName: "KIMENTS S.A.C.",
  },
];

function generateOrderCode(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `KMT-${day}${month}-${random}`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PagoPage() {
  const [step, setStep] = useState(1);
  const [stepKey, setStepKey] = useState(0);

  // Paso 1 — form fields
  const [docType, setDocType] = useState("DNI");
  const [docNumber, setDocNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedShippingMethod, setSelectedShippingMethod] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Captcha
  const [captchaA] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mobile summary
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Paso 2 — payment
  const [orderCode, setOrderCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreview, setVoucherPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Lock body scroll when mobile summary is open
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

  // Timer effect
  useEffect(() => {
    if (!timerActive || timeLeft <= 0) {
      if (timeLeft <= 0 && timerActive) {
        setTimerExpired(true);
        setTimerActive(false);
      }
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const validateStep1 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!docNumber.trim()) {
      newErrors.docNumber = "Ingresa tu número de documento";
    }
    if (docType === "RUC") {
      if (!businessName.trim()) {
        newErrors.businessName = "Ingresa la razón social";
      }
    } else {
      if (!firstName.trim()) {
        newErrors.firstName = "Ingresa tus nombres";
      }
      if (!lastName.trim()) {
        newErrors.lastName = "Ingresa tus apellidos";
      }
    }
    if (!phone.trim()) {
      newErrors.phone = "Ingresa tu número de teléfono";
    } else if (phone.replace(/\s/g, "").length < 9) {
      newErrors.phone = "Ingresa un número válido (mín. 9 dígitos)";
    }
    if (!email.trim()) {
      newErrors.email = "Ingresa tu correo electrónico";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ingresa un correo válido";
    }
    if (!selectedShippingMethod) {
      newErrors.shipping = "Selecciona un método de envío";
    }
    if (!selectedPaymentMethod) {
      newErrors.payment = "Selecciona un método de pago";
    }
    if (!acceptedTerms) {
      newErrors.terms = "Debes aceptar los Términos y Condiciones";
    }
    const correctAnswer = captchaA + captchaB;
    if (!captchaAnswer.trim() || Number(captchaAnswer) !== correctAnswer) {
      newErrors.captcha = "Respuesta incorrecta";
      setCaptchaError(true);
    } else {
      setCaptchaError(false);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [docType, docNumber, firstName, lastName, businessName, phone, email, selectedShippingMethod, selectedPaymentMethod, acceptedTerms, captchaA, captchaB, captchaAnswer]);

  const handleGoToStep2 = () => {
    if (!validateStep1()) return;

    const code = generateOrderCode();
    setOrderCode(code);
    setTimeLeft(600);
    setTimerActive(true);
    setTimerExpired(false);
    setStep(2);
    setStepKey((prev) => prev + 1);

    // Smooth scroll to top on mobile
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setStepKey((prev) => prev + 1);
    setTimerActive(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVoucherFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setVoucherPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setVoucherFile(null);
    setVoucherPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmitPayment = async () => {
    if (!voucherFile) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimerActive(false);
  };

  const selectedPayment = paymentMethods.find((m) => m.label === selectedPaymentMethod);

  return (
    <main className="min-h-screen bg-white text-[#222]">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row-reverse lg:min-h-screen">

        {/* RIGHT COLUMN: ORDER SUMMARY (sticky + independent scroll on desktop) */}
        <section className="relative w-full bg-[#fafafa] lg:sticky lg:top-0 lg:h-screen lg:w-[45%] lg:overflow-y-auto lg:border-l lg:border-gray-200 xl:w-[42%]">
          {/* Mobile Accordion Toggle */}
          <div className="relative z-30 border-b border-gray-200 bg-[#f5f5f5] lg:hidden">
            <button
              type="button"
              onClick={() => setShowMobileSummary(!showMobileSummary)}
              className="flex w-full items-center justify-between px-5 py-5 text-sm"
            >
              <div className="flex items-center gap-2 text-black">
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

          {/* Backdrop */}
          {showMobileSummary && (
            <div
              className="fixed inset-0 z-10 bg-black/40 lg:hidden"
              onClick={() => setShowMobileSummary(false)}
            />
          )}

          {/* Cart Content */}
          <div
            className={`flex flex-col px-5 py-6 sm:px-10 lg:static lg:flex lg:h-full lg:px-10 lg:py-12 ${
              showMobileSummary
                ? "absolute left-0 right-0 top-full z-20 max-h-[70vh] bg-[#fafafa] shadow-2xl"
                : "hidden"
            }`}
          >
            {/* Scrollable products */}
            <div className="flex-1 overflow-y-auto space-y-4 pb-2 pr-1">
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
                    <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-black/70 text-[10px] font-medium text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 text-sm font-light min-w-0">
                    <p className="font-medium text-black truncate">{item.name}</p>
                    <p className="text-black/60 truncate">{item.color} / {item.size}</p>
                  </div>
                  <div className="text-sm font-medium shrink-0">S/ {(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Static totals */}
            <div className="shrink-0 mt-4 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between py-2 font-light text-black/70">
                <span>Subtotal</span>
                <span className="text-black font-medium">S/ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-light text-black/70">
                <span>Envío</span>
                <span className="text-[12px]">
                  {selectedShippingMethod || "Calculado en el próximo paso"}
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-between border-t border-black/10 pt-4">
              <span className="text-base font-medium">Total</span>
              <div className="flex items-end gap-2">
                <span className="text-xs text-black/50 mb-1">PEN</span>
                <span className="text-2xl font-semibold">S/ {total.toFixed(2)}</span>
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

          {/* Breadcrumb + Timer (same row) */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[13px] text-black/60 shrink-0">
              <Link href="/categorias" className="transition-colors hover:text-black">Carrito</Link>
              <CaretRight size={10} weight="bold" />
              <span className="font-medium text-black">
                {step === 1 ? "Información" : "Pago"}
              </span>
            </div>

            {/* Timer — only on Paso 2, right side */}
            {step === 2 && timerActive && !isSuccess && (
              <div className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-colors ${
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
                <span className="text-[12px] text-black/40 hidden sm:inline">
                  para pagar
                </span>
                {/* Mini progress bar */}
                <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-gray-200 sm:block">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${
                      timeLeft <= 60 ? "bg-red-500" : "bg-black"
                    }`}
                    style={{ width: `${(timeLeft / 600) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {step === 2 && timerExpired && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5">
                <Clock size={20} weight="light" className="text-red-500 shrink-0" />
                <span className="text-lg font-medium text-red-600 tabular-nums">00:00</span>
                <span className="text-[12px] text-red-500 hidden sm:inline">Expirado</span>
              </div>
            )}
          </div>

          {/* Step Indicator */}
          <div className="mb-10 flex items-center justify-center gap-0">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => { if (step === 2) handleBackToStep1(); }}
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
              <span className={`text-[12px] font-light tracking-wide transition-colors ${
                step === 1 ? "text-black" : "text-black/50"
              }`}>
                Información
              </span>
            </button>

            {/* Connector Line */}
            <div className="mx-4 h-[2px] w-16 sm:w-24 rounded-full transition-all duration-700 bg-gray-300">
              <div
                className="h-full rounded-full bg-black transition-all duration-700 ease-out"
                style={{ width: step >= 2 ? "100%" : "0%" }}
              />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex size-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-500 ${
                  step >= 2
                    ? "bg-black text-white"
                    : "border-2 border-gray-300 bg-white text-gray-400"
                }`}
              >
                2
              </div>
              <span className={`text-[12px] font-light tracking-wide transition-colors ${
                step === 2 ? "text-black" : "text-black/50"
              }`}>
                Pago
              </span>
            </div>
          </div>

          {/* STEP CONTENT */}
          <div key={stepKey} className="animate-[checkout-step-in_450ms_ease-out]">

            {/* ==================== PASO 1 ==================== */}
            {step === 1 && (
              <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); handleGoToStep2(); }}>

                {/* Contact / Doc */}
                <section>
                  <h2 className="mb-4 text-xl font-medium text-[#222]">Información de contacto</h2>
                  <div className="grid grid-cols-[100px_1fr] overflow-hidden rounded-md border border-gray-300 bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                    <select
                      aria-label="Tipo de documento"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="h-12 border-r border-gray-300 bg-transparent px-3 text-sm font-light outline-none"
                    >
                      <option value="DNI">DNI</option>
                      <option value="RUC">RUC</option>
                      <option value="CE">CE</option>
                    </select>
                    <input
                      aria-label="Número de Documento"
                      placeholder="Número de Documento"
                      value={docNumber}
                      onChange={(e) => { setDocNumber(e.target.value); setErrors((prev) => ({ ...prev, docNumber: "" })); }}
                      className="h-12 px-4 text-sm font-light outline-none"
                    />
                  </div>
                  {errors.docNumber && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                      <XCircle size={14} /> {errors.docNumber}
                    </p>
                  )}
                </section>

                {/* Names / Business */}
                <section>
                  <h2 className="mb-4 text-xl font-medium text-[#222]">
                    {docType === "RUC" ? "Razón Social" : "Nombre y Apellidos"}
                  </h2>
                  {docType === "RUC" ? (
                    <div>
                      <Input
                        placeholder="Razón Social"
                        value={businessName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setBusinessName(e.target.value); setErrors((prev) => ({ ...prev, businessName: "" })); }}
                      />
                      {errors.businessName && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                          <XCircle size={14} /> {errors.businessName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Input
                          placeholder="Nombres"
                          value={firstName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFirstName(e.target.value); setErrors((prev) => ({ ...prev, firstName: "" })); }}
                        />
                        {errors.firstName && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                            <XCircle size={14} /> {errors.firstName}
                          </p>
                        )}
                      </div>
                      <div>
                        <Input
                          placeholder="Apellidos"
                          value={lastName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setLastName(e.target.value); setErrors((prev) => ({ ...prev, lastName: "" })); }}
                        />
                        {errors.lastName && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                            <XCircle size={14} /> {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </section>

                {/* Phone & Email */}
                <section>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-light text-black/60">
                        <Phone size={14} className="inline mr-1.5 -mt-0.5" />
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        placeholder="987 654 321"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: "" })); }}
                        className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm font-light outline-none transition-shadow focus:border-black focus:ring-1 focus:ring-black"
                      />
                      {errors.phone && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                          <XCircle size={14} /> {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-light text-black/60">
                        <EnvelopeSimple size={14} className="inline mr-1.5 -mt-0.5" />
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
                        className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm font-light outline-none transition-shadow focus:border-black focus:ring-1 focus:ring-black"
                      />
                      {errors.email && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                          <XCircle size={14} /> {errors.email}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-black/40">
                        Enviaremos el código de tu pedido a este correo.
                      </p>
                    </div>
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
                        } ${selectedShippingMethod === method.label ? "bg-gray-50" : ""}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={method.label}
                            checked={selectedShippingMethod === method.label}
                            onChange={() => { setSelectedShippingMethod(method.label); setErrors((prev) => ({ ...prev, shipping: "" })); }}
                            className="size-[18px] shrink-0 accent-black"
                          />
                          <div className="min-w-0">
                            <span className="text-sm font-light text-[#222]">{method.label}</span>
                            {method.subtitle && (
                              <span className="mt-0.5 block text-[11px] text-black/40">{method.subtitle}</span>
                            )}
                          </div>
                        </div>
                        {method.image && (
                          <Image src={method.image} alt={method.label} width={40} height={40} className="shrink-0 object-contain" />
                        )}
                        {method.icon && !method.image && (
                          <method.icon size={22} weight="light" className="shrink-0 text-black/50" />
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.shipping && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                      <XCircle size={14} /> {errors.shipping}
                    </p>
                  )}
                </section>

                {/* Payment method selection */}
                <section>
                  <h2 className="mb-4 text-xl font-medium text-[#222]">Método de pago</h2>
                  <p className="mb-4 text-[13px] text-black/60">Todas las transacciones son seguras y están cifradas.</p>

                  <div className="overflow-hidden rounded-md border border-gray-300 bg-white">
                    {paymentMethods.map((method, index) => (
                      <label
                        key={method.label}
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
                            onChange={() => { setSelectedPaymentMethod(method.label); setErrors((prev) => ({ ...prev, payment: "" })); }}
                            className="size-[18px] accent-black"
                          />
                          <span className="text-sm font-medium text-[#222]">{method.label}</span>
                        </div>
                        {method.image && (
                          <Image src={method.image} alt={method.label} width={60} height={32} className="h-6 w-auto object-contain mix-blend-multiply" />
                        )}
                      </label>
                    ))}
                  </div>
                  {errors.payment && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                      <XCircle size={14} /> {errors.payment}
                    </p>
                  )}
                </section>

                {/* Captcha */}
                <section>
                  <h2 className="mb-4 text-xl font-medium text-[#222]">Verificación</h2>
                  <div className="flex items-center gap-4 rounded-md border border-gray-300 bg-[#fafafa] p-4">
                    <div className="select-none rounded-md border border-gray-300 bg-white px-4 py-2.5 text-base font-medium tracking-wider text-black">
                      {captchaA} + {captchaB} = ?
                    </div>
                    <input
                      type="number"
                      placeholder="Resultado"
                      value={captchaAnswer}
                      onChange={(e) => { setCaptchaAnswer(e.target.value); setCaptchaError(false); setErrors((prev) => ({ ...prev, captcha: "" })); }}
                      className={`h-12 w-24 rounded-md border bg-white px-3 text-center text-sm font-light outline-none transition-shadow focus:ring-1 focus:ring-black ${
                        captchaError ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-black"
                      }`}
                    />
                  </div>
                  {errors.captcha && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                      <XCircle size={14} /> {errors.captcha}
                    </p>
                  )}
                </section>

                {/* Terms */}
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => { setAcceptedTerms(e.target.checked); setErrors((prev) => ({ ...prev, terms: "" })); }}
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
                {errors.terms && (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600 -mt-8">
                    <XCircle size={14} /> {errors.terms}
                  </p>
                )}

                {/* Submit */}
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

            {/* ==================== PASO 2 ==================== */}
            {step === 2 && !isSuccess && (
              <div className="space-y-8">
                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="flex items-center gap-1.5 text-[13px] text-black/50 transition-colors hover:text-black"
                >
                  <CaretRight size={12} weight="bold" className="rotate-180" />
                  Volver a información
                </button>

                {timerExpired && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 px-4 py-3 text-[13px] text-red-700 -mt-4">
                    <Warning size={18} />
                    El tiempo ha expirado. Genera un nuevo pedido para continuar.
                  </div>
                )}

                {/* Total to Pay */}
                <section className="rounded-lg border border-black bg-black p-5 text-white sm:p-6">
                  <p className="text-[11px] uppercase tracking-wider text-white/60 mb-1">Total a pagar</p>
                  <div className="flex items-end gap-2">
                    <span className="text-xs text-white/50 mb-1">PEN</span>
                    <span className="text-3xl font-semibold tracking-tight">S/ {total.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-[13px] text-white/70">
                    Realiza el pago exacto por {selectedPaymentMethod === "YAPE" ? "Yape" : "transferencia bancaria"}.
                  </p>
                </section>

                {/* Order Code */}
                <section className="rounded-lg border border-black/10 bg-[#fafafa] p-5 sm:p-6">
                  <p className="text-[11px] uppercase tracking-wider text-black/50 mb-1">Código de pedido</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-medium tracking-widest">{orderCode}</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(orderCode)}
                      className="flex size-7 items-center justify-center rounded transition-colors hover:bg-black/10"
                      title="Copiar código"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="mt-3 text-[12px] text-black/40">
                    <EnvelopeSimple size={12} className="inline mr-1 -mt-0.5" />
                    Enviamos tu código a{" "}
                    <span className="font-medium text-black/60">{email || "tu correo"}</span>.
                    Guárdalo para hacer seguimiento.
                  </p>
                </section>

                {/* Payment Details */}
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
                          <span className="font-medium">S/ {total.toFixed(2)}</span>
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
                  ) : (
                    <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-[#fafafa]">
                      <Image
                        src={voucherPreview}
                        alt="Comprobante de pago"
                        width={600}
                        height={400}
                        className="w-full object-contain max-h-64"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black"
                      >
                        <XCircle size={18} />
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

                {/* Terms reminder */}
                <p className="text-[12px] text-black/50 text-center">
                  Al confirmar, aceptas los{" "}
                  <Link href="/terminos-y-condiciones" className="underline hover:text-black">
                    Términos y Condiciones
                  </Link>{" "}
                  y nuestra{" "}
                  <Link href="/preguntas-frecuentes" className="underline hover:text-black">
                    Política de Privacidad
                  </Link>
                  .
                </p>

                {/* Submit payment */}
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  disabled={!voucherFile || timerExpired || isSubmitting}
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

                {timerExpired && (
                  <button
                    type="button"
                    onClick={handleBackToStep1}
                    className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md border border-black/15 bg-white text-[14px] font-light text-black transition-colors hover:bg-gray-50"
                  >
                    Generar nuevo pedido
                  </button>
                )}
              </div>
            )}

            {/* ==================== SUCCESS ==================== */}
            {step === 2 && isSuccess && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-[checkout-success-pop_500ms_ease-out]">
                <div className="flex size-20 items-center justify-center rounded-full bg-green-50 mb-6">
                  <CheckCircle size={48} weight="fill" className="text-green-600" />
                </div>
                <h2 className="text-2xl font-medium text-[#222] mb-2">Pago confirmado</h2>
                <p className="text-[14px] text-black/60 max-w-sm mb-4">
                  Tu comprobante ha sido enviado. Nuestra asesora se comunicará contigo al{" "}
                  <span className="font-medium text-black">{phone || "número registrado"}</span> para
                  coordinar la entrega.
                </p>

                <div className="mt-4 w-full max-w-xs rounded-lg border border-black/10 bg-[#fafafa] p-4 text-left">
                  <p className="text-[11px] uppercase tracking-wider text-black/50 mb-1">Código de pedido</p>
                  <p className="text-base font-medium tracking-widest">{orderCode}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-wider text-black/50 mb-1">Total pagado</p>
                  <p className="text-base font-medium">S/ {total.toFixed(2)}</p>
                  <p className="mt-3 text-[11px] uppercase tracking-wider text-black/50 mb-1">Método</p>
                  <p className="text-base font-medium">{selectedPaymentMethod}</p>
                </div>

                <Link
                  href="/"
                  className="mt-8 inline-flex h-[52px] items-center justify-center rounded-md border border-black px-10 text-[13px] font-light uppercase tracking-[0.1em] text-black transition-colors hover:bg-black hover:text-white"
                >
                  Volver a la tienda
                </Link>
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
    </main>
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
