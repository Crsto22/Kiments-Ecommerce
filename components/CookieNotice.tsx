"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const COOKIE_NOTICE_KEY = "kiments_cookie_notice_accepted";
const COOKIE_NOTICE_EVENT = "kiments-cookie-notice";

function subscribeToCookieNotice(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(COOKIE_NOTICE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(COOKIE_NOTICE_EVENT, callback);
  };
}

function hasAcceptedCookieNotice() {
  return localStorage.getItem(COOKIE_NOTICE_KEY) === "true";
}

export function CookieNotice() {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const hasAccepted = useSyncExternalStore(
    subscribeToCookieNotice,
    hasAcceptedCookieNotice,
    () => true,
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const acceptCookieNotice = () => {
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      localStorage.setItem(COOKIE_NOTICE_KEY, "true");
      window.dispatchEvent(new Event(COOKIE_NOTICE_EVENT));
    }, 220);
  };

  if (hasAccepted) return null;

  return (
    <div
      className={`fixed inset-x-3 bottom-20 z-50 sm:inset-x-6 sm:bottom-6 ${
        isClosing ? "cookie-notice-exit" : "cookie-notice-enter"
      }`}
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 border border-black/10 bg-white px-4 py-4 text-black shadow-[0_14px_34px_rgba(0,0,0,0.14)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-[12px] font-light leading-5 text-black/70 sm:text-sm">
          Usamos cookies y datos de navegacion para mejorar tu experiencia. Revisa nuestras{" "}
          <Link
            href="/politica-de-privacidad"
            className="font-medium text-black underline underline-offset-4"
          >
            politicas de privacidad
          </Link>{" "}
          y de{" "}
          <Link
            href="/politica-de-cookies"
            className="font-medium text-black underline underline-offset-4"
          >
            cookies
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={acceptCookieNotice}
          className="inline-flex h-10 shrink-0 items-center justify-center border border-black bg-black px-7 text-[11px] font-light uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#3d3d3d] sm:h-11"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
