import Image from "next/image";
import Link from "next/link";
import { Eye, ShoppingCartSimple } from "@phosphor-icons/react/dist/ssr";
import { HeroCarousel } from "@/components/HeroCarousel";
import { InstagramCarousel } from "@/components/InstagramCarousel";

const featuredProducts = [
  {
    name: "CAMISA M/LARGA VIENA",
    price: "S/. 149.90",
    image: "/img/productos/Producto01.jpg",
    swatch: "#6c6463",
    position: "center",
  },
  {
    name: "CAMISA M/LARGA VIENA",
    price: "S/. 149.90",
    image: "/img/productos/Producto03.jpg",
    swatch: "#7f2448",
    position: "center",
  },
  {
    name: "CAMISA M/LARGA VIENA",
    price: "S/. 149.90",
    image: "/img/productos/Producto02.jpg",
    swatch: "#1f2230",
    position: "center",
  },
];

const bestSellerProducts = [
  {
    name: "BLUSA IMARA ACERO/NEGRO",
    price: "S/. 249.00",
    image: "/img/productos/Producto02.jpg",
    swatch: "#69747d",
    position: "center",
  },
  {
    name: "BLUSA IMARA IVORY/NEGRO",
    price: "S/. 249.00",
    image: "/img/productos/Producto01.jpg",
    swatch: "#f4f1ea",
    position: "center",
    soldOut: true,
  },
  {
    name: "BLUSA IMARA VERDE/NEGRO",
    price: "S/. 249.00",
    image: "/img/productos/Producto03.jpg",
    swatch: "#10a524",
    position: "center",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroCarousel />

      <section className="bg-white px-7 py-12 text-[#242424] sm:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-12 lg:gap-16">
            {featuredProducts.map((product) => (
              <article key={product.swatch} className="min-w-0">
                <div className="group relative aspect-[3/4] w-full overflow-hidden bg-[#eee9e2]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 30vw, 86vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: product.position }}
                  />
                  <div className="absolute inset-x-0 bottom-5 flex translate-y-3 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Link
                      href="/producto"
                      aria-label="Ver producto"
                      className="flex size-8 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white"
                    >
                      <Eye size={18} weight="regular" />
                    </Link>
                    <button
                      type="button"
                      aria-label="Agregar al carrito"
                      className="flex size-8 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white"
                    >
                      <ShoppingCartSimple size={18} weight="regular" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    aria-label="Color disponible"
                    className="block size-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
                    style={{ backgroundColor: product.swatch }}
                  />
                  <h2 className="mt-3 text-[12px] font-normal uppercase leading-tight tracking-[0.02em]">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-[12px] leading-none">{product.price}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/categorias"
              className="inline-flex h-10 min-w-28 items-center justify-center   bg-[#3d3d3d] px-8 text-[11px] font-semibold uppercase tracking-[0.04em] text-white transition-colors hover:bg-black"
            >
              Ver mas
            </Link>
          </div>
        </div>
      </section>

      <section className="relative min-h-[460px] overflow-hidden bg-black sm:min-h-[560px] lg:min-h-[640px]">
        <video
          className="absolute inset-0 size-full object-cover"
          src="/Video/Video.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          Tu navegador no puede reproducir este video.
        </video>
        <div className="absolute inset-0 bg-black/28" />
      </section>

      <section className="bg-white px-7 py-14 text-[#242424] sm:px-10 lg:px-16 xl:px-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-light uppercase tracking-[0.12em] sm:text-3xl">
            Productos mas vendidos
          </h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-12 lg:gap-16">
            {bestSellerProducts.map((product) => (
              <article key={product.name} className="min-w-0">
                <div className="group relative aspect-[3/4] w-full overflow-hidden bg-[#eee9e2]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 28vw, (min-width: 640px) 30vw, 86vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: product.position }}
                  />
                  {product.soldOut ? (
                    <span className="absolute left-4 top-4 bg-black px-4 py-2 text-[11px] font-light uppercase tracking-[0.08em] text-white">
                      Agotado
                    </span>
                  ) : null}
                  <div className="absolute inset-x-0 bottom-5 flex translate-y-3 items-center justify-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <Link
                      href="/producto"
                      aria-label="Ver producto"
                      className="flex size-8 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white"
                    >
                      <Eye size={18} weight="regular" />
                    </Link>
                    <button
                      type="button"
                      aria-label="Agregar al carrito"
                      className="flex size-8 items-center justify-center bg-white text-black shadow-sm transition-colors hover:bg-black hover:text-white"
                    >
                      <ShoppingCartSimple size={18} weight="regular" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <span
                    aria-label="Color disponible"
                    className="block size-4 rounded-full border border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
                    style={{ backgroundColor: product.swatch }}
                  />
                  <h3 className="mt-3 text-[12px] font-normal uppercase leading-tight tracking-[0.02em]">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-[12px] leading-none">{product.price}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <InstagramCarousel />
    </main>
  );
}
