"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  EnvelopeSimple,
  FacebookLogo,
  InstagramLogo,
  MapPin,
  Phone,
  TiktokLogo,
} from "@phosphor-icons/react";

const frequentLinks = [
  { label: "Sobre Nosotros", href: "/nosotros" },
  { label: "Preguntas Frecuentes", href: "/preguntas-frecuentes" },
  { label: "Terminos y Condiciones", href: "/terminos-y-condiciones" },
  { label: "Politica de Privacidad", href: "/politica-de-privacidad" },
  { label: "Politica de Cookies", href: "/politica-de-cookies" },
  { label: "Libro de Reclamaciones (Peru)", href: "/libro-de-reclamaciones" },
];

const socialLinks = [
  { label: "Facebook", href: "https://www.facebook.com/KIMENTS1/", icon: FacebookLogo },
  { label: "Instagram", href: "https://www.instagram.com/kiments.pe/?hl=es", icon: InstagramLogo },
  { label: "TikTok", href: "https://www.tiktok.com/@kiments", icon: TiktokLogo },
];

const contactItems = [
  {
    icon: MapPin,
    text: "Jr. Huánuco 1705-1707\nLa Victoria 15018, Peru",
  },
  {
    icon: Phone,
    text: "+51 933918047",
  },
  {
    icon: EnvelopeSimple,
    text: "[Próximamente...]",
  },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/pago" || pathname.startsWith("/pago/") || pathname === "/carrito") {
    return null;
  }

  return (
    <footer className="bg-[#3c3c3b] px-7 pb-8 pt-12 text-white sm:px-10 lg:px-16 xl:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[1fr_1fr_1fr] md:gap-16 xl:gap-24">
          <div>
            <Link href="/" aria-label="KIMENTS inicio" className="inline-flex flex-col leading-none">
              <span className="font-[family-name:var(--font-kiments)] text-[34px] font-light tracking-[0.14em]">
                KIMENTS
              </span>
              <span className="mt-2 text-[9px] font-light uppercase tracking-[0.18em]">
                TIENDA DE ROPA
              </span>
            </Link>

            <div className="mt-8 flex items-center gap-5">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex size-8 items-center justify-center rounded-full border border-white/90 text-white transition-colors hover:bg-white hover:text-[#3c3c3b]"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon size={20} weight="regular" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-light uppercase">Enlaces Frecuentes</h2>
            <nav className="mt-8 flex flex-col gap-7">
              {frequentLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-light text-white/95 transition-colors hover:text-white/70"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-base font-light uppercase">Contactanos</h2>
            <div className="mt-8 flex flex-col gap-7">
              {contactItems.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-5 text-sm font-light leading-tight">
                  <Icon className="mt-0.5 shrink-0 text-white/85" size={19} weight="thin" />
                  <span className="whitespace-pre-line">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-16 text-[12px] font-light text-white/75">
          @ 2026 KIMENTS. Todos los derechos reservados. Diseñado por Nobitex.
        </p>
      </div>
    </footer>
  );
}
