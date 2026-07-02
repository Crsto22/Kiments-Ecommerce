import { NosotrosCta } from "../../components/nosotros/NosotrosCta";
import { NosotrosEssence } from "../../components/nosotros/NosotrosEssence";
import { NosotrosHero } from "../../components/nosotros/NosotrosHero";
import { NosotrosStore } from "../../components/nosotros/NosotrosStore";
import { NosotrosValues } from "../../components/nosotros/NosotrosValues";

export const metadata = {
  title: "Nosotros | KIMENTS",
  description: "Conoce la esencia y el proposito detras de KIMENTS.",
};

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-white">
      <NosotrosHero />
      <NosotrosEssence />
      <NosotrosValues />
      <NosotrosStore />
      <NosotrosCta />
    </main>
  );
}
