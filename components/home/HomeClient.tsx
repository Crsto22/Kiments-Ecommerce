"use client";

import { Hero } from "@/components/Hero";
import { InstagramCarousel } from "@/components/InstagramCarousel";
import { ProductCarousel } from "@/components/ProductCarousel";
import { HomeBestSellers } from "@/components/home/HomeBestSellers";
import { HomeComboOffers } from "@/components/home/HomeComboOffers";
import { HomeProductStories } from "@/components/home/HomeProductStories";
import { HomeStateSections } from "@/components/home/HomeStateSections";
import { HomeVideoSection } from "@/components/home/HomeVideoSection";
import { useHomeData } from "@/components/home/useHomeData";

export function HomeClient() {
  const {
    aleatorios,
    combos,
    error,
    imagenesProductos,
    loading,
    masVendidos,
    portadas,
    tiendaConfigurada,
  } = useHomeData();
  const canShowStoreContent = !loading && !error && tiendaConfigurada;

  return (
    <main className="min-h-screen bg-white">
      <h1 className="sr-only">KIMENTS, tienda oficial de ropa para mujer en Peru</h1>
      <Hero portadas={portadas} />
      <HomeProductStories
        imagenesProductos={imagenesProductos}
        visible={canShowStoreContent && imagenesProductos.length > 0}
      />
      <HomeStateSections
        error={error}
        loading={loading}
        tiendaConfigurada={tiendaConfigurada}
      />
      {canShowStoreContent && aleatorios.length > 0 && (
        <section className="bg-white px-6 py-10 text-[#242424]">
          <ProductCarousel items={aleatorios} />
        </section>
      )}
      <HomeVideoSection />
      <HomeBestSellers items={masVendidos} visible={canShowStoreContent && masVendidos.length > 0} />
      <HomeComboOffers combos={combos} visible={canShowStoreContent && combos.length > 0} />
      <InstagramCarousel />
    </main>
  );
}
