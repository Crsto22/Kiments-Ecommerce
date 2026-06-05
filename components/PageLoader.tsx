"use client";

import { useEffect, useState } from "react";
import { KimentsLoader } from "@/components/KimentsLoader";

const LOADER_DURATION = 620;

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsVisible(false);
    }, LOADER_DURATION);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      aria-live="polite"
      aria-busy={isVisible}
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-white transition-all duration-300 ${
        isVisible
          ? "opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <KimentsLoader />
    </div>
  );
}
