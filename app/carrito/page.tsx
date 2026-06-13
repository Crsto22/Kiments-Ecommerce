import Link from "next/link";
import { CartContent } from "@/components/CartContent";

export default function CarritoPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#f7f1f3] text-[#171717]">
      <section className="flex-1">
        <div className="mx-auto max-w-2xl">
          <CartContent
            backHref="/productos"
            backLabel="Productos"
            footer={
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/pago"
                  className="flex h-[52px] w-full items-center justify-center bg-black text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-black/80"
                >
                  Ir a Pagar
                </Link>
                <Link
                  href="/productos"
                  className="flex items-center justify-center text-[11px] font-light uppercase tracking-widest text-black/50 transition-all hover:text-black hover:underline underline-offset-4"
                >
                  Seguir comprando
                </Link>
              </div>
            }
          />
        </div>
      </section>
    </main>
  );
}
