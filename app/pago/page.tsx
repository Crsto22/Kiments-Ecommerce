"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCartSimple,
  CaretDown,
  CaretUp,
  CaretRight,
  CheckCircle,
  Clock,
  UploadSimple,
  Copy,
  EnvelopeSimple,
  Phone,


  XCircle,
  Spinner,
  Storefront,
  Truck,
  MapPin,
  FlagBanner,
} from "@phosphor-icons/react";
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

  // Paso 1 — contacto
  const [docNumber, setDocNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

    if (!docNumber.trim()) {
      newErrors.docNumber = "Ingresa tu número de DNI";
    }
    if (!firstName.trim()) {
      newErrors.firstName = "Ingresa tus nombres";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Ingresa tus apellidos";
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [docNumber, firstName, lastName, phone, email, shippingType, address, departamento, provincia, distrito, shippingRate]);

  const validateStep2 = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!selectedPaymentMethod) {
      newErrors.payment = "Selecciona un método de pago";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedPaymentMethod]);

  const handleGoToStep2 = () => {
    if (!validateStep1()) return;
    setStep(2);
    setStepKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoToStep3 = () => {
    if (!validateStep2()) return;
    const code = generateOrderCode();
    setOrderCode(code);
    setTimeLeft(600);
    setTimerActive(true);
    setTimerExpired(false);
    setStep(3);
    setStepKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimerActive(false);
  };

  const selectedPayment = paymentMethods.find((m) => m.label === selectedPaymentMethod);

  const shippingLabel =
    shippingType === "delivery"
      ? "Delivery"
      : shippingType === "pickup"
        ? "Recojo en tienda"
        : "";

  return (
    <main className="min-h-screen bg-white text-[#222]">

      {/* Fixed mobile order summary bar */}
      <div className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-[#f5f5f5] lg:hidden">
        <button
          type="button"
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="flex w-full items-center justify-between px-5 py-5 text-sm"
        >
          <div className="flex items-center gap-2 text-black">
            <ShoppingCartSimple size={20} />
            <span>
              {showMobileSummary
                ? "Ocultar resumen"
                : "Mostrar resumen"}
            </span>
            {showMobileSummary ? <CaretUp size={14} /> : <CaretDown size={14} />}
          </div>
          <span className="text-lg font-medium text-black">
            S/ {total.toFixed(2)}
          </span>
        </button>
      </div>

      {/* Fixed backdrop for mobile cart */}
      {showMobileSummary && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setShowMobileSummary(false)}
        />
      )}

      {/* Fixed mobile cart panel */}
      {showMobileSummary && (
        <div className="fixed left-0 right-0 top-[61px] z-30 max-h-[70vh] overflow-y-auto bg-[#fafafa] shadow-2xl lg:hidden px-5 py-6 sm:px-10">
          {/* Scrollable products */}
          <div className="space-y-4 pb-2">
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
          <div className="mt-4 border-t border-black/10 pt-4 text-sm">
            <div className="flex justify-between py-2 font-light text-black/70">
              <span>Subtotal</span>
              <span className="text-black font-medium">S/ {total.toFixed(2)}</span>
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
              <span className="text-2xl font-semibold">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          {orderCode && (
            <div className="mt-4 border-t border-black/10 pt-4">
              <p className="text-[11px] uppercase tracking-wider text-black/50 mb-1">Código de pedido</p>
              <p className="text-sm font-medium tracking-wider">{orderCode}</p>
            </div>
          )}
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row-reverse lg:min-h-screen pt-[61px] lg:pt-0">

        {/* RIGHT COLUMN: ORDER SUMMARY (desktop only) */}
        <section className="hidden lg:block relative w-full bg-[#fafafa] lg:sticky lg:top-0 lg:h-screen lg:w-[45%] lg:overflow-y-auto lg:border-l lg:border-gray-200 xl:w-[42%]">
          <div className="flex flex-col h-full px-10 py-12">
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
                  {shippingLabel || "Calculado en el próximo paso"}
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

          {/* Breadcrumb */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[13px] text-black/60 shrink-0">
              <Link href="/productos" className="transition-colors hover:text-black">Carrito</Link>
              <CaretRight size={10} weight="bold" />
              <span className="font-medium text-black">
                {step === 1 ? "Información" : step === 2 ? "Pago" : "Verificación"}
              </span>
            </div>
          </div>

          {/* Step Indicator — 3 steps */}
          <div className="mb-10 flex items-center justify-center gap-0">
            {/* Step 1 */}
            <button
              type="button"
              onClick={() => { if (step >= 2) handleBackToStep1(); }}
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
              onClick={() => { if (step >= 3) handleBackToStep2(); }}
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
                        onChange={(e) => { setDocNumber(e.target.value); setErrors((prev) => ({ ...prev, docNumber: "" })); }}
                        className="h-12 px-4 text-sm font-light outline-none"
                      />
                    </div>
                    {errors.docNumber && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                        <XCircle size={14} /> {errors.docNumber}
                      </p>
                    )}
                  </div>

                  {/* Nombre y Apellido */}
                  <div className="mb-4 grid gap-3 sm:grid-cols-2">
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
                      onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
                      className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm font-light outline-none transition-shadow focus:border-black focus:ring-1 focus:ring-black"
                    />
                    {errors.email && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                        <XCircle size={14} /> {errors.email}
                      </p>
                    )}
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
                        onChange={(e) => { setPhone(e.target.value); setErrors((prev) => ({ ...prev, phone: "" })); }}
                        className="h-12 flex-1 bg-transparent px-3 text-sm font-light outline-none"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                        <XCircle size={14} /> {errors.phone}
                      </p>
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
                      onClick={() => { setShippingType("delivery"); setErrors((prev) => ({ ...prev, shippingType: "" })); }}
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
                      onClick={() => { setShippingType("pickup"); setErrors((prev) => ({ ...prev, shippingType: "" })); }}
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
                  {errors.shippingType && (
                    <p className="-mt-4 mb-4 flex items-center gap-1.5 text-[11px] text-red-600">
                      <XCircle size={14} /> {errors.shippingType}
                    </p>
                  )}

                  {/* DELIVERY form */}
                  {shippingType === "delivery" && (
                    <div className="space-y-4 animate-[checkout-step-in_350ms_ease-out]">
                      <div>
                        <Input
                          placeholder="Dirección"
                          value={address}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAddress(e.target.value); setErrors((prev) => ({ ...prev, address: "" })); }}
                        />
                        {errors.address && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                            <XCircle size={14} /> {errors.address}
                          </p>
                        )}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDepartamento(e.target.value); setErrors((prev) => ({ ...prev, departamento: "" })); }}
                          />
                          {errors.departamento && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                              <XCircle size={14} /> {errors.departamento}
                            </p>
                          )}
                        </div>
                        <div>
                          <Input
                            placeholder="Provincia"
                            value={provincia}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setProvincia(e.target.value); setErrors((prev) => ({ ...prev, provincia: "" })); }}
                          />
                          {errors.provincia && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                              <XCircle size={14} /> {errors.provincia}
                            </p>
                          )}
                        </div>
                        <div>
                          <Input
                            placeholder="Distrito"
                            value={distrito}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDistrito(e.target.value); setErrors((prev) => ({ ...prev, distrito: "" })); }}
                          />
                          {errors.distrito && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                              <XCircle size={14} /> {errors.distrito}
                            </p>
                          )}
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
                                onChange={() => { setShippingRate("shalom"); setErrors((prev) => ({ ...prev, shippingRate: "" })); }}
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
                                onChange={() => { setShippingRate("olva"); setErrors((prev) => ({ ...prev, shippingRate: "" })); }}
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
                                onChange={() => { setShippingRate("motorizado"); setErrors((prev) => ({ ...prev, shippingRate: "" })); }}
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
                        {errors.shippingRate && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-red-600">
                            <XCircle size={14} /> {errors.shippingRate}
                          </p>
                        )}
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

                {/* Submit Step 2 */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="flex h-[56px] w-full items-center justify-center gap-2 rounded-md bg-black px-6 text-[15px] font-medium tracking-wide text-white transition-all hover:bg-black/80 active:scale-[0.98]"
                  >
                    Ir a pagar
                    <CaretRight size={18} weight="bold" />
                  </button>
                </div>

              </form>
            )}

            {/* ==================== PASO 3: VERIFICACION ==================== */}
            {step === 3 && !isSuccess && (
              <div className="space-y-8">
                {/* Back button */}
                <button
                  type="button"
                  onClick={handleBackToStep2}
                  className="flex items-center gap-1.5 text-[13px] text-black/50 transition-colors hover:text-black"
                >
                  <CaretRight size={12} weight="bold" className="rotate-180" />
                  Volver a método de pago
                </button>

                {/* Timer */}
                {timerActive && (
                  <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 -mt-4 ${
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

                {timerExpired && (
                  <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 -mt-4">
                    <Clock size={20} weight="light" className="text-red-500 shrink-0" />
                    <span className="text-sm font-medium text-red-600">El tiempo ha expirado. Genera un nuevo pedido para continuar.</span>
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
                <button
                  type="button"
                  onClick={handleSubmitPayment}
                  disabled={!voucherFile || timerExpired || isSubmitting || !acceptedTerms}
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
                    onClick={handleBackToStep2}
                    className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md border border-black/15 bg-white text-[14px] font-light text-black transition-colors hover:bg-gray-50"
                  >
                    Generar nuevo pedido
                  </button>
                )}
              </div>
            )}

            {/* ==================== SUCCESS ==================== */}
            {step === 3 && isSuccess && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-[checkout-success-pop_500ms_ease-out]">
                <div className="flex size-20 items-center justify-center rounded-full bg-green-50 mb-6">
                  <CheckCircle size={48} weight="fill" className="text-green-600" />
                </div>
                <h2 className="text-2xl font-medium text-[#222] mb-2">Pago confirmado</h2>
                <p className="text-[14px] text-black/60 max-w-sm mb-4">
                  Tu comprobante ha sido enviado. Nuestra asesora se comunicará contigo al{" "}
                  <span className="font-medium text-black">+51 {phone || "número registrado"}</span> para
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
