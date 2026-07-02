import { TermsContent } from "@/components/terminos-y-condiciones/TermsContent";
import { TermsCta } from "@/components/terminos-y-condiciones/TermsCta";
import { TermsHero } from "@/components/terminos-y-condiciones/TermsHero";

export const metadata = {
  title: "Términos y Condiciones | KIMENTS",
  description: "Términos y condiciones de uso de la tienda virtual KIMENTS.",
};

export default function TerminosYCondicionesPage() {
  return (
    <main className="min-h-screen bg-white">
      <TermsHero />
      <TermsContent />
      <TermsCta />
    </main>
  );
}
